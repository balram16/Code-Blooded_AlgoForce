import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Box, 
    Container, 
    Typography, 
    Button, 
    Grid, 
    Card, 
    CardContent, 
    CardActions, 
    Chip,
    AppBar,
    Toolbar, 
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Snackbar,
    Alert,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    InputAdornment
} from '@mui/material';
import { 
    Menu as MenuIcon,
    Person as PersonIcon,
    Logout as LogoutIcon,
    Search as SearchIcon,
    ShoppingCart as ShoppingCartIcon,
    Send as SendIcon,
    History as HistoryIcon,
    Storefront as StorefrontIcon,
    Receipt as ReceiptIcon,
    Dashboard as DashboardIcon,
    AccountCircle as AccountCircleIcon,
    FilterList as FilterListIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { Contract, BrowserProvider } from "ethers";

// Replace with your actual contract address and ABI
const CONTRACT_ADDRESS = "0xd6B17407713602eCBbC1eDCa66B2ec8Dc8aB4B06";
const contractABI = [
    // Include the ABI for all functions the broker dashboard will use
    // This should include getUserProfile, getAllListings, etc.
    {
        "inputs": [{"internalType": "address", "name": "_userAddress", "type": "address"}],
        "name": "getUserProfile",
        "outputs": [
            {"internalType": "string", "name": "", "type": "string"},
            {"internalType": "string", "name": "", "type": "string"},
            {"internalType": "string", "name": "", "type": "string"},
            {"internalType": "string", "name": "", "type": "string"},
            {"internalType": "enum FarmerPortal.UserRole", "name": "", "type": "uint8"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllListings",
        "outputs": [
            {
                "components": [
                    {"internalType": "string", "name": "cropName", "type": "string"},
                    {"internalType": "uint256", "name": "price", "type": "uint256"},
                    {"internalType": "uint256", "name": "cropID", "type": "uint256"},
                    {"internalType": "uint256", "name": "quantity", "type": "uint256"},
                    {"internalType": "string", "name": "deliveryDate", "type": "string"},
                    {"internalType": "address", "name": "farmer", "type": "address"},
                    {"internalType": "string", "name": "imageCID", "type": "string"}
                ],
                "internalType": "struct FarmerPortal.CropListing[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Helper function to get IPFS Gateway URL
const getIPFSGatewayURL = (cid) => {
    if (!cid) return null;
    return `https://ipfs.io/ipfs/${cid}`;
};

function BrokerDashboard({ account }) {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [contract, setContract] = useState(null);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [farmerRequests, setFarmerRequests] = useState([]);
    const [buyerRequests, setBuyerRequests] = useState([]);
    const [allTransactions, setAllTransactions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Initialize contract
    useEffect(() => {
        const initContract = async () => {
            try {
                if (window.ethereum) {
                    const provider = new BrowserProvider(window.ethereum);
                    const contractInstance = new Contract(CONTRACT_ADDRESS, contractABI, provider);
                    setContract(contractInstance);
                    
                    try {
                        // Load user profile
                        const userProfile = await contractInstance.getUserProfile(account);
                        setUserName(userProfile[0] || "Broker");
                    } catch (profileError) {
                        console.error("Error fetching user profile:", profileError);
                        setUserName("Broker"); // Set a default value
                    }
                } else {
                    setError("Ethereum wallet not detected. Please install MetaMask.");
                }
            } catch (error) {
                console.error("Error initializing contract:", error);
                setError("Failed to initialize contract. Please refresh the page.");
            } finally {
                // Ensure loading state is reset even if there's an error
                setLoading(false);
            }
        };

        if (account) {
            setLoading(true);
            initContract();
        }
    }, [account]);

    // Fetch data
    useEffect(() => {
        if (contract) {
            Promise.all([
                fetchListings().catch(err => {
                    console.error("Failed to fetch listings:", err);
                    setCrops([]); // Reset to empty array on error
                }),
                fetchTransactions().catch(err => {
                    console.error("Failed to fetch transactions:", err);
                    setAllTransactions([]); // Reset to empty array on error
                })
            ]);
        }
    }, [contract]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const listings = await contract.getAllListings();
            
            // Enrich the listings with additional data
            const enrichedListings = await Promise.all(listings.map(async (listing) => {
                try {
                    // Get farmer name
                    let farmerName = "Unknown Farmer";
                    try {
                        const farmerProfile = await contract.getUserProfile(listing.farmer);
                        farmerName = farmerProfile[0] || "Unknown Farmer";
                    } catch (error) {
                        console.error("Error getting farmer name:", error);
                    }
                    
                    // Convert price from wei to ether - with safe conversion
                    let priceInEth = '0';
                    try {
                        // Handle if price is BigInt or undefined safely
                        if (listing.price) {
                            const priceNum = typeof listing.price === 'bigint' 
                                ? Number(listing.price.toString()) / 1e18
                                : Number(listing.price) / 1e18;
                            priceInEth = priceNum.toString();
                        }
                    } catch (priceError) {
                        console.error("Error converting price:", priceError);
                    }
                    
                    // Get image URL if available
                    const imageUrl = listing.imageCID 
                        ? getIPFSGatewayURL(listing.imageCID) 
                        : null;
                    
                    return {
                        ...listing,
                        farmerName,
                        priceInEth,
                        imageUrl
                    };
                } catch (err) {
                    console.error("Error processing listing:", err);
                    // Return a minimal valid object for this listing to avoid breaking the UI
                    return {
                        ...listing,
                        farmerName: "Unknown",
                        priceInEth: "0",
                        imageUrl: null
                    };
                }
            }));
            
            setCrops(enrichedListings);
        } catch (error) {
            console.error("Error fetching listings:", error);
            setError("Failed to fetch crop listings. Please try again.");
            // Set crops to empty array so UI can handle empty state properly
            setCrops([]);
        } finally {
            setLoading(false);
        }
    };
    
    const fetchTransactions = async () => {
        try {
            // Placeholder - implement actual transaction fetching
            setAllTransactions([]);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            setAllTransactions([]);
        }
    };
    
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchListings();
        await fetchTransactions();
        setRefreshing(false);
        setSuccess("Data refreshed successfully");
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleLogout = () => {
        navigate("/");
    };

    const handleProfileClick = () => {
        navigate("/profile");
    };

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    // Safe access for filteredCrops to avoid null/undefined errors
    const filteredCrops = crops && Array.isArray(crops) 
        ? crops.filter(crop => 
            crop && crop.cropName && crop.cropName.toLowerCase().includes((searchTerm || '').toLowerCase())
        )
        : [];

    // Function to handle connecting farmers and buyers
    const handleConnect = (crop) => {
        setSelectedCrop(crop);
        setDialogOpen(true);
    };
    
    const handleCloseDialog = () => {
        setDialogOpen(false);
    };
    
    const formatEthPrice = (price) => {
        if (!price) return "0";
        try {
            return price.toString();
        } catch (e) {
            return "0";
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* App Bar */}
            <AppBar position="static">
                <Toolbar>
                    <IconButton 
                        color="inherit" 
                        edge="start" 
                        onClick={toggleDrawer}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Broker Dashboard
                    </Typography>
                    <Button 
                        color="inherit" 
                        startIcon={<PersonIcon />}
                        onClick={handleProfileClick}
                    >
                        {userName}
                    </Button>
                    <Button 
                        color="inherit" 
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Side Drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer}
                sx={{
                    width: 240,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 240,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" align="center">
                        Farm Assure
                    </Typography>
                </Box>
                <Divider />
                <List>
                    <ListItem button selected={tabValue === 0} onClick={() => setTabValue(0)}>
                        <ListItemIcon>
                            <DashboardIcon />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItem>
                    <ListItem button selected={tabValue === 1} onClick={() => setTabValue(1)}>
                        <ListItemIcon>
                            <StorefrontIcon />
                        </ListItemIcon>
                        <ListItemText primary="Marketplace" />
                    </ListItem>
                    <ListItem button selected={tabValue === 2} onClick={() => setTabValue(2)}>
                        <ListItemIcon>
                            <HistoryIcon />
                        </ListItemIcon>
                        <ListItemText primary="Transactions" />
                    </ListItem>
                </List>
                <Divider />
                <List>
                    <ListItem button onClick={handleProfileClick}>
                        <ListItemIcon>
                            <AccountCircleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Profile" />
                    </ListItem>
                    <ListItem button onClick={handleLogout}>
                        <ListItemIcon>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItem>
                </List>
            </Drawer>

            {/* Main Content */}
            <Box sx={{ 
                flexGrow: 1, 
                padding: 3, 
                background: '#f5f5f5',
                minHeight: 'calc(100vh - 64px)'
            }}>
                <Container maxWidth="lg">
                    {error && (
                        <Snackbar 
                            open={!!error} 
                            autoHideDuration={6000} 
                            onClose={() => setError(null)}
                            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        >
                            <Alert onClose={() => setError(null)} severity="error">
                                {error}
                            </Alert>
                        </Snackbar>
                    )}

                    {success && (
                        <Snackbar 
                            open={!!success} 
                            autoHideDuration={3000} 
                            onClose={() => setSuccess(null)}
                            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        >
                            <Alert onClose={() => setSuccess(null)} severity="success">
                                {success}
                            </Alert>
                        </Snackbar>
                    )}

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="broker dashboard tabs">
                            <Tab label="Dashboard" id="dashboard-tab" />
                            <Tab label="Marketplace" id="marketplace-tab" />
                            <Tab label="Transactions" id="transactions-tab" />
                        </Tabs>
                    </Box>

                    {/* Tab Panels */}
                    {tabValue === 0 && (
                        <Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h5">
                                            Welcome, {userName || "Broker"}!
                                        </Typography>
                                        <Button 
                                            variant="contained" 
                                            startIcon={<RefreshIcon />}
                                            onClick={handleRefresh}
                                            disabled={refreshing || loading}
                                        >
                                            {refreshing || loading ? 'Refreshing...' : 'Refresh Data'}
                                        </Button>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                Available Crops
                                            </Typography>
                                            <Typography variant="h4">
                                                {crops.length}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                Active Transactions
                                            </Typography>
                                            <Typography variant="h4">
                                                {allTransactions.length}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                Total Commission
                                            </Typography>
                                            <Typography variant="h4">
                                                0 ETH
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {tabValue === 1 && (
                        <Box>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 2, mb: 3 }}>
                                        <TextField
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Search crops..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Paper>
                                </Grid>

                                {loading ? (
                                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <CircularProgress />
                                    </Grid>
                                ) : filteredCrops.length === 0 ? (
                                    <Grid item xs={12}>
                                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                                            <Typography variant="h6">No crops found</Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Try adjusting your search or check back later
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ) : (
                                    filteredCrops.map((crop, index) => (
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                {crop.imageUrl && (
                                                    <Box sx={{ 
                                                        height: 200, 
                                                        backgroundImage: `url(${crop.imageUrl})`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center'
                                                    }} />
                                                )}
                                                <CardContent sx={{ flexGrow: 1 }}>
                                                    <Typography variant="h5" component="h2" gutterBottom>
                                                        {crop.cropName}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                                        Farmer: {crop.farmerName || "Unknown"}
                                                    </Typography>
                                                    <Typography variant="h6" gutterBottom>
                                                        {formatEthPrice(crop.priceInEth)} ETH per unit
                                                    </Typography>
                                                    <Typography>
                                                        Quantity: {crop.quantity.toString()} units
                                                    </Typography>
                                                    <Typography>
                                                        Delivery: {crop.deliveryDate}
                                                    </Typography>
                                                </CardContent>
                                                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                                                    <Button 
                                                        variant="contained" 
                                                        color="primary"
                                                        onClick={() => handleConnect(crop)}
                                                        startIcon={<SendIcon />}
                                                    >
                                                        Connect Buyers & Sellers
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))
                                )}
                            </Grid>
                        </Box>
                    )}

                    {tabValue === 2 && (
                        <Box>
                            <Paper sx={{ p: 2, mb: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Transaction History
                                </Typography>
                                {allTransactions.length === 0 ? (
                                    <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
                                        No transactions yet
                                    </Typography>
                                ) : (
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell>Crop</TableCell>
                                                    <TableCell>Farmer</TableCell>
                                                    <TableCell>Buyer</TableCell>
                                                    <TableCell>Quantity</TableCell>
                                                    <TableCell>Amount</TableCell>
                                                    <TableCell>Commission</TableCell>
                                                    <TableCell>Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {allTransactions.map((tx, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{tx.date}</TableCell>
                                                        <TableCell>{tx.crop}</TableCell>
                                                        <TableCell>{tx.farmer}</TableCell>
                                                        <TableCell>{tx.buyer}</TableCell>
                                                        <TableCell>{tx.quantity}</TableCell>
                                                        <TableCell>{tx.amount}</TableCell>
                                                        <TableCell>{tx.commission}</TableCell>
                                                        <TableCell>
                                                            <Chip 
                                                                label={tx.status} 
                                                                color={
                                                                    tx.status === 'Completed' ? 'success' : 
                                                                    tx.status === 'Pending' ? 'warning' : 'default'
                                                                }
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Paper>
                        </Box>
                    )}
                </Container>
            </Box>

            {/* Connect Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Connect Buyers to Seller</DialogTitle>
                <DialogContent>
                    {selectedCrop && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                {selectedCrop.cropName}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Farmer: {selectedCrop.farmerName}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Price: {formatEthPrice(selectedCrop.priceInEth)} ETH per unit
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Available Quantity: {selectedCrop.quantity.toString()} units
                            </Typography>
                            
                            <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                                Connect with potential buyers
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                As a broker, you can help connect farmers with buyers and earn a commission.
                                This feature is under development.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Close</Button>
                    <Button 
                        variant="contained" 
                        color="primary"
                        disabled={true} // Placeholder for future implementation
                    >
                        Connect Parties
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default BrokerDashboard; 