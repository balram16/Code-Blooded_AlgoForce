import React, { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
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
    TextField, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    AppBar, 
    Toolbar, 
    IconButton, 
    MenuItem, 
    Select, 
    FormControl, 
    InputLabel,
    Paper,
    Chip,
    Avatar,
    CircularProgress,
    Divider,
    Alert,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    FormControlLabel,
    Switch,
    InputAdornment,
    AlertTitle,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CardMedia,
    Checkbox
} from '@mui/material';

import { 
    ShoppingCart as ShoppingCartIcon, 
    Logout as LogoutIcon, 
    Person as PersonIcon, 
    FilterList as FilterListIcon,
    AttachMoney as AttachMoneyIcon,
    CalendarMonth as CalendarMonthIcon,
    Inventory as InventoryIcon,
    LocalShipping as LocalShippingIcon,
    CheckCircle as CheckCircleIcon,
    Search as SearchIcon,
    PriorityHigh as PriorityHighIcon,
    Inbox as InboxIcon,
    ShoppingBasket as ShoppingBasketIcon,
    Cancel as CancelIcon,
    Refresh as RefreshIcon,
    AccountBalanceWallet as AccountBalanceWalletIcon,
    ArrowBack as ArrowBackIcon,
    History as HistoryIcon,
    Wifi as WifiIcon,
    Sync as SyncIcon
} from '@mui/icons-material';

import { getIPFSGatewayURL } from '../services/pinataService';
import { getUserDisplayName, getProfileImageUrl, getUserProfile } from '../services/profileService';
import { motion } from "framer-motion";
import { useTheme } from "../components/theme-provider";
import { ThemeToggle } from "../components/theme-toggle";

const CONTRACT_ADDRESS = "0x8805E08E5e795F02A60505a41af0b13FE996B216"; // Replace with your deployed contract address
const CONTRACT_ABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "cropID",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountHeld",
          "type": "uint256"
        }
      ],
      "name": "CropBought",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "cropName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "cropID",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "deliveryDate",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "imageCID",
          "type": "string"
        }
      ],
      "name": "CropListed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "cropID",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountReleased",
          "type": "uint256"
        }
      ],
      "name": "DeliveryConfirmed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "farmer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "cropID",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        }
      ],
      "name": "PurchaseRequested",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum FarmerPortal.RequestStatus",
          "name": "status",
          "type": "uint8"
        }
      ],
      "name": "RequestStatusChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "profileImageCID",
          "type": "string"
        }
      ],
      "name": "UserProfileUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "enum FarmerPortal.UserRole",
          "name": "role",
          "type": "uint8"
        }
      ],
      "name": "UserRegistered",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "escrowBalances",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "users",
      "outputs": [
        {
          "internalType": "address",
          "name": "wallet",
          "type": "address"
        },
        {
          "internalType": "enum FarmerPortal.UserRole",
          "name": "role",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "registered",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "profileImageCID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "location",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "contact",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "role",
          "type": "uint8"
        }
      ],
      "name": "registerUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_profileImageCID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_location",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_contact",
          "type": "string"
        }
      ],
      "name": "updateUserProfile",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_userAddress",
          "type": "address"
        }
      ],
      "name": "getUserProfile",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "enum FarmerPortal.UserRole",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_cropName",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_price",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_cropID",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_quantity",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_deliveryDate",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_imageCID",
          "type": "string"
        }
      ],
      "name": "addListing",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getMyListings",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "cropName",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cropID",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "quantity",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "deliveryDate",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "farmer",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "imageCID",
              "type": "string"
            }
          ],
          "internalType": "struct FarmerPortal.CropListing[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_user",
          "type": "address"
        }
      ],
      "name": "getUserRole",
      "outputs": [
        {
          "internalType": "enum FarmerPortal.UserRole",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getAllListings",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "cropName",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cropID",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "quantity",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "deliveryDate",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "farmer",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "imageCID",
              "type": "string"
            }
          ],
          "internalType": "struct FarmerPortal.CropListing[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "cropID",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "quantity",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "message",
          "type": "string"
        }
      ],
      "name": "requestPurchase",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "accept",
          "type": "bool"
        }
      ],
      "name": "respondToPurchaseRequest",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        }
      ],
      "name": "completePurchase",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [],
      "name": "getFarmerRequests",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "requestId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cropID",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "quantity",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "buyer",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "farmer",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "enum FarmerPortal.RequestStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "string",
              "name": "message",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct FarmerPortal.PurchaseRequest[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getBuyerRequests",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "requestId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "cropID",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "quantity",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "buyer",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "farmer",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "enum FarmerPortal.RequestStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "string",
              "name": "message",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            }
          ],
          "internalType": "struct FarmerPortal.PurchaseRequest[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getPendingDeliveries",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "cropID",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "quantity",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "buyer",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "farmer",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amountHeld",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "delivered",
              "type": "bool"
            }
          ],
          "internalType": "struct FarmerPortal.Purchase[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "cropID",
          "type": "uint256"
        }
      ],
      "name": "confirmDelivery",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "cropId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "bidPriceWei",
          "type": "uint256"
        }
      ],
      "name": "placeBid",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "cropId",
          "type": "uint256"
        }
      ],
      "name": "getBidsForCrop",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        },
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

function BuyerDashboard({ account }) {
    const navigate = useNavigate();
    const [localAccount, setLocalAccount] = useState(account);
    const { theme } = useTheme();
    const [contract, setContract] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [crops, setCrops] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
    const [buyerOrders, setBuyerOrders] = useState([]);
    const [purchaseRequests, setPurchaseRequests] = useState([]);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [purchaseQuantity, setPurchaseQuantity] = useState("");
    const [requestMessage, setRequestMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [buyerName, setBuyerName] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [bidPrice, setBidPrice] = useState("");
    const [bidEnabled, setBidEnabled] = useState(false);
    const [emergencyTabMode, setEmergencyTabMode] = useState(false);
    const [bidDialogOpen, setBidDialogOpen] = useState(false);
    const [bidAmount, setBidAmount] = useState("");
    const [bidHistory, setBidHistory] = useState([]);
    const [cropHighestBids, setCropHighestBids] = useState({});
    
        // Update helper function to check if crop is in valid bidding window
        const isWithinBiddingWindow = (crop) => {
            try {
                if (!crop || !crop.deliveryDate) {
                    console.log("No delivery date available for crop bidding window check");
                    return false;
                }
                
                // Parse the cultivation/delivery date from the crop
                const deliveryDate = new Date(crop.deliveryDate);
                const currentDate = new Date();
                
                // Calculate the bidding window: 
                // Bidding is allowed from 2 months before delivery date until 15 days before delivery date
                const biddingStartDate = new Date(deliveryDate);
                biddingStartDate.setMonth(deliveryDate.getMonth() - 2); // 2 months before delivery
                
                const biddingEndDate = new Date(deliveryDate);
                biddingEndDate.setDate(deliveryDate.getDate() - 15); // 15 days before delivery
                
                // Check if current date is within the bidding window
                const isInWindow = currentDate >= biddingStartDate && currentDate <= biddingEndDate;
                
                console.log(`Crop ${crop.cropID} bidding window: ${biddingStartDate.toLocaleDateString()} to ${biddingEndDate.toLocaleDateString()}, Current date: ${currentDate.toLocaleDateString()}, In window: ${isInWindow}`);
                
                return isInWindow;
            } catch (error) {
                console.error("Error checking bidding window:", error);
                return false;
            }
        };
    
        // Update function to format the bidding window for display
        const formatBiddingWindow = (crop) => {
            try {
                if (!crop || !crop.deliveryDate) {
                    return "No bidding window available";
                }
                
                const deliveryDate = new Date(crop.deliveryDate);
                
                const biddingStartDate = new Date(deliveryDate);
                biddingStartDate.setMonth(deliveryDate.getMonth() - 2); // 2 months before delivery
                
                const biddingEndDate = new Date(deliveryDate);
                biddingEndDate.setDate(deliveryDate.getDate() - 15); // 15 days before delivery
                
                return `${biddingStartDate.toLocaleDateString()} to ${biddingEndDate.toLocaleDateString()}`;
            } catch (error) {
                console.error("Error formatting bidding window:", error);
                return "Error calculating bidding window";
            }
        };

    useEffect(() => {
        const init = async () => {
            if (!account) {
                console.log("No account provided, checking localStorage for account");
            }
            const result = await initializeContract();
            
            // Force refresh to ensure we have the latest data and crops
            if (result) {
                console.log("Contract initialized successfully, forcing refresh of data");
                
                // First clear any existing crops
                setCrops([]);
                
                // Then reset and refresh removed crops
                resetAndRefreshRemovedCrops();
                
                // Small delay to ensure localStorage sync is complete
                setTimeout(() => {
                    fetchListings();
                }, 300);
            }
        };
        
        init();
        
        // Listen for account changes
            if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                console.log("Account changed, refreshing...");
                setLocalAccount(accounts[0]);
                
                // Re-initialize with new account
                init();
            });
        }
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Refresh data when contract changes
    useEffect(() => {
        if (contract && localAccount) {
            fetchListings();
            fetchPurchaseRequests();
        }
    }, [contract, localAccount]);

    // Fetch buyer orders when tab changes to My Purchases
    useEffect(() => {
        if (tabValue === 2) {
            // Reset emergency mode on each tab change
            setEmergencyTabMode(false);
            
            // Only try to fetch data if we have the prerequisites
            if (contract && localAccount) {
                // Wrap in try/catch to ensure UI always renders even with errors
                try {
                    fetchBuyerOrders()
                        .then(() => {
                            console.log("Successfully loaded purchases tab data");
                        })
                        .catch(error => {
                            console.error("Error in fetchBuyerOrders:", error);
                            setSnackbar({
                                open: true,
                                message: "Error loading purchases. Showing limited view.",
                                severity: 'warning'
                            });
                            // Enable emergency mode if data fetching fails
                            setEmergencyTabMode(true);
                        });
                    
            // Call debug function to help troubleshoot
            debugContractState();
                } catch (error) {
                    console.error("Error setting up My Purchases tab:", error);
                    setSnackbar({
                        open: true,
                        message: "Error accessing blockchain data. Showing limited view.",
                        severity: 'warning'
                    });
                    // Enable emergency mode
                    setEmergencyTabMode(true);
                }
            } else {
                console.log("Missing prerequisites for purchases tab. Contract:", !!contract, "Account:", !!localAccount);
                setEmergencyTabMode(true);
                setSnackbar({
                    open: true,
                    message: "Blockchain connection unavailable. Showing limited view.",
                    severity: 'warning'
                });
            }
        }
    }, [tabValue, contract, localAccount]);

    useEffect(() => {
        if (account) {
            loadBuyerProfile();
        }
    }, [account]);

    // Effect to restore the previously selected tab
    useEffect(() => {
        try {
            const savedTab = localStorage.getItem('buyerDashboardActiveTab');
            if (savedTab !== null) {
                const tabIndex = parseInt(savedTab, 10);
                if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 2) {
                    console.log("Restoring previously selected tab:", tabIndex);
                    setTabValue(tabIndex);
                }
            }
        } catch (error) {
            console.error("Error restoring tab from localStorage:", error);
            // Default to first tab if there's an error
            setTabValue(0);
        }
    }, []);

    // Effect to load data when tab changes
    useEffect(() => {
        // Don't load on initial mount since we have a separate init effect
        if (tabValue === undefined) return;
        
        console.log("Tab changed effect triggered for tab:", tabValue);
        
        // Available Crops tab
        if (tabValue === 0) {
            if (!loading) {
                console.log("Loading data for Available Crops tab");
                setLoading(true);
                fetchListings()
                    .finally(() => setLoading(false));
            }
        }
        // My Requests tab - load once contract is initialized
        else if (tabValue === 1 && contract && localAccount) {
            if (!loading) {
                console.log("Loading data for My Requests tab");
                setLoading(true);
                fetchPurchaseRequests()
                    .catch(error => {
                        console.error("Error loading purchase requests in tab effect:", error);
                        setSnackbar({
                            open: true,
                            message: "Could not load your requests. Please check your wallet connection.",
                            severity: 'warning'
                        });
                    })
                    .finally(() => setLoading(false));
            }
        }
        // My Purchases tab - more permissive access conditions with fallbacks
        else if (tabValue === 2) {
            if (!loading) {
                console.log("Loading data for My Purchases tab");
                setLoading(true);
                
                // Check if web3 is available directly in the window object as fallback
                const hasWeb3 = contract || window.web3 || (typeof window.ethereum !== 'undefined');
                const hasAccount = localAccount || account;
                
                if (hasWeb3 && hasAccount) {
                    // If contract isn't initialized yet but we have Web3, try to initialize it
                    if (!contract && typeof window.ethereum !== 'undefined') {
                        console.log("Attempting to initialize contract for My Purchases tab...");
                        
                        // First try to initialize contract
                        initializeContract()
                            .then(() => fetchBuyerOrders())
                            .catch(error => {
                                console.error("Error initializing contract for purchases:", error);
                                // Try with minimal data display
                                setBuyerOrders([]);
                                setEmergencyTabMode(true);
                                setSnackbar({
                                    open: true,
                                    message: "Limited functionality - please check your wallet connection.",
                                    severity: 'warning'
                                });
                            })
                            .finally(() => setLoading(false));
                    } else {
                        // Normal path - contract is already initialized
                        fetchBuyerOrders()
                            .catch(error => {
                                console.error("Error loading purchase data:", error);
                                setEmergencyTabMode(true);
                                setSnackbar({
                                    open: true,
                                    message: "Error loading purchases. Some data may be unavailable.",
                                    severity: 'warning'
                                });
                            })
                            .finally(() => setLoading(false));
                    }
                } else {
                    // No web3 or account available - show emergency mode
                    console.warn("No Web3 or account available for My Purchases tab");
                    setBuyerOrders([]);
                    setEmergencyTabMode(true);
                    setSnackbar({
                        open: true,
                        message: "Please connect your wallet to view your purchases.",
                        severity: 'info'
                    });
                    setLoading(false);
                }
            }
        }
    }, [tabValue, contract, localAccount, account]);

        async function loadWeb3AndData() {
        try {
            setLoading(true);
            if (window.ethereum) {
                // Request account access
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                window.web3 = new Web3(window.ethereum);
            } else if (window.web3) {
                window.web3 = new Web3(window.web3.currentProvider);
            } else {
                setSnackbar({
                    open: true,
                    message: "Non-Ethereum browser detected. You should consider trying MetaMask!",
                    severity: 'warning'
                });
                return;
            }

            const web3 = window.web3;
            // Use the account passed as prop if available
            if (!localAccount) {
                const accounts = await web3.eth.getAccounts();
                setLocalAccount(accounts[0]);
            }

        const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            setContract(contract);

            // Load all crops
        try {
            const allCrops = await contract.methods.getAllListings().call();

                // Enrich crops with farmer names
                const enrichedCrops = await Promise.all(allCrops.map(async (crop) => {
                    const farmerName = await getFarmerName(crop.farmer);
                return {
                        ...crop,
                        farmerName
                    };
                }));
                
                setCrops(enrichedCrops);
                } catch (error) {
                console.error("Error loading crops:", error);
                setSnackbar({
                    open: true,
                    message: "Error loading crops. Please try again.",
                    severity: 'error'
                });
            }

            // Load deliveries
            await fetchDeliveries();
        } catch (error) {
            console.error("Error loading blockchain data:", error);
            setSnackbar({
                open: true,
                message: "Error loading blockchain data. Please try again.",
                severity: 'error'
            });
        } finally {
                setLoading(false);
            }
        }

    const fetchDeliveries = async () => {
        try {
            if (!contract || !contract.methods) {
                console.error("Contract not initialized in fetchDeliveries");
                return;
            }
            
            console.log("Fetching deliveries...");
            // Check if the getPendingDeliveries method exists
            if (!contract.methods.getPendingDeliveries) {
                console.warn("getPendingDeliveries method not found, using completed purchases instead");
                // Call fetchBuyerOrders as a fallback to show completed purchases
                await fetchBuyerOrders();
                return;
            }

            const deliveryData = await contract.methods.getPendingDeliveries().call({ from: localAccount });
            console.log("Raw deliveries:", deliveryData);

            // Enrich deliveries with farmer names
            const enrichedDeliveries = await Promise.all(deliveryData.map(async (delivery) => {
                const farmerName = await getFarmerName(delivery.farmer);
                return {
                    ...delivery,
                    farmerName
                };
            }));

            console.log("Enriched deliveries:", enrichedDeliveries);
            setDeliveries(enrichedDeliveries);
        } catch (error) {
            console.error("Error fetching deliveries:", error);
            setSnackbar({
                open: true,
                message: "Error fetching deliveries. Please try again.",
                severity: 'error'
            });
            
            // Try to use fetchBuyerOrders as a fallback
            try {
                await fetchBuyerOrders();
            } catch (innerError) {
                console.error("Fallback to fetchBuyerOrders also failed:", innerError);
            }
        }
    };

    const loadBuyerProfile = async () => {
        try {
            const displayName = await getUserDisplayName(account);
            setBuyerName(displayName);
            
            // Attempt to get the profile image
            const profileImage = await getProfileImageUrl(account);
            if (profileImage) {
                setProfileImageUrl(profileImage);
            }
        } catch (error) {
            console.error("Error loading buyer profile:", error);
        }
    };

    // Function to fetch user profile data from contract
    const fetchUserProfile = async (contractInstance, userAddress) => {
        try {
            if (!contractInstance) contractInstance = contract;
            if (!userAddress) userAddress = localAccount;
            
            console.log("Fetching profile for:", userAddress);
            const profile = await contractInstance.methods.getUserProfile(userAddress).call();
            console.log("User profile data:", profile);
            
            // Profile returns [name, profileImageCID, location, contact, role]
            if (profile && profile.length >= 2) {
                const [name, profileImageCID] = profile;
                setBuyerName(name || "Buyer");
                
                if (profileImageCID) {
                    const imageUrl = getIPFSGatewayURL(profileImageCID);
                    setProfileImageUrl(imageUrl);
                }
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    // Helper function to get crop name from ID
    const getCropName = async (cropId, contractInstance = contract) => {
        try {
            if (!contractInstance || !contractInstance.methods) {
                console.log("Contract not initialized in getCropName");
                return "Unknown";
            }
            
            // Try to find crop in local crops list first
            for (const crop of crops) {
                if (crop && crop.cropID && cropId && crop.cropID.toString() === cropId.toString()) {
                    return crop.cropName;
                }
            }
            
            // If not found locally, try to fetch from contract
            try {
                const cropInfo = await contractInstance.methods.getCrop(cropId).call();
                return cropInfo.cropName || "Unknown";
            } catch (err) {
                console.error("Error fetching crop info from contract:", err);
                return "Unknown";
            }
        } catch (error) {
            console.error("Error in getCropName:", error);
            return "Unknown";
        }
    };
    
    // Helper function to get farmer name
    const getFarmerName = async (farmerAddress, contractInstance = contract) => {
        try {
            if (!contractInstance || !contractInstance.methods) {
                console.log("Contract not initialized in getFarmerName");
                return "Unknown";
            }
            
            // Get the farmer's profile from the contract
            try {
                const farmerProfile = await contractInstance.methods.getUserProfile(farmerAddress).call();
                return farmerProfile.name || "Unknown Farmer";
            } catch (err) {
                console.error("Error fetching farmer profile:", err);
                return "Unknown Farmer";
            }
        } catch (error) {
            console.error("Error in getFarmerName:", error);
            return "Unknown Farmer";
        }
    };
    
    // Helper function to convert status number to text
    const getStatusText = (statusNumber) => {
        const statusMap = ["Pending", "Accepted", "Rejected", "Completed"];
        return statusNumber !== undefined ? statusMap[statusNumber] || "Unknown" : "Unknown";
    };

    // Helper function to format ETH price from wei
    const formatEthPrice = (weiPrice) => {
        try {
            return window.web3.utils.fromWei(weiPrice.toString(), "ether");
        } catch (error) {
            console.error("Error formatting ETH price:", error);
            return "0";
        }
    };

    // Helper function to get image URL from IPFS CID
    const getCropImageUrl = (crop) => {
        if (crop && crop.imageCID) {
            return getIPFSGatewayURL(crop.imageCID);
        }
        // Return a default image if no CID is available
        return 'https://via.placeholder.com/300x200?text=No+Image';
    };

    // New function to fetch purchase requests
    const fetchPurchaseRequests = async (contractInstance = contract) => {
        try {
            if (!contractInstance) {
            console.log("Contract not initialized yet, skipping fetch purchase requests");
            return;
        }

        if (!localAccount) {
            console.log("No account connected, skipping fetch purchase requests");
            return;
        }
        
            const buyerRequests = await contractInstance.methods.getBuyerRequests().call({from: localAccount});
            console.log("Buyer purchase requests:", buyerRequests);
            
            // Get cancelled requests from localStorage
            const cancelledRequests = JSON.parse(localStorage.getItem('cancelledRequests') || '{}');
            
            // Process requests and filter out cancelled ones
            const requests = await Promise.all(
                buyerRequests
                    // Filter out requests that the user has locally cancelled
                    .filter(request => !cancelledRequests[request.requestId])
                    .map(async (request) => {
                    try {
                        // Convert wei to ether for display
                        const priceInEther = web3.utils.fromWei(request.price, 'ether');
                        const totalPrice = web3.utils.toBN(request.price)
                            .mul(web3.utils.toBN(request.quantity))
                            .toString();
                        const totalPriceInEther = web3.utils.fromWei(totalPrice, 'ether');
                        
                        // Create enriched request object
                        return {
                            ...request,
                            cropName: await getCropName(request.cropId, contractInstance),
                            farmerName: await getFarmerName(request.farmer, contractInstance),
                            priceInEther,
                            totalPriceInEther,
                            statusText: getStatusText(request.status)
                        };
                    } catch (err) {
                        console.error("Error enriching request:", err, request);
                        return request;
                    }
                })
            );
            
            console.log("Enriched purchase requests:", requests);
            setPurchaseRequests(requests);
        } catch (error) {
            console.error("Error fetching purchase requests:", error);
            setSnackbar({
                open: true,
                message: `Error fetching purchase requests: ${error.message}`,
                severity: 'error'
            });
        }
    };

    // Update the handleBuy function to include the custom bid price
    const handleBuy = async () => {
        if (!purchaseQuantity || parseFloat(purchaseQuantity) <= 0) {
            setSnackbar({
                open: true,
                message: "Please enter a valid quantity",
                severity: 'warning'
            });
            return;
        }

        if (parseFloat(purchaseQuantity) > parseFloat(selectedCrop.quantity)) {
            setSnackbar({
                open: true,
                message: "Quantity exceeds available amount",
                severity: 'warning'
            });
            return;
        }
        
        if (bidEnabled && (!bidPrice || parseFloat(bidPrice) <= 0)) {
            setSnackbar({
                open: true,
                message: "Please enter a valid bid price",
                severity: 'warning'
            });
            return;
        }

        // Check if bid price meets minimum required (highest current bid)
        if (bidEnabled && selectedCrop) {
            try {
                // Get the raw bid data directly from the contract
                const rawBidData = await contract.methods.getBidsForCrop(selectedCrop.id).call();
                console.log("Raw bid data from contract:", rawBidData);
                
                // Process the bid data - contract returns array of arrays
                let highestBidAmount = parseFloat(formatEthPrice(selectedCrop.price)); // Default to base price
                let highestBidder = null;
                
                if (rawBidData && Array.isArray(rawBidData) && rawBidData.length >= 2 && rawBidData[0].length > 0) {
                    // Find the highest bid
                    let maxBidIdx = 0;
                    let maxBidWei = rawBidData[1][0]; // Default to first bid
                    
                    for (let i = 1; i < rawBidData[1].length; i++) {
                        if (parseInt(rawBidData[1][i]) > parseInt(maxBidWei)) {
                            maxBidIdx = i;
                            maxBidWei = rawBidData[1][i];
                        }
                    }
                    
                    // Convert highest bid to ETH
                    highestBidAmount = parseFloat(web3.utils.fromWei(maxBidWei, 'ether'));
                    highestBidder = rawBidData[0][maxBidIdx];
                    
                    console.log("Found highest bid:", {
                        bidder: highestBidder,
                        amount: highestBidAmount
                    });
                } else {
                    console.log("No bids found, using base price");
                }
                
                // Compare user bid with highest bid
                const bidPriceNum = parseFloat(bidPrice);
                
                console.log("Bid validation:", {
                    yourBid: bidPriceNum,
                    minRequired: highestBidAmount,
                    isValid: bidPriceNum >= highestBidAmount
                });
                    
                if (bidPriceNum < highestBidAmount) {
                    setSnackbar({
                        open: true,
                        message: `Your bid (${bidPriceNum.toFixed(4)} ETH) is too low. Minimum bid is ${highestBidAmount.toFixed(4)} ETH`,
                        severity: 'error'
                    });
                    return;
                }
            } catch (error) {
                console.error("Error fetching highest bid for validation:", error);
                // Fallback to the cached highest bid data
                const bidPriceNum = parseFloat(bidPrice);
                const minimumBidNum = selectedCrop && cropHighestBids && cropHighestBids[selectedCrop.id]
                    ? parseFloat(cropHighestBids[selectedCrop.id].amount)
                    : parseFloat(formatEthPrice(selectedCrop.price));
                
                console.log("Fallback bid validation:", {
                    yourBid: bidPriceNum,
                    minRequired: minimumBidNum,
                    isValid: bidPriceNum >= minimumBidNum
                });
                    
                if (bidPriceNum < minimumBidNum) {
                    setSnackbar({
                        open: true,
                        message: `Your bid (${bidPriceNum.toFixed(4)} ETH) is too low. Minimum bid is ${minimumBidNum.toFixed(4)} ETH`,
                        severity: 'error'
                    });
                    return;
                }
            }
        }

        // Calculate the price to use (either default or bid)
        let priceToUse = bidEnabled && bidPrice ? 
            window.web3.utils.toWei(bidPrice, 'ether') : 
            selectedCrop.price;
            
        requestPurchase(
            selectedCrop.cropID, 
            purchaseQuantity, 
            requestMessage || "Interested in buying this crop",
            priceToUse
        );
    };

    // Update the requestPurchase function to handle custom bid prices
    const requestPurchase = async (cropID, quantity, message, bidPriceWei = null) => {
        try {
            setLoading(true);
            console.log("Requesting to buy crop:", cropID, "Quantity:", quantity, "Message:", message);
            if (bidPriceWei) {
                console.log("Custom bid price (wei):", bidPriceWei);
                console.log("Custom bid price (ETH):", window.web3.utils.fromWei(bidPriceWei, 'ether'));
            }
            
            // Ensure Web3 is initialized
            if (!window.web3) {
                throw new Error("Web3 is not initialized");
            }

            // Re-initialize contract if needed
            if (!contract) {
                const web3 = window.web3;
                const newContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
                setContract(newContract);
                throw new Error("Contract was not initialized, please try again");
            }

            // Log the parameters we're sending
            console.log("Request purchase parameters:", {
                cropID: cropID,
                quantity: quantity,
                message: message,
                bidPriceWei: bidPriceWei
            });
            
            // Send the transaction
            // If we have a custom bid price, use it; otherwise use the contract's requestPurchase without bid
            let result;
            if (bidPriceWei) {
                // Call requestPurchaseWithBid function (assuming it exists in the contract)
                // If not, you'll need to add this function to your smart contract
                try {
                    result = await contract.methods.requestPurchaseWithBid(cropID, quantity, message, bidPriceWei).send({
                from: localAccount
            });
                } catch (error) {
                    console.error("Error with requestPurchaseWithBid, trying fallback method:", error);
                    
                    // Fallback to storing the bid in localStorage if contract doesn't support it
                    result = await contract.methods.requestPurchase(cropID, quantity, message).send({
                        from: localAccount
                    });
                    
                    // After successful request, store the bid information in localStorage
                    if (result) {
                        try {
                            const requestId = result.events?.PurchaseRequested?.returnValues?.requestId || 
                                             result.events?.['PurchaseRequested']?.returnValues?.requestId;
                            
                            if (requestId) {
                                // Store bid information in localStorage
                                const bids = JSON.parse(localStorage.getItem('cropBids') || '{}');
                                bids[requestId] = {
                                    cropID,
                                    bidPrice: window.web3.utils.fromWei(bidPriceWei, 'ether'),
                                    bidPriceWei,
                                    timestamp: new Date().getTime()
                                };
                                localStorage.setItem('cropBids', JSON.stringify(bids));
                                console.log("Stored bid in localStorage for requestId:", requestId);
                            }
                        } catch (storageError) {
                            console.error("Failed to store bid in localStorage:", storageError);
                        }
                    }
                }
            } else {
                // Regular purchase request without bid
                result = await contract.methods.requestPurchase(cropID, quantity, message).send({
                    from: localAccount
                });
            }
            
            console.log("Purchase request transaction result:", result);

            setSnackbar({
                open: true,
                message: bidPriceWei ? 
                    "Purchase request with custom bid sent successfully! The farmer will review your offer." :
                    "Purchase request sent successfully! The farmer will review your request.",
                severity: 'success'
            });
            
            // Reset bid price
            setBidPrice("");
            setBidEnabled(false);
            
            // Refresh data
            await fetchPurchaseRequests();
            setShowModal(false);
        } catch (error) {
            console.error("Error requesting purchase:", error);
            setSnackbar({
                open: true,
                message: `Error requesting purchase: ${error.message}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Add a helper function to get custom bid price from localStorage
    const getAcceptedCustomBidPrice = (requestId) => {
        try {
            const acceptedCustomBids = JSON.parse(localStorage.getItem('acceptedCustomBids') || '{}');
            const customBid = acceptedCustomBids[requestId];
            
            if (customBid && customBid.customPriceWei) {
                console.log(`Found custom bid price for request ${requestId}: ${customBid.customPrice} ETH`);
                return {
                    customPriceWei: customBid.customPriceWei,
                    customPriceEth: customBid.customPrice
                };
            }
        } catch (error) {
            console.error("Error getting custom bid price from localStorage:", error);
        }
        return null;
    };

    // New function to complete the purchase after request is accepted
    const completePurchase = async (requestId, priceInWei, quantity) => {
        try {
            setLoading(true);
            console.log("Completing purchase for request:", requestId);
            
            // Check if there's a custom bid price for this request
            const customBid = getAcceptedCustomBidPrice(requestId);
            
            // Use custom price if available, otherwise use the original price
            let actualPriceInWei = priceInWei;
            let priceExplanation = "original listing price";
            
            if (customBid && customBid.customPriceWei) {
                actualPriceInWei = customBid.customPriceWei;
                priceExplanation = `custom bid price (${customBid.customPriceEth} ETH)`;
                console.log(`Using custom bid price of ${customBid.customPriceEth} ETH instead of original price`);
            }
            
            // Calculate total price
            const totalWei = web3.utils.toBN(actualPriceInWei)
                .mul(web3.utils.toBN(quantity))
                .toString();
            
            console.log(`Total price in Wei (using ${priceExplanation}):`, totalWei);
            console.log("Total price in ETH:", web3.utils.fromWei(totalWei, "ether"));

            // Get current gas price and increase to help transaction succeed
            const gasPrice = await web3.eth.getGasPrice();
            const adjustedGasPrice = Math.floor(parseInt(gasPrice) * 1.2).toString(); // 20% higher
            
            // Try to estimate gas for this transaction
            try {
                const gasEstimate = await contract.methods.completePurchase(requestId).estimateGas({
                    from: localAccount,
                    value: totalWei
                });
                console.log("Gas estimate for completePurchase:", gasEstimate);
                
                // Add a large buffer to gas estimate
                const gasLimit = Math.floor(gasEstimate * 2); // Double the estimated gas
                console.log("Using gas limit:", gasLimit);
                
                // Send the transaction with payment and optimal gas settings
                const result = await contract.methods.completePurchase(requestId).send({
                    from: localAccount,
                    value: totalWei,
                    gas: gasLimit,
                    gasPrice: adjustedGasPrice
                });
                
                console.log("Transaction successful:", result);
                
                // If we used a custom bid price, remove it from localStorage to avoid confusion
                if (customBid) {
                    try {
                        const acceptedCustomBids = JSON.parse(localStorage.getItem('acceptedCustomBids') || '{}');
                        delete acceptedCustomBids[requestId];
                        localStorage.setItem('acceptedCustomBids', JSON.stringify(acceptedCustomBids));
                        console.log(`Removed custom bid for request ${requestId} from localStorage after completion`);
                    } catch (error) {
                        console.error("Error updating localStorage after completing purchase:", error);
                    }
                }
                
                setSnackbar({
                    open: true,
                    message: customBid 
                        ? `Purchase completed successfully at custom bid price of ${customBid.customPriceEth} ETH!`
                        : "Purchase completed successfully! Payment sent to escrow.",
                    severity: 'success'
                });
                
                // Refresh data
                await fetchPurchaseRequests();
                await fetchBuyerOrders();
            } catch (estimateError) {
                console.error("Gas estimation failed:", estimateError);
                
                // Check if there's a revert reason in the error
                if (estimateError.message.includes("revert")) {
                    throw new Error(`Transaction would fail: ${estimateError.message.split("revert ")[1] || "Check your purchase request status"}`);
                }
                
                // Try anyway with fixed high gas as fallback
                console.log("Trying with fixed high gas limit as fallback");
                
                const result = await contract.methods.completePurchase(requestId).send({
                    from: localAccount,
                    value: totalWei,
                    gas: 800000, // Very high fixed gas limit
                    gasPrice: adjustedGasPrice
                });
                
                console.log("Transaction successful with fixed gas:", result);
                
                setSnackbar({
                    open: true,
                    message: "Purchase completed successfully with higher gas! Payment sent to escrow.",
                    severity: 'success'
                });
                
                // Refresh data
                await fetchPurchaseRequests();
                await fetchBuyerOrders();
            }
        } catch (error) {
            console.error("Error completing purchase:", error);
            
            // Extract more detailed error message
            let errorMessage = error.message;
            let actionAdvice = "";
            
            // Check for specific error patterns
            if (error.code === -32603) {
                if (error.message.includes("already completed")) {
                    errorMessage = "This purchase has already been completed";
                    actionAdvice = "Try confirming the delivery directly from the My Orders tab.";
                    
                    // Try to move directly to confirm delivery
                    setTimeout(() => {
                        confirmDelivery(purchase.cropID);
                    }, 1000);
                    
                    return true;
                } else if (error.message.includes("revert")) {
                    const revertIndex = error.message.indexOf("revert");
                    if (revertIndex !== -1) {
                        errorMessage = error.message.substring(revertIndex);
                } else {
                        errorMessage = "Smart contract rejected the transaction. Check that you have enough funds and are the proper buyer.";
                    }
                } else if (error.message.includes("gas")) {
                    errorMessage = "Transaction failed due to gas issues. Try again with a higher gas limit.";
                } else {
                    errorMessage = "Transaction rejected. This might be due to contract conditions not being met or network congestion.";
                    console.log("Full error details:", error);
                    
                    // Try to analyze Metamask RPC errors better
                    if (error.message.includes("Internal JSON-RPC error")) {
                        const pendingDeliveries = await contract.methods.getPendingDeliveries().call({from: localAccount});
                        console.log("Current pending deliveries:", pendingDeliveries);
                        
                        if (pendingDeliveries.some(d => d.cropID.toString() === purchase.cropID.toString())) {
                            errorMessage = "It appears you've already completed this purchase.";
                            actionAdvice = "Try confirming the delivery directly from the My Orders tab.";
                            
                            // Try to move directly to confirm delivery
                            setTimeout(() => {
                                confirmDelivery(purchase.cropID);
                            }, 1000);
                            
                            return true;
                        }
                    }
                }
            } else if (error.message.includes("insufficient funds")) {
                errorMessage = "You don't have enough ETH to complete this purchase";
                actionAdvice = "Add more ETH to your wallet and try again.";
            }
            
            setSnackbar({
                open: true,
                message: `Error completing purchase: ${errorMessage}. ${actionAdvice}`,
                severity: 'error'
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const confirmDelivery = async (cropID) => {
        try {
            setLoading(true);
            console.log("Confirming delivery for crop ID:", cropID);
            
            if (!contract || !contract.methods) {
                throw new Error("Contract not initialized");
            }
            
            // First check if the delivery exists and is pending
            const pendingDeliveries = await contract.methods.getPendingDeliveries().call({from: localAccount});
            console.log("Pending deliveries:", pendingDeliveries);
            
            // Check if this cropID exists in the pending deliveries
            const targetDelivery = pendingDeliveries.find(delivery => 
                delivery.cropID.toString() === cropID.toString()
            );
            
            if (!targetDelivery) {
                console.warn("No pending delivery found for cropID", cropID);
                throw new Error("No pending delivery found for this crop. It may have already been confirmed.");
            }
            
            console.log("Found pending delivery to confirm:", targetDelivery);
            
            // Get current gas price and increase it to help transaction succeed
            const gasPrice = await web3.eth.getGasPrice();
            const adjustedGasPrice = Math.floor(parseInt(gasPrice) * 1.4).toString(); // 40% higher
            
            console.log("Using gas price (adjusted):", web3.utils.fromWei(adjustedGasPrice, 'gwei'), "gwei");
            
            // First check contract balance to make sure funds are available
            const escrowBalance = await contract.methods.escrowBalances(localAccount).call();
            console.log("Escrow balance:", escrowBalance);
            
            if (parseInt(escrowBalance) < parseInt(targetDelivery.amountHeld)) {
                throw new Error(`Insufficient escrow balance. Expected ${targetDelivery.amountHeld} but got ${escrowBalance}`);
            }
            
            // Send the transaction with high gas settings
            const result = await contract.methods.confirmDelivery(cropID).send({ 
                from: localAccount,
                gas: 800000, // Very high gas limit
                gasPrice: adjustedGasPrice,
                maxPriorityFeePerGas: null // Let MetaMask decide
            });
            
            console.log("Transaction result:", result);
            
            setSnackbar({
                open: true,
                message: "Delivery confirmed successfully! Payment released to farmer.",
                severity: 'success'
            });
            
            // Refresh deliveries
            await fetchBuyerOrders();
        } catch (error) {
            console.error("Error confirming delivery:", error);
            
            // Get more details from the error
            let errorMessage = error.message;
            
            // Check for common blockchain errors
            if (errorMessage.includes("No pending delivery found")) {
                errorMessage = "This delivery has already been confirmed or doesn't exist.";
            } else if (errorMessage.includes("insufficient funds")) {
                errorMessage = "Insufficient ETH for gas fees. Please add more ETH to your wallet.";
            } else if (errorMessage.includes("execution reverted")) {
                errorMessage = "Contract rejected the transaction. This delivery may have already been confirmed.";
            } else if (error.code === -32603) {
                // MetaMask internal JSON-RPC error - most likely the smart contract reverted
                errorMessage = "Contract verification failed. This typically means the delivery is already confirmed or not in the right state.";
                
                // Debug details
                console.log("Full RPC error:", error);
                // Try to fetch latest state
                debugPendingDeliveries();
            }
            
            setSnackbar({
                open: true,
                message: `Error confirming delivery: ${errorMessage}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Try different approaches to confirm delivery with more robust error handling
    const tryConfirmDelivery = async (delivery) => {
        try {
            setLoading(true);
            console.log("Trying to confirm delivery for:", delivery);
            
            // First, check if we have permission
            const permissionCheck = await checkDeliveryPermission(delivery);
            console.log("Permission check result:", permissionCheck);
            
            if (!permissionCheck.canConfirm) {
                setSnackbar({
                    open: true,
                    message: `Cannot confirm delivery: ${permissionCheck.message}`,
                    severity: 'warning'
                });
                return false;
            }
            
            // Show all contract methods for debugging
            const methods = Object.keys(contract.methods);
            console.log("Available contract methods:", methods);
            
            // Try confirmDelivery with higher gas limit
            if (contract.methods.confirmDelivery) {
                console.log("Attempting confirmDelivery with higher gas limit");
                try {
                    // Add more gas and higher gas price
                    const gasPrice = await web3.eth.getGasPrice();
                    const adjustedGasPrice = Math.floor(parseInt(gasPrice) * 1.5).toString(); // 50% higher
                    
                    console.log("Standard gas price:", gasPrice);
                    console.log("Using adjusted gas price:", adjustedGasPrice);
                    
                    const result = await contract.methods.confirmDelivery(delivery.cropID).send({
                        from: localAccount,
                        gas: 500000, // Higher gas limit
                        gasPrice: adjustedGasPrice
                    });
                    
                    console.log("Transaction successful:", result);
                    
                    setSnackbar({
                        open: true,
                        message: "Delivery confirmed successfully! Payment released to farmer.",
                        severity: 'success'
                    });
                    
                    await fetchBuyerOrders();
                    return true;
                } catch (err) {
                    console.error("confirmDelivery failed with details:", err);
                    
                    // Extract more detailed error information
                    let errorMsg = err.message;
                    if (err.code === -32603 && err.data) {
                        errorMsg = `Contract execution failed: ${err.data.message || errorMsg}`;
                    }
                    
                    setSnackbar({
                        open: true,
                        message: `Error confirming delivery: ${errorMsg}`,
                        severity: 'error'
                    });
                }
            } else {
                setSnackbar({
                    open: true,
                    message: "Contract doesn't have a confirmDelivery method",
                    severity: 'error'
                });
            }
            
            return false;
        } catch (error) {
            console.error("Error in tryConfirmDelivery:", error);
            setSnackbar({
                open: true,
                message: `Error: ${error.message}`,
                severity: 'error'
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const openBuyModal = async (crop) => {
        setSelectedCrop(crop);
        setPurchaseQuantity("1");
        setBidPrice("");
        setBidEnabled(false);
        setRequestMessage("");
        
        // Fetch the highest bid for this crop before opening modal
        try {
            setLoading(true);
            
            // Get the raw bid data directly from the contract
            const rawBidData = await contract.methods.getBidsForCrop(crop.id).call();
            console.log(`Raw bids for crop ${crop.id}:`, rawBidData);
            
            // Transform and sort all bids (from all users)
            if (rawBidData && Array.isArray(rawBidData) && rawBidData.length >= 2 && rawBidData[0].length > 0) {
                // Format bids
                const formattedBids = [];
                for (let i = 0; i < rawBidData[0].length; i++) {
                    formattedBids.push({
                        bidder: rawBidData[0][i],
                        amount: web3.utils.fromWei(rawBidData[1][i], 'ether'),
                        amountNumber: parseFloat(web3.utils.fromWei(rawBidData[1][i], 'ether')),
                        timestamp: new Date(parseInt(rawBidData[2][i]) * 1000).toLocaleString()
                    });
                }
                
                // Sort bids by amount in descending order
                formattedBids.sort((a, b) => b.amountNumber - a.amountNumber);
                console.log("Sorted bids:", formattedBids);
                
                // Set the highest bid
                if (formattedBids.length > 0) {
                    const highestBid = formattedBids[0];
                    console.log(`Found highest bid for crop ${crop.id}:`, highestBid);
                    
                    // Update global state with highest bid
                    setCropHighestBids(prev => ({
                        ...prev,
                        [crop.id]: highestBid
                    }));
                    
                    // Suggest a bid slightly higher than current highest
                    const suggestedBid = (parseFloat(highestBid.amount) * 1.02).toFixed(4);
                    console.log(`Setting suggested bid to ${suggestedBid} (2% higher than current highest bid)`);
                    setBidPrice(suggestedBid);
                }
            } else {
                console.log(`No bids found for crop ${crop.id}, using base price`);
                
                // Clear any previous highest bid data for this crop
                setCropHighestBids(prev => {
                    const newState = { ...prev };
                    delete newState[crop.id];
                    return newState;
                });
                
                // If no bids, suggest a bid slightly higher than base price
                const basePriceEth = parseFloat(formatEthPrice(crop.price));
                const suggestedBid = (basePriceEth * 1.02).toFixed(4);
                console.log(`Setting suggested bid to ${suggestedBid} (2% higher than base price ${basePriceEth})`);
                setBidPrice(suggestedBid);
            }
        } catch (error) {
            console.error(`Error fetching bids for crop ${crop.id}:`, error);
            
            // Fall back to base price if there's an error
            try {
                const basePriceEth = parseFloat(formatEthPrice(crop.price));
                const suggestedBid = (basePriceEth * 1.02).toFixed(4);
                setBidPrice(suggestedBid);
            } catch (err) {
                console.error("Error setting fallback bid price:", err);
            }
        } finally {
            setLoading(false);
        }
        
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleTabChange = (event, newValue) => {
        try {
            console.log("Tab changed to:", newValue);

            // Reset emergency mode when switching tabs
            setEmergencyTabMode(false);

            // Reset any filters or search terms when switching tabs
            setSearchTerm("");
            
            // Update the tab value - our useEffect will handle the data loading
        setTabValue(newValue);
            
            // Save the current tab in localStorage for persistence
            localStorage.setItem('buyerDashboardActiveTab', newValue.toString());
        } catch (error) {
            console.error("Error handling tab change:", error);
            setSnackbar({
                open: true,
                message: "Error changing tabs. Please refresh the page.",
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const filteredCrops = crops.filter(crop =>
        // Filter by search term
        crop.cropName.toLowerCase().includes(searchTerm.toLowerCase()) && 
        // Also filter out crops with zero quantity
        crop.quantity && crop.quantity.toString() !== "0"
    );

    // Add this function after loadBuyerProfile 
    const getRemovedCropIdsFromLocalStorage = () => {
        try {
            const storedRemovedCrops = localStorage.getItem('removedCrops');
            if (storedRemovedCrops) {
                const removedCropsObj = JSON.parse(storedRemovedCrops);
                
                // Convert the object to an array of crop IDs if it's in object format
                if (typeof removedCropsObj === 'object' && !Array.isArray(removedCropsObj)) {
                    return Object.keys(removedCropsObj).filter(id => removedCropsObj[id]);
                } else if (Array.isArray(removedCropsObj)) {
                    return removedCropsObj;
                }
            }
        } catch (error) {
            console.error("Error loading removed crops from localStorage:", error);
        }
        return [];
    };

    // Update fetchListings to use the removed crops from localStorage
    const fetchListings = async () => {
        try {
            if (!contract || !contract.methods) {
                console.error("Contract not initialized in fetchListings");
                return;
            }
            
            // Get removed crop IDs from localStorage
            const removedCropIds = getRemovedCropIdsFromLocalStorage();
            console.log("BuyerDashboard - Removed crop IDs from localStorage:", removedCropIds);
            
            console.log("Fetching all listings with contract:", contract);
            const listings = await contract.methods.getAllListings().call({from: localAccount});
            console.log("Raw listings from contract:", listings);
            
            // Double-check removedCropIds again for the most up-to-date list
            const freshRemovedCropIds = getRemovedCropIdsFromLocalStorage();
            
            // Filter out listings with zero quantity and removed crops
            const filteredListings = listings.filter(listing => {
                const cropId = listing.cropID.toString();
                const isZeroQuantity = listing.quantity && listing.quantity.toString() === "0";
                const isInRemovedList = freshRemovedCropIds.includes(cropId);
                
                if (isZeroQuantity) {
                    console.log(`BuyerDashboard - Filtering out zero-quantity crop ${cropId} (${listing.cropName})`);
                }
                
                if (isInRemovedList) {
                    console.log(`BuyerDashboard - Filtering out removed crop ${cropId} (${listing.cropName}) from localStorage`);
                }
                
                // Only keep crops with quantity > 0 and not in removed list
                return !isZeroQuantity && !isInRemovedList;
            });
            
            console.log("BuyerDashboard - Filtered listings (removed zero quantity and removed crops):", filteredListings);
            
            // Enrich the listings with additional data
            const enrichedListings = await Promise.all(filteredListings.map(async (listing) => {
                // Get farmer name
                let farmerName = "Unknown Farmer";
                try {
                    farmerName = await getFarmerName(listing.farmer);
                } catch (error) {
                    console.error("Error getting farmer name:", error);
                }
                
                // Convert price from wei to ether
                const priceInEth = window.web3 ? window.web3.utils.fromWei(listing.price, 'ether') : '0';
                
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
            }));
            
            console.log("BuyerDashboard - Enriched listings:", enrichedListings);
            
            // Final check to ensure no removed crops slip through
            const finalFilteredListings = enrichedListings.filter(listing => {
                const cropId = listing.cropID.toString();
                return !freshRemovedCropIds.includes(cropId);
            });
            
            // Compare counts to see if any were filtered
            if (finalFilteredListings.length < enrichedListings.length) {
                console.log(`BuyerDashboard - Final filter removed ${enrichedListings.length - finalFilteredListings.length} listings`);
            }
            
            setCrops(finalFilteredListings);
            
            // After fetching crops, also fetch highest bids for each crop
            const highestBidsMap = {};
            for (const crop of finalFilteredListings) {
                const highestBid = await getHighestBidForCrop(crop.id);
                if (highestBid) {
                    highestBidsMap[crop.id] = highestBid;
                }
            }
            setCropHighestBids(highestBidsMap);
        } catch (error) {
            console.error("Error fetching listings:", error);
            setSnackbar({
                open: true,
                message: "Error fetching crop listings. Please refresh and try again.",
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const initializeContract = async () => {
        setLoading(true);
        try {
            // Check if web3 is injected by MetaMask
            if (!window.ethereum) {
                throw new Error("Please install MetaMask to use this app.");
            }

            // Initialize web3
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);
            window.web3 = web3Instance; // For global access

            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (!accounts || accounts.length === 0) {
                throw new Error("No accounts found. Please check MetaMask.");
            }
            
            // Set local account
            const account = accounts[0];
            setLocalAccount(account);
            console.log("Connected account:", account);

            // Create contract instance
            const contractInstance = new web3Instance.eth.Contract(
                CONTRACT_ABI,
                CONTRACT_ADDRESS
            );
            
            if (!contractInstance || !contractInstance.methods) {
                throw new Error("Failed to initialize contract.");
            }
            
            // Log available methods for debugging
            console.log("Contract methods:", Object.keys(contractInstance.methods));
            setContract(contractInstance);
            
            // Fetch user profile data
            try {
                await fetchUserProfile(contractInstance, account);
            } catch (profileError) {
                console.error("Error fetching user profile:", profileError);
                // Continue even if profile fetch fails
            }
            
            console.log("Contract initialized successfully");
            
            return contractInstance;
        } catch (error) {
            console.error("Error initializing contract:", error);
            setSnackbar({
                open: true,
                message: `Error initializing: ${error.message}`,
                severity: 'error'
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch buyer's completed purchases
    const fetchBuyerOrders = async () => {
        try {
            if (!contract || !contract.methods) {
                console.error("Contract not initialized in fetchBuyerOrders");
                setBuyerOrders([]); // Use setBuyerOrders instead of setDeliveries
                return [];
            }
            
            console.log("Fetching buyer orders and checking deliveries...");
            
            // First check for pending deliveries using our debug function
            let pendingDeliveries = [];
            try {
                pendingDeliveries = await debugPendingDeliveries() || [];
            } catch (debugError) {
                console.error("Error in debugPendingDeliveries, continuing with empty list:", debugError);
            }
            
            // Use getBuyerRequests to get completed requests (status 3)
            let requests = [];
            try {
                requests = await contract.methods.getBuyerRequests().call({ from: localAccount });
            console.log("All buyer requests:", requests);
            } catch (requestsError) {
                console.error("Error fetching buyer requests:", requestsError);
                requests = [];
            }
            
            // Filter for completed requests (status 3)
            const completedRequests = requests.filter(req => req.status && req.status.toString() === "3");
            console.log("Completed purchases:", completedRequests);
            
            // Map to track if each requestId has a pending delivery
            const deliveryStatusMap = {};
            
            // If we have pendingDeliveries from the debug function, check which requests have deliveries
            if (pendingDeliveries && pendingDeliveries.length > 0) {
                // Map cropIDs to track which crops have pending deliveries
                pendingDeliveries.forEach(delivery => {
                    deliveryStatusMap[delivery.cropID] = true;
                });
                console.log("Delivery status map by cropID:", deliveryStatusMap);
            }
            
            let enrichedOrders = [];
            // Only attempt to enrich if we have completedRequests
            if (completedRequests && completedRequests.length > 0) {
                try {
            // Enrich with crop and farmer information
                    enrichedOrders = await Promise.all(completedRequests.map(async (order) => {
                        try {
                // Get farmer name
                            let farmerName = "Unknown Farmer";
                            try {
                                farmerName = await getFarmerName(order.farmer) || "Unknown Farmer";
                            } catch (nameError) {
                                console.error("Error getting farmer name:", nameError);
                            }
                
                // Find the crop name from the listings if possible
                let cropName = `Crop #${order.cropID}`;
                for (const crop of crops) {
                    if (crop.cropID && crop.cropID.toString() === order.cropID.toString()) {
                        cropName = crop.cropName;
                        break;
                    }
                }
                
                // Calculate total amount held in escrow (price * quantity)
                            let totalAmount = "0";
                            try {
                                totalAmount = web3.utils.toBN(order.price)
                    .mul(web3.utils.toBN(order.quantity))
                    .toString();
                            } catch (calcError) {
                                console.error("Error calculating total amount:", calcError);
                                totalAmount = "0";
                            }

                            // Calculate price in ETH for display
                            let priceInEth = "0";
                            try {
                                priceInEth = web3.utils.fromWei(order.price, "ether");
                            } catch (priceError) {
                                console.error("Error calculating ETH price:", priceError);
                            }

                            // Format timestamp if available
                            let formattedTimestamp = "Unknown";
                            if (order.timestamp) {
                                try {
                                    const date = new Date(parseInt(order.timestamp) * 1000);
                                    formattedTimestamp = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                                } catch (dateError) {
                                    console.error("Error formatting date:", dateError);
                                }
                            }
                
                // Check if this order's cropID has a pending delivery
                const hasPendingDelivery = deliveryStatusMap[order.cropID] || false;
                
                return {
                    ...order,
                    cropName,
                    farmerName,
                    amountHeld: totalAmount,
                                isDelivered: !hasPendingDelivery, // If no pending delivery exists, assume it's been delivered
                                priceInEth,
                                formattedTimestamp,
                                orderType: 'completed',
                                statusText: hasPendingDelivery ? "Awaiting Delivery" : "Completed"
                            };
                        } catch (orderError) {
                            console.error("Error processing order:", orderError, order);
                            // Return a minimal valid order to not break the Promise.all
                            return {
                                ...order,
                                cropName: `Crop #${order.cropID || 'Unknown'}`,
                                farmerName: "Unknown Farmer",
                                amountHeld: "0",
                                isDelivered: false,
                                priceInEth: "0",
                                formattedTimestamp: "Unknown",
                                orderType: 'completed',
                                statusText: "Unknown Status"
                            };
                        }
                    }));
                } catch (enrichError) {
                    console.error("Error enriching orders:", enrichError);
                    // Create minimal valid orders if enrichment fails
                    enrichedOrders = completedRequests.map(order => ({
                        ...order,
                        cropName: `Crop #${order.cropID || 'Unknown'}`,
                        farmerName: "Unknown Farmer",
                        amountHeld: "0",
                        isDelivered: false,
                        priceInEth: "0",
                        formattedTimestamp: "Unknown",
                        orderType: 'completed',
                        statusText: "Unknown Status"
                    }));
                }
            }
            
            console.log("Enriched orders:", enrichedOrders);
            
            // Create an array of all orders (both pending deliveries and completed orders)
            const allOrders = [...enrichedOrders];
            
            // Set these to state using new state variable
            setBuyerOrders(allOrders);
            
            // For backward compatibility
            setDeliveries(allOrders);
            
            return allOrders;
        } catch (error) {
            console.error("Error fetching buyer orders:", error);
            setBuyerOrders([]);
            setDeliveries([]);
            return []; // Always return something to unblock promises
        }
    };

    // Debug function to log contract state for debugging
    const debugContractState = () => {
        try {
            if (!contract || !contract.methods) {
                console.log("Contract not initialized for debugging");
                return;
            }
            
            console.log("Contract address:", CONTRACT_ADDRESS);
            console.log("Connected account:", localAccount);
            console.log("Available contract methods:", Object.keys(contract.methods));
            console.log("Current tab:", tabValue);
            console.log("Number of completed purchases:", deliveries.length);
        } catch (error) {
            console.error("Error in debug function:", error);
        }
    };

    // Function to check transaction and contract permissions
    const checkDeliveryPermission = async (delivery) => {
        try {
            setLoading(true);
            console.log("Checking delivery permissions for:", delivery);
            
            // Get the transaction count before sending to see if there's a nonce issue
            const nonce = await web3.eth.getTransactionCount(localAccount);
            console.log("Current account nonce:", nonce);
            
            // Check if the contract has the delivery
            console.log("Checking if contract recognizes this delivery...");
            const buyerRequests = await contract.methods.getBuyerRequests().call({from: localAccount});
            console.log("All buyer requests:", buyerRequests);
            
            // Find the specific request
            const matchingRequest = buyerRequests.find(req => req.cropID.toString() === delivery.cropID.toString());
            console.log("Found matching request:", matchingRequest);
            
            if (!matchingRequest) {
                throw new Error("This delivery doesn't exist in your requests. It may have been completed already.");
            }
            
            // Check if status is correct (should be 3 for completed purchase)
            console.log("Request status:", matchingRequest.status.toString());
            if (matchingRequest.status.toString() !== "3") {
                throw new Error(`Cannot confirm delivery - request status is ${matchingRequest.status.toString()} instead of 3 (completed purchase).`);
            }
            
            // Check contract balance to see if there's funds to release
            const escrowBalance = await contract.methods.escrowBalances(localAccount).call();
            console.log("Escrow balance for account:", escrowBalance);
            
            // Get gas price for transaction
            const gasPrice = await web3.eth.getGasPrice();
            console.log("Current gas price:", gasPrice);
            
            // Estimate gas for the transaction to see if it will fail
            try {
                const gasEstimate = await contract.methods.confirmDelivery(delivery.cropID).estimateGas({from: localAccount});
                console.log("Gas estimate for confirmDelivery:", gasEstimate);
                console.log("This suggests the transaction should succeed!");
                
                return {
                    canConfirm: true,
                    message: "Delivery can be confirmed. Try with adjusted gas settings."
                };
            } catch (gasError) {
                console.error("Gas estimation failed:", gasError);
                return {
                    canConfirm: false,
                    message: "Transaction would fail. The contract may not allow this operation at this time."
                };
            }
        } catch (error) {
            console.error("Permission check error:", error);
            return {
                canConfirm: false,
                message: error.message
            };
        } finally {
            setLoading(false);
        }
    };

    // Update the function to use proper delays and multi-stage confirmation
    const createThenConfirmDelivery = async (purchase) => {
        try {
            setLoading(true);
            console.log("Creating delivery for purchase:", purchase);

            // First show an informative message to the user about what's happening
            setSnackbar({
                open: true,
                message: `Processing payment for ${purchase.cropName}. Please confirm the transaction in your wallet.`,
                severity: 'info',
                duration: 8000
            });
            
            // Check available methods
            const methods = Object.keys(contract.methods);
            console.log("Available methods:", methods);
            
            // Check if there's a custom bid price for this request
            const customBid = getAcceptedCustomBidPrice(purchase.requestId);
            
            // Use custom price if available, otherwise use the original price
            let actualPriceInWei = purchase.price;
            let priceExplanation = "original listing price";
            
            if (customBid && customBid.customPriceWei) {
                actualPriceInWei = customBid.customPriceWei;
                priceExplanation = `custom bid price (${customBid.customPriceEth} ETH)`;
                console.log(`Using custom bid price of ${customBid.customPriceEth} ETH instead of original price`);
            }
            
            // First, calculate total price
            const totalPrice = web3.utils.toBN(actualPriceInWei)
                .mul(web3.utils.toBN(purchase.quantity))
                .toString();
            
            console.log(`Total price in wei (using ${priceExplanation}):`, totalPrice);
            console.log("Total price in ETH:", web3.utils.fromWei(totalPrice, 'ether'));
            
            // Try completePurchase first
            if (contract.methods.completePurchase) {
                
                    console.log("Attempting to complete purchase with ID:", purchase.requestId);
                    
                    // Check if the purchase is already completed
                    const buyerRequests = await contract.methods.getBuyerRequests().call({from: localAccount});
                    const targetRequest = buyerRequests.find(req => 
                        req.requestId.toString() === purchase.requestId.toString()
                    );
                    
                    if (targetRequest && targetRequest.status.toString() === "3") {
                        console.log("This purchase is already completed. Switching to direct confirmation.");
                        setSnackbar({
                            open: true,
                            message: "This purchase is already completed. Attempting to confirm delivery directly...",
                            severity: 'info'
                        });
                        
                        // Try to directly confirm the delivery
                        setTimeout(() => {
                            confirmDelivery(purchase.cropID);
                        }, 1000);
                        
                        return true;
                    }
                    
                    // Add more gas and higher gas price for reliable execution
                    const gasPrice = await web3.eth.getGasPrice();
                    const adjustedGasPrice = Math.floor(parseInt(gasPrice) * 1.5).toString(); // 50% higher
                    
                // Try to estimate gas for this transaction to ensure it will succeed
                try {
                    const gasEstimate = await contract.methods.completePurchase(purchase.requestId).estimateGas({
                        from: localAccount,
                        value: totalPrice
                    });
                    
                    console.log("Gas estimate for completePurchase:", gasEstimate);
                    const gasLimit = Math.floor(gasEstimate * 2); // Double the estimated gas
                    
                    const result = await contract.methods.completePurchase(purchase.requestId).send({
                        from: localAccount,
                        value: totalPrice,
                        gas: gasLimit,
                        gasPrice: adjustedGasPrice
                    });
                    
                    console.log("Purchase completion successful:", result);
                    
                    // If we used a custom bid price, remove it from localStorage
                    if (customBid) {
                        try {
                            const acceptedCustomBids = JSON.parse(localStorage.getItem('acceptedCustomBids') || '{}');
                            delete acceptedCustomBids[purchase.requestId];
                            localStorage.setItem('acceptedCustomBids', JSON.stringify(acceptedCustomBids));
                            console.log(`Removed custom bid for request ${purchase.requestId} from localStorage after completion`);
                        } catch (error) {
                            console.error("Error updating localStorage after completing purchase:", error);
                        }
                    }
                    
                    // Show success message with clear next steps
                    setSnackbar({
                        open: true,
                        message: customBid 
                            ? `Purchase completed successfully at custom bid price of ${customBid.customPriceEth} ETH!`
                            : "Purchase completed successfully! Payment sent to escrow.",
                        severity: 'success',
                        duration: 10000,
                        action: (
                            <Button 
                                color="inherit" 
                                size="small"
                                onClick={() => {
                                    // Set tab value to the Orders tab (index 2)
                                    setTabValue(2);
                                    // Automatically scroll to the order section
                                    setTimeout(() => {
                                        // Try to find this specific order in the table
                                        const orderElements = document.querySelectorAll(`[data-crop-id="${purchase.cropID}"]`);
                                        if (orderElements.length > 0) {
                                            orderElements[0].scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }, 500);
                                }}
                            >
                                GO TO MY ORDERS
                            </Button>
                        )
                    });
                    
                    // Show a more detailed alert about next steps
                    setTimeout(() => {
                        alert("Payment complete! What happens next:\n\n" +
                            "1. The farmer will be notified to prepare your crop for delivery\n" +
                            "2. Once you receive your crop, return to the 'My Purchases' tab\n" +
                            "3. Find this purchase and click 'Confirm Delivery'\n" +
                            "4. This will release payment to the farmer and complete the transaction\n\n" +
                            "You'll be redirected to the My Purchases tab now.");
                        
                        // Navigate to the orders tab
                        setTabValue(2);
                    }, 1000);
                    
                    // Refresh data
                    await fetchPurchaseRequests();
                    await fetchBuyerOrders();
                    
                    return true;
                } catch (error) {
                    console.error("Error completing purchase:", error);
                    
                    // Provide a more helpful error message
                    let errorMessage = error.message;
                    if (error.message.includes("insufficient funds")) {
                        errorMessage = "You don't have enough ETH to complete this purchase. Please add more funds to your wallet.";
                    } else if (error.message.includes("gas")) {
                        errorMessage = "Transaction failed due to gas issues. Please try again with a higher gas limit.";
                        } else if (error.message.includes("revert")) {
                        errorMessage = "Transaction was reverted by the blockchain. This might be because the purchase request is no longer valid.";
                    }
                    
                    setSnackbar({
                        open: true,
                        message: `Failed to complete purchase: ${errorMessage}`,
                        severity: 'error',
                        duration: 15000
                    });
                    
                    return false;
                }
            } else {
                console.error("completePurchase method not found in contract");
                setSnackbar({
                    open: true,
                    message: "Error: completePurchase method not found in the contract",
                    severity: 'error'
                });
                return false;
            }
        } catch (error) {
            console.error("Unexpected error in createThenConfirmDelivery:", error);
            setSnackbar({
                open: true,
                message: `An unexpected error occurred: ${error.message}`,
                severity: 'error'
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Debug function to check for pending deliveries and show details
    const debugPendingDeliveries = async () => {
        try {
            if (!contract || !contract.methods) {
                console.log("Contract not initialized for debugging deliveries");
                return [];
            }
            
            console.log("Checking for pending deliveries...");
            
            // Check if getPendingDeliveries method exists
            if (contract.methods.getPendingDeliveries) {
                try {
                    const pendingDeliveries = await contract.methods.getPendingDeliveries().call({from: localAccount});
                    console.log("Pending deliveries from contract:", pendingDeliveries);
                    
                    if (pendingDeliveries && pendingDeliveries.length > 0) {
                        console.log("Found pending deliveries:", pendingDeliveries.length);
                        
                        // Log details of each pending delivery
                        pendingDeliveries.forEach((delivery, index) => {
                            console.log(`Delivery ${index+1}:`, {
                                cropID: delivery.cropID,
                                quantity: delivery.quantity,
                                buyer: delivery.buyer,
                                farmer: delivery.farmer,
                                amountHeld: web3.utils.fromWei(delivery.amountHeld, 'ether') + ' ETH',
                                delivered: delivery.delivered
                            });
                        });
                        
                        return pendingDeliveries;
                    } else {
                        console.log("No pending deliveries found");
                        return [];
                    }
                } catch (error) {
                    console.error("Error fetching pending deliveries:", error);
                    return [];
                }
            } else {
                console.log("getPendingDeliveries method not available");
            }
            
            // Fallback: check buyer requests for completed purchases
            try {
            console.log("Checking buyer requests for completed purchases that may need delivery...");
            const buyerRequests = await contract.methods.getBuyerRequests().call({from: localAccount});
            const completedPurchases = buyerRequests.filter(req => req.status.toString() === "3");
            
            console.log("Completed purchases from requests:", completedPurchases);
            if (completedPurchases.length > 0) {
                completedPurchases.forEach((purchase, index) => {
                        try {
                    console.log(`Completed purchase ${index+1}:`, {
                        requestId: purchase.requestId,
                        cropID: purchase.cropID,
                        quantity: purchase.quantity,
                        farmer: purchase.farmer,
                        price: web3.utils.fromWei(purchase.price, 'ether') + ' ETH per unit',
                        total: web3.utils.fromWei(
                            web3.utils.toBN(purchase.price).mul(web3.utils.toBN(purchase.quantity)), 
                            'ether'
                        ) + ' ETH'
                    });
                        } catch (logError) {
                            console.error("Error logging purchase details:", logError);
                        }
                    });
                    
                    // Convert completed purchases to a delivery-like format
                    const pendingDeliveries = completedPurchases.map(purchase => ({
                        cropID: purchase.cropID,
                        quantity: purchase.quantity,
                        buyer: purchase.buyer,
                        farmer: purchase.farmer,
                        amountHeld: web3.utils.toBN(purchase.price).mul(web3.utils.toBN(purchase.quantity)).toString(),
                        delivered: false,
                        requestId: purchase.requestId
                    }));
                    
                    return pendingDeliveries;
                }
                return [];
            } catch (fallbackError) {
                console.error("Error in fallback delivery check:", fallbackError);
                return [];
            }
        } catch (error) {
            console.error("Error in debugPendingDeliveries:", error);
            return [];
        }
    };

    // Add this function at the end of the BuyerDashboard component, before the return statement

    // Utility function to analyze delivery issues
    const analyzeDeliveryIssues = async () => {
        try {
            if (!contract || !web3) {
                console.error("Contract or web3 not initialized");
                return;
            }
            
            console.log("=== DELIVERY ANALYSIS START ===");
            console.log("Connected account:", localAccount);
            
            // Get buyer requests to understand purchase status
            const buyerRequests = await contract.methods.getBuyerRequests().call({from: localAccount});
            console.log("Buyer requests:", buyerRequests);
            
            // Get pending deliveries
            const pendingDeliveries = await contract.methods.getPendingDeliveries().call({from: localAccount});
            console.log("Pending deliveries:", pendingDeliveries);
            
            // Get escrow balance
            const escrowBalance = await contract.methods.escrowBalances(localAccount).call();
            console.log("Escrow balance:", escrowBalance, "wei", web3.utils.fromWei(escrowBalance, 'ether'), "ETH");
            
            // Check account balance
            const accountBalance = await web3.eth.getBalance(localAccount);
            console.log("Account balance:", accountBalance, "wei", web3.utils.fromWei(accountBalance, 'ether'), "ETH");
            
            // Gas price analysis
            const gasPrice = await web3.eth.getGasPrice();
            console.log("Current gas price:", gasPrice, "wei", web3.utils.fromWei(gasPrice, 'gwei'), "gwei");
            
            // Analyze each pending delivery
            if (pendingDeliveries.length > 0) {
                console.log("Detailed analysis of pending deliveries:");
                for (let i = 0; i < pendingDeliveries.length; i++) {
                    const delivery = pendingDeliveries[i];
                    console.log(`\nDelivery ${i+1}:`);
                    console.log("Crop ID:", delivery.cropID.toString());
                    console.log("Quantity:", delivery.quantity.toString());
                    console.log("Amount held in escrow:", web3.utils.fromWei(delivery.amountHeld, 'ether'), "ETH");
                    console.log("Delivered status:", delivery.delivered);
                    
                    // Try to estimate gas for confirming this delivery
                    try {
                        const gasEstimate = await contract.methods.confirmDelivery(delivery.cropID).estimateGas({
                            from: localAccount
                        });
                        console.log("Gas estimate for confirmDelivery:", gasEstimate);
                        console.log("This delivery should be confirmable!");
                    } catch (error) {
                        console.error("Gas estimation failed:", error.message);
                        console.log("This delivery might not be confirmable due to contract conditions.");
                    }
                }
            } else {
                console.log("No pending deliveries found. All deliveries might already be confirmed.");
            }
            
            console.log("=== DELIVERY ANALYSIS END ===");
            
            setSnackbar({
                open: true,
                message: "Delivery analysis logged to console. Check browser developer tools.",
                severity: 'info'
            });
        } catch (error) {
            console.error("Error analyzing deliveries:", error);
            setSnackbar({
                open: true,
                message: `Error analyzing deliveries: ${error.message}`,
                severity: 'error'
            });
        }
    };

    // Add this effect to periodically check localStorage for removed crops
    useEffect(() => {
        // Check localStorage for removed crops on initial load and periodically
        const checkRemovedCrops = () => {
            console.log("Checking localStorage for removed crops...");
            const removedCropIds = getRemovedCropIdsFromLocalStorage();
            console.log("Current removed crop IDs:", removedCropIds);
            
            // If we have crops loaded and removedCropIds, filter them out
            if (crops.length > 0 && removedCropIds.length > 0) {
                // Filter out any crops that should be removed
                setCrops(currentCrops => 
                    currentCrops.filter(crop => 
                        !removedCropIds.includes(crop.cropID.toString())
                    )
                );
            }
        };
        
        // Initial check
        checkRemovedCrops();
        
        // Set up periodic checks to keep the view synchronized
        const intervalId = setInterval(checkRemovedCrops, 5000); // Check every 5 seconds
        
        return () => {
            clearInterval(intervalId); // Clean up on unmount
        };
    }, [crops.length]); // Re-run when crops.length changes

    // Add a listener for storage events to detect changes in removedCrops
    useEffect(() => {
        // This will handle updates from other tabs/windows
        const handleStorageChange = (event) => {
            if (event.key === 'removedCrops') {
                console.log('Detected change in removedCrops from another component:', event.newValue);
                const newRemovedCropIds = event.newValue ? JSON.parse(event.newValue) : [];
                
                // Filter any crops from the current view that are now in the removed list
                if (crops.length > 0) {
                    setCrops(prevCrops => prevCrops.filter(crop => 
                        !newRemovedCropIds.includes(crop.cropID.toString())
                    ));
                }
            }
        };
        
        // Add event listener
        window.addEventListener('storage', handleStorageChange);
        
        // Clean up on unmount
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [crops]);

    // Add a function to manually check for removed crops changes (useful for same-window updates)
    const checkForRemovedCropsChanges = () => {
        try {
            const removedCropIds = getRemovedCropIdsFromLocalStorage();
            console.log("Current removed crop IDs:", removedCropIds);
            
            // Filter any crops from the current view that are in the removed list
            if (crops.length > 0) {
                setCrops(prevCrops => {
                    const filteredCrops = prevCrops.filter(crop => 
                        !removedCropIds.includes(crop.cropID.toString())
                    );
                    
                    // If we filtered any crops, log them
                    if (filteredCrops.length < prevCrops.length) {
                        console.log(`Filtered out ${prevCrops.length - filteredCrops.length} removed crops`);
                    }
                    
                    return filteredCrops;
                });
            }
        } catch (error) {
            console.error("Error checking for removed crops changes:", error);
        }
    };

    // Add this to the existing fetchListings useEffect dependency array
    useEffect(() => {
        const intervalId = setInterval(() => {
            // Periodically check for removed crops changes
            checkForRemovedCropsChanges();
        }, 3000); // Check every 3 seconds
        
        return () => clearInterval(intervalId);
    }, [crops]);

    // Add a listener for the custom cropRemoved event
    useEffect(() => {
        const handleCropRemoved = (event) => {
            const { cropId, timestamp } = event.detail;
            console.log(`Received cropRemoved event for crop ID ${cropId} at ${new Date(timestamp).toLocaleTimeString()}`);
            
            // Immediately filter out the removed crop from the current view
            if (crops.length > 0) {
                setCrops(prevCrops => prevCrops.filter(crop => 
                    crop.cropID.toString() !== cropId
                ));
                
                // Also update the search and filter UI to reflect the changes
                setSnackbar({
                    open: true,
                    message: "A crop listing has been removed by the farmer",
                    severity: 'info'
                });
            }
        };
        
        // Add event listener for the custom event
        window.addEventListener('cropRemoved', handleCropRemoved);
        
        // Clean up on unmount
        return () => {
            window.removeEventListener('cropRemoved', handleCropRemoved);
        };
    }, [crops]);

    // Add this function to initialize and sync removed crops on component mount
    const initSyncRemovedCrops = () => {
        try {
            const removedCropIds = getRemovedCropIdsFromLocalStorage();
            console.log("BuyerDashboard: Initial sync of removed crop IDs:", removedCropIds);
            
            if (removedCropIds.length > 0 && crops.length > 0) {
                // Filter out any removed crops from current view
                const initialCrops = crops.filter(crop => !removedCropIds.includes(crop.cropID.toString()));
                
                // Only update if we actually filtered something
                if (initialCrops.length !== crops.length) {
                    console.log(`BuyerDashboard: Initially filtered out ${crops.length - initialCrops.length} removed crops`);
                    setCrops(initialCrops);
                }
            }
        } catch (error) {
            console.error("Error in initial removed crops sync:", error);
        }
    };

    // Call this function from an initial useEffect
    useEffect(() => {
        // Call immediately on mount
        initSyncRemovedCrops();
        
        // And also after crops have been loaded
        if (crops.length > 0) {
            initSyncRemovedCrops();
        }
    }, [crops.length === 0, getRemovedCropIdsFromLocalStorage]);

    // Add a function to clear and reset localStorage for removed crops
    const resetAndRefreshRemovedCrops = () => {
        try {
            // Get the raw value from localStorage
            const stored = localStorage.getItem('removedCrops');
            console.log("Current stored removedCrops:", stored);
            
            // Parse and re-save to ensure proper format
            const removedCropIds = getRemovedCropIdsFromLocalStorage();
            console.log("Parsed removedCropIds:", removedCropIds);
            
            // Force update localStorage with a clean array
            localStorage.setItem('removedCrops', JSON.stringify(removedCropIds));
            console.log("Reset and refreshed removedCrops in localStorage");
            
            // Apply filtering immediately to current view
            if (crops.length > 0) {
                setCrops(prevCrops => {
                    const filteredCrops = prevCrops.filter(crop => 
                        !removedCropIds.includes(crop.cropID.toString())
                    );
                    
                    if (filteredCrops.length < prevCrops.length) {
                        console.log(`Filtered out ${prevCrops.length - filteredCrops.length} removed crops during reset`);
                    }
                    
                    return filteredCrops;
                });
            }
            
            // Display a notification
            setSnackbar({
                open: true,
                message: "Synchronized removed crops data",
                severity: 'info'
            });
        } catch (error) {
            console.error("Error resetting removed crops:", error);
        }
    };

    // Call this function on component mount
    useEffect(() => {
        // Reset and refresh removed crops data on mount
        resetAndRefreshRemovedCrops();
        
        // And set up an interval to check periodically
        const intervalId = setInterval(() => {
            checkForRemovedCropsChanges();
        }, 5000); // Check every 5 seconds
        
        return () => clearInterval(intervalId);
    }, []);

    // Add a function to check for newly accepted requests and notify buyers
    const checkForAcceptedRequests = async () => {
        try {
            if (!contract || !web3 || !localAccount) return;
            
            console.log("Checking for recently accepted purchase requests...");
            
            // Get all buyer requests
            const buyerRequests = await contract.methods.getBuyerRequests().call({from: localAccount});
            console.log("All buyer requests:", buyerRequests);
            
            // Filter for accepted requests
            const acceptedRequests = buyerRequests.filter(req => req.status.toString() === "1"); // Status 1 = Accepted
            console.log("Accepted requests:", acceptedRequests);
            
            // Get already notified requests from localStorage
            const notifiedRequests = JSON.parse(localStorage.getItem('notifiedAcceptedRequests') || '[]');
            
            // Find newly accepted requests (accepted but not yet notified)
            const newlyAcceptedRequests = acceptedRequests.filter(
                req => !notifiedRequests.includes(req.requestId.toString())
            );
            
            console.log("Newly accepted requests:", newlyAcceptedRequests);
            
            if (newlyAcceptedRequests.length > 0) {
                console.log("Found newly accepted requests:", newlyAcceptedRequests);
                
                // Set tab value to the Orders tab (index 1) - IMPORTANT: Changed to 1 to match the My Requests tab
                setTabValue(1);
                
                // Automatically scroll to the accepted requests section
                setTimeout(() => {
                    const element = document.getElementById('accepted-requests-section');
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                        // Add a highlight animation to draw attention
                        element.style.animation = 'highlight-pulse 2s ease-in-out 3';
                    }
                }, 500);
                
                // Show notification for each newly accepted request
                for (const request of newlyAcceptedRequests) {
                    try {
                        // Get crop name for better notification
                        const cropDetails = await fetchCropDetails(request.cropID);
                        const cropName = cropDetails ? cropDetails.name : `Crop #${request.cropID}`;
                        
                        // Show notification
                        setSnackbar({
                            open: true,
                            message: `Your purchase request for ${cropName} has been accepted! Please complete the purchase to proceed with delivery.`,
                            severity: 'success',
                            duration: 10000, // Show for longer (10 seconds)
                            action: (
                                <Button 
                                    color="inherit" 
                                    size="small"
                                    onClick={() => {
                                        // Set tab value to the My Requests tab (index 1)
                                        setTabValue(1);
                                        // Automatically scroll to the accepted requests section
                                        setTimeout(() => {
                                            const element = document.getElementById('accepted-requests-section');
                                            if (element) element.scrollIntoView({ behavior: 'smooth' });
                                        }, 300);
                                    }}
                                >
                                    COMPLETE PURCHASE
                                </Button>
                            )
                        });
                        
                        // Add alert for extra visibility
                        setTimeout(() => {
                            alert(`Good news! Your purchase request for ${cropName} has been accepted by the farmer. You'll be redirected to complete the purchase and proceed with delivery.`);
                        }, 1000);
                        
                        // Add to notified requests
                        notifiedRequests.push(request.requestId.toString());
                    } catch (error) {
                        console.error("Error processing notification for request:", error);
                    }
                }
                
                // Save updated notified requests to localStorage
                localStorage.setItem('notifiedAcceptedRequests', JSON.stringify(notifiedRequests));
            }
        } catch (error) {
            console.error("Error checking for accepted requests:", error);
        }
    };

    // Call the check function periodically and on tab changes
    useEffect(() => {
        // Check for accepted requests on initial load
        checkForAcceptedRequests();
        
        // Set up interval to check periodically (every 30 seconds)
        const intervalId = setInterval(checkForAcceptedRequests, 30000);
        
        return () => clearInterval(intervalId);
    }, [contract, localAccount, web3]);

    // Also check when user changes tabs
    useEffect(() => {
        if (tabValue === 2) { // When user is on Orders tab
            checkForAcceptedRequests();
        }
    }, [tabValue]);

    // Function to handle cancellation of a purchase request
    const cancelPurchaseRequest = async (requestId) => {
        try {
            setLoading(true);
            console.log("Cancelling purchase request with ID:", requestId);
            
            // Find the request in our current list
            const requestToCancel = purchaseRequests.find(req => req.requestId === requestId);
            
            if (!requestToCancel) {
                throw new Error("Request not found");
            }
            
            // Different messages based on status
            let confirmMessage = "";
            let successMessage = "";
            
            if (requestToCancel.status.toString() === "0") {
                // Pending request
                confirmMessage = "Are you sure you want to cancel this pending purchase request? This will only hide it from your view, but it will still exist on the blockchain until the farmer rejects it.";
                successMessage = "Purchase request marked as cancelled. It will be hidden from your dashboard.";
            } else if (requestToCancel.status.toString() === "1") {
                // Approved request
                confirmMessage = "Are you sure you want to cancel this APPROVED purchase request? This will only hide it from your view. The farmer has already approved it and may be preparing your order. It's recommended to communicate with the farmer directly if possible.";
                successMessage = "Approved purchase request marked as cancelled. It will be hidden from your dashboard.";
            } else {
                throw new Error("Only pending or approved requests can be cancelled");
            }
            
            // Show confirmation dialog
            const isConfirmed = window.confirm(confirmMessage);
            
            if (!isConfirmed) {
                console.log("Cancellation aborted by user");
                setLoading(false);
                return;
            }
            
            // Since we can't directly cancel on the blockchain (only farmers can respond to requests),
            // we'll implement a client-side solution to hide cancelled requests
            
            // Get the current list of cancelled requests from localStorage
            const cancelledRequests = JSON.parse(localStorage.getItem('cancelledRequests') || '{}');
            
            // Add this request to the cancelled list
            cancelledRequests[requestId] = {
                requestId: requestId,
                cropName: requestToCancel.cropName,
                farmerName: requestToCancel.farmerName,
                status: requestToCancel.status.toString(),
                timestamp: new Date().getTime()
            };
            
            // Save back to localStorage
            localStorage.setItem('cancelledRequests', JSON.stringify(cancelledRequests));
            
            // If we had a custom bid for this request, remove it from localStorage
            try {
                const bids = JSON.parse(localStorage.getItem('cropBids') || '{}');
                if (bids[requestId]) {
                    delete bids[requestId];
                    localStorage.setItem('cropBids', JSON.stringify(bids));
                    console.log("Removed cancelled bid from localStorage for requestId:", requestId);
                }
            } catch (storageError) {
                console.error("Failed to update bids in localStorage:", storageError);
            }
            
            console.log("Request marked as cancelled locally:", requestId);
            
            // Update UI
            setSnackbar({
                open: true,
                message: successMessage,
                severity: 'success'
            });
            
            // Refresh purchase requests to apply the filter
            await fetchPurchaseRequests();
        } catch (error) {
            console.error("Error cancelling purchase request:", error);
            setSnackbar({
                open: true,
                message: `Error cancelling purchase request: ${error.message}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Function to restore a previously cancelled request
    const restoreCancelledRequest = async (requestId) => {
        try {
            console.log("Restoring cancelled request:", requestId);
            
            // Get the current list of cancelled requests from localStorage
            const cancelledRequests = JSON.parse(localStorage.getItem('cancelledRequests') || '{}');
            
            // Check if the request exists in the cancelled list
            if (!cancelledRequests[requestId]) {
                throw new Error("This request was not found in your cancelled requests");
            }
            
            // Remove the request from the cancelled list
            delete cancelledRequests[requestId];
            
            // Save back to localStorage
            localStorage.setItem('cancelledRequests', JSON.stringify(cancelledRequests));
            
            // Show success message
            setSnackbar({
                open: true,
                message: "Purchase request has been restored to your active requests",
                severity: 'success'
            });
            
            // Refresh purchase requests to show the restored request
            await fetchPurchaseRequests();
        } catch (error) {
            console.error("Error restoring cancelled request:", error);
            setSnackbar({
                open: true,
                message: `Error restoring request: ${error.message}`,
                severity: 'error'
            });
        }
    };

    // Function to fetch crop details by ID
    const fetchCropDetails = async (cropId) => {
        try {
            if (!contract || !contract.methods) {
                console.error("Contract not initialized in fetchCropDetails");
                return null;
            }

            // Get all listings and find the specific crop
            const allListings = await contract.methods.getAllListings().call();
            const crop = allListings.find(listing => listing.cropID.toString() === cropId.toString());
            
            if (!crop) {
                console.warn(`No crop found with ID ${cropId}`);
                return null;
            }

            // Get farmer name for the crop
            let farmerName = "Unknown Farmer";
            try {
                farmerName = await getFarmerName(crop.farmer);
            } catch (error) {
                console.warn("Could not fetch farmer name:", error);
            }

            // Get crop name
            let cropName = `Crop #${cropId}`;
            try {
                cropName = await getCropName(cropId);
            } catch (error) {
                console.warn("Could not fetch crop name:", error);
            }

            return {
                ...crop,
                name: cropName,
                farmerName
            };
        } catch (error) {
            console.error(`Error fetching crop details for ID ${cropId}:`, error);
            return null;
        }
    };

    // Add new function to check if bidding is allowed
    const isBiddingAllowed = (cultivationDate) => {
      if (!cultivationDate) return false;
      
      const now = new Date();
      const cultivation = new Date(cultivationDate);
      
      // Calculate dates
      const twoMonthsBefore = new Date(cultivation);
      twoMonthsBefore.setMonth(cultivation.getMonth() - 2);
      
      const fifteenDaysBefore = new Date(cultivation);
      fifteenDaysBefore.setDate(cultivation.getDate() - 15);
      
      // Check if current time is within the allowed bidding window
      return now >= twoMonthsBefore && now <= fifteenDaysBefore;
    };

    // Add function to get bidding status message
    const getBiddingStatusMessage = (cultivationDate) => {
      if (!cultivationDate) return "Cultivation date not set";
      
      const now = new Date();
      const cultivation = new Date(cultivationDate);
      
      // Calculate dates
      const twoMonthsBefore = new Date(cultivation);
      twoMonthsBefore.setMonth(cultivation.getMonth() - 2);
      
      const fifteenDaysBefore = new Date(cultivation);
      fifteenDaysBefore.setDate(cultivation.getDate() - 15);
      
      if (now < twoMonthsBefore) {
        const daysUntilBidding = Math.ceil((twoMonthsBefore - now) / (1000 * 60 * 60 * 24));
        return `Bidding will start in ${daysUntilBidding} days`;
      } else if (now > fifteenDaysBefore) {
        return "Bidding period has ended";
      } else {
        const daysUntilEnd = Math.ceil((fifteenDaysBefore - now) / (1000 * 60 * 60 * 24));
        return `Bidding ends in ${daysUntilEnd} days`;
      }
    };

    const handleBidClick = async (crop) => {
      if (!isBiddingAllowed(crop.cultivationDate)) {
        setSnackbar({
          open: true,
          message: getBiddingStatusMessage(crop.cultivationDate),
          severity: 'warning'
        });
        return;
      }

      setSelectedCrop(crop);
      setBidDialogOpen(true);
      setLoading(true);
      
      try {
        // Get raw bid data directly from the contract
        const rawBidData = await contract.methods.getBidsForCrop(crop.id).call();
        console.log(`Raw bids for crop ${crop.id}:`, rawBidData);
        
        // Format the bid data
        const formattedBids = [];
        if (rawBidData && Array.isArray(rawBidData) && rawBidData.length >= 2) {
          for (let i = 0; i < rawBidData[0].length; i++) {
            formattedBids.push({
              bidder: rawBidData[0][i],
              amount: web3.utils.fromWei(rawBidData[1][i], 'ether'),
              amountNumber: parseFloat(web3.utils.fromWei(rawBidData[1][i], 'ether')),
              timestamp: new Date(parseInt(rawBidData[2][i]) * 1000).toLocaleString()
            });
          }
          
          // Sort bids by amount (highest first)
          formattedBids.sort((a, b) => b.amountNumber - a.amountNumber);
        }
        
        // Set bid history
        setBidHistory(formattedBids);
        
        // Set highest bid
        if (formattedBids.length > 0) {
          const highestBid = formattedBids[0];
          console.log(`Highest bid for crop ${crop.id}:`, highestBid);
          
          // Update the highest bid in state
          setCropHighestBids(prev => ({
            ...prev,
            [crop.id]: highestBid
          }));
          
          // Set initial bid amount to the highest bid amount plus a small increment (2%)
          const minBidAmount = parseFloat(highestBid.amount);
          const suggestedBid = (minBidAmount * 1.02).toFixed(4);
          console.log(`Setting suggested bid to ${suggestedBid} (2% higher than ${minBidAmount})`);
          setBidAmount(suggestedBid);
        } else {
          // If no bids yet, set to minimum crop price plus a small increment (2%)
          const minPrice = parseFloat(formatEthPrice(crop.price));
          const suggestedBid = (minPrice * 1.02).toFixed(4);
          console.log(`Setting suggested bid to ${suggestedBid} (2% higher than base price ${minPrice})`);
          setBidAmount(suggestedBid);
          
          // Clear any highest bid data
          setCropHighestBids(prev => {
            const newState = { ...prev };
            delete newState[crop.id];
            return newState;
          });
        }
      } catch (error) {
        console.error("Error initializing bid dialog:", error);
        // If there was an error, use the base price
        const minPrice = parseFloat(formatEthPrice(crop.price));
        setBidAmount((minPrice * 1.02).toFixed(4));
      } finally {
        setLoading(false);
      }
    };

    // Update the handlePlaceBid function with more robust validation
    const handlePlaceBid = async () => {
      // Basic validation
      if (!selectedCrop) {
        setSnackbar({
          open: true,
          message: "No crop selected for bidding",
          severity: 'error'
        });
        return;
      }

      // Check if bidAmount is valid (not empty and is a valid number)
      if (!bidAmount || isNaN(parseFloat(bidAmount)) || parseFloat(bidAmount) <= 0) {
        setSnackbar({
          open: true,
          message: "Please enter a valid bid amount greater than zero",
          severity: 'error'
        });
        return;
      }

      if (!isBiddingAllowed(selectedCrop.cultivationDate)) {
        setSnackbar({
          open: true,
          message: getBiddingStatusMessage(selectedCrop.cultivationDate),
          severity: 'warning'
        });
        return;
      }

      try {
        // Get the most up-to-date highest bid before submitting
        const highestBid = await getHighestBidForCrop(selectedCrop.id);
        
        // Ensure numeric comparison
        const bidAmountNum = parseFloat(bidAmount);
        const minimumBidNum = highestBid
          ? parseFloat(highestBid.amount)
          : parseFloat(formatEthPrice(selectedCrop.price));
          
        console.log("Placing bid validation:", {
          yourBid: bidAmountNum,
          minimumBid: minimumBidNum,
          isValid: bidAmountNum >= minimumBidNum,
          highestBid: highestBid
        });

        // Check if bid amount is at least minimum
        if (bidAmountNum < minimumBidNum) {
          setSnackbar({
            open: true,
            message: `Your bid (${bidAmountNum.toFixed(4)} ETH) is too low. Minimum bid is ${minimumBidNum.toFixed(4)} ETH`,
            severity: 'error'
          });
          return;
        }

        setLoading(true);
        const bidPriceWei = web3.utils.toWei(bidAmount.toString(), 'ether');
        
        // Call the contract method to place bid
        await contract.methods.placeBid(selectedCrop.id, bidPriceWei)
          .send({ from: localAccount });

        setSnackbar({
          open: true,
          message: "Bid placed successfully!",
          severity: 'success'
        });
        
        // Close the dialog and refresh the crops list
        setBidDialogOpen(false);
        fetchListings();
        
        // Refresh the highest bids data
        const updatedHighestBid = await getHighestBidForCrop(selectedCrop.id);
        if (updatedHighestBid) {
          console.log("Updated highest bid after placing:", updatedHighestBid);
          setCropHighestBids(prev => ({
            ...prev,
            [selectedCrop.id]: updatedHighestBid
          }));
        }
      } catch (error) {
        console.error("Error placing bid:", error);
        // Rest of the error handling code remains unchanged
        let errorMessage = "Failed to place bid. ";
        
        // Extract more meaningful error message if available
        if (error.message) {
          if (error.message.includes("insufficient funds")) {
            errorMessage += "You don't have enough funds in your wallet.";
          } else if (error.message.includes("user rejected")) {
            errorMessage += "Transaction was rejected.";
          } else if (error.message.includes("invalid number")) {
            errorMessage += "Invalid bid amount format.";
          } else {
            errorMessage += "Please try again.";
          }
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    // Add function to fetch bid history
    const fetchBidHistory = async (cropId) => {
        try {
            const allBids = await contract.methods.getBidsForCrop(cropId).call();
            console.log(`Raw bids from contract for crop ${cropId}:`, allBids);
            
            // Check if the contract returned a proper structure
            if (!allBids || !Array.isArray(allBids) || allBids.length < 3) {
                console.error("Invalid format received from getBidsForCrop:", allBids);
                return [];
            }
            
            // Format bids correctly - contract returns array of arrays
            // [0] is array of bidder addresses
            // [1] is array of bid amounts (in wei)
            // [2] is array of timestamps
            const formattedBids = [];
            
            // Loop through all returned bids
            for (let i = 0; i < allBids[0].length; i++) {
                formattedBids.push({
                    bidder: allBids[0][i],
                    amount: web3.utils.fromWei(allBids[1][i], 'ether'),
                    amountNumber: parseFloat(web3.utils.fromWei(allBids[1][i], 'ether')),
                    timestamp: new Date(parseInt(allBids[2][i]) * 1000).toLocaleString()
                });
            }
            
            // Sort bids by numeric amount (highest first)
            formattedBids.sort((a, b) => b.amountNumber - a.amountNumber);
            
            console.log(`Fetched ${formattedBids.length} bids for crop ${cropId}:`, formattedBids);
            return formattedBids;
        } catch (error) {
            console.error(`Error fetching bid history for crop ${cropId}:`, error);
            return [];
        }
    };

    // Add function to get the highest bid for a crop
    const getHighestBidForCrop = async (cropId) => {
        try {
            // Fetch all bids for this crop from the contract
            const bidHistory = await fetchBidHistory(cropId);
            
            if (!bidHistory || bidHistory.length === 0) {
                console.log(`No bids found for crop ${cropId}`);
                return null; // No bids found
            }
            
            // First bid is already the highest after sorting in fetchBidHistory
            console.log(`Highest bid for crop ${cropId}:`, bidHistory[0]);
            return bidHistory[0];
        } catch (error) {
            console.error(`Error getting highest bid for crop ${cropId}:`, error);
            return null;
        }
    };

    // Helper function to get short display name for addresses
    const getBuyerDisplayName = (address) => {
        if (!address) return "";
        return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    };

        const handleStorageChange = (event) => {
            if (event.key === 'latest_bid_event') {
                try {
                    const bidEvent = JSON.parse(localStorage.getItem('latest_bid_event'));
                    if (bidEvent && bidEvent.type === 'new_bid_placed') {
                        console.log("Detected new bid from another user:", bidEvent);
                        
                        // Only process if it's a different user
                        if (bidEvent.bidder !== localAccount) {
                            console.log("Refreshing bids for crop:", bidEvent.cropId);
                            
                            // Refresh the highest bid data for this crop
                            getHighestBidForCrop(bidEvent.cropId)
                                .then(highestBid => {
                                    if (highestBid) {
                                        console.log("Updated highest bid:", highestBid);
                                        setCropHighestBids(prev => ({
                                            ...prev,
                                            [bidEvent.cropId]: highestBid
                                        }));
                                    }
                                })
                                .catch(error => {
                                    console.error("Error refreshing highest bid:", error);
                                });
                                
                            // Refresh listing data
                            fetchListings();
                        }
                    }
                } catch (error) {
                    console.error("Error processing storage event for bids:", error);
                }
            }
        };
        
        // Add listener for storage events
        window.addEventListener('storage', handleStorageChange);
        
        // Check for existing bids on mount
        const checkExistingBids = async () => {
            try {
                // Get list of crop IDs from listings
                if (crops && crops.length > 0) {
                    console.log("Checking for existing bids on initial mount");
                    
                    // Get highest bids for all crops
                    for (const crop of crops) {
                        if (crop && crop.id) {
                            const highestBid = await getHighestBidForCrop(crop.id);
                            if (highestBid) {
                                console.log(`Found highest bid for crop ${crop.id}:`, highestBid);
                                setCropHighestBids(prev => ({
                                    ...prev,
                                    [crop.id]: highestBid
                                }));
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error checking existing bids:", error);
            }
        };
        
        checkExistingBids();
        
        // Clean up listener on component unmount
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [crops, localAccount]);

    return (
        <Box sx={{ 
            flexGrow: 1, 
            minHeight: '100vh', 
            bgcolor: theme === 'dark' ? 'hsl(var(--background))' : '#f5f5f5'
        }}>
            <AppBar 
                position="static" 
                sx={{ 
                    bgcolor: theme === 'dark' 
                        ? 'hsl(var(--card))' 
                        : 'hsl(var(--primary))'
                }}
                className="glass"
                elevation={theme === 'dark' ? 0 : 4}
            >
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Farm Assure - Buyer Dashboard
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 500, 
                                damping: 30, 
                                delay: 0.4 
                            }}
                            className="flex items-center gap-2"
                        >
                            <ThemeToggle />
                        </motion.div>
                        
                        <Chip
                            avatar={<Avatar src={profileImageUrl}><PersonIcon /></Avatar>}
                            label={buyerName || (localAccount ? `${localAccount.substring(0, 6)}...${localAccount.substring(localAccount.length - 4)}` : 'Not Connected')}
                            variant="outlined"
                            sx={{ mr: 2, bgcolor: 'white', cursor: 'pointer' }}
                            onClick={() => navigate("/profile")}
                        />
                        <IconButton color="inherit" onClick={() => navigate("/")}>
                            <LogoutIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
                <Paper sx={{ mb: 3, p: 2 }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange} 
                        centered
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        <Tab label="Available Crops" icon={<InventoryIcon />} iconPosition="start" />
                        <Tab label="My Requests" icon={<ShoppingCartIcon />} iconPosition="start" />
                        <Tab label="My Purchases" icon={<LocalShippingIcon />} iconPosition="start" />
                    </Tabs>
                </Paper>

                {tabValue === 0 && (
                    <>
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h4" component="h1" gutterBottom>
                                Available Crops
                            </Typography>
                            <TextField
                                placeholder="Search crops..."
                                variant="outlined"
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                }}
                                sx={{ width: 250 }}
                            />
                        </Box>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Grid container spacing={3}>
                                {filteredCrops.length > 0 ? (
                                    filteredCrops.map((crop, index) => (
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                <Box 
                                                    sx={{ 
                                                        height: 200, 
                                                        backgroundColor: 'grey.200',
                                                        backgroundImage: `url(${getCropImageUrl(crop)})`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center'
                                                    }}
                                                />
                                                <CardContent sx={{ flexGrow: 1 }}>
                                                    <Typography variant="h5" component="h2" gutterBottom>
                                                        {crop.cropName}
                                                    </Typography>
                                                    <Divider sx={{ my: 1.5 }} />
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                                                        <Typography variant="body1">
                                                            Price: {formatEthPrice(crop.price)} ETH
                                                        </Typography>
                                                    </Box>
                                                    
                                                    {/* Display highest bid if available */}
                                                    {crop && cropHighestBids && cropHighestBids[crop.id] && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, pl: 1 }}>
                                                            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                                                Highest Bid: {cropHighestBids[crop.id].amount} ETH
                                                                {cropHighestBids[crop.id].bidder && 
                                                                  ` by ${getBuyerDisplayName(cropHighestBids[crop.id].bidder)}`}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <InventoryIcon color="primary" sx={{ mr: 1 }} />
                                                        <Typography variant="body1">
                                                            Available: {crop.quantity} kg
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <CalendarMonthIcon color="primary" sx={{ mr: 1 }} />
                                                        <Typography variant="body1">
                                                            Delivery: {crop.deliveryDate}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                                                        Farmer: {crop.farmerName || (crop.farmer.substring(0, 6) + '...' + crop.farmer.substring(crop.farmer.length - 4))}
                                                    </Typography>
                                                </CardContent>
                                                <CardActions>
                                                    <Button 
                                                        variant="contained" 
                                                        color="primary" 
                                                        fullWidth
                                                        onClick={() => openBuyModal(crop)}
                                                        disabled={parseInt(crop.quantity) === 0}
                                                    >
                                                        {parseInt(crop.quantity) === 0 ? 'Out of Stock' : 'Request to Buy'}
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))
                                ) : (
                                    <Grid item xs={12}>
                                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                                            <Typography variant="h6" color="textSecondary">
                                                No crops available matching your search.
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>
                        )}
                    </>
                )}

                {tabValue === 1 && (
                    <>
                        <Typography variant="h4" component="h1" gutterBottom>
                            My Purchase Requests
                        </Typography>

            {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer component={Paper} elevation={3}>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell><Typography variant="subtitle2">Crop</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2">Farmer</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2">Quantity</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2">Price</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2">Actions</Typography></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {purchaseRequests.length > 0 ? (
                                            purchaseRequests.map((request, index) => (
                                                <TableRow 
                                                    key={index} 
                                                    sx={{
                                                        ...(request.status && request.status.toString() === "1" && {
                                                            bgcolor: 'rgba(232, 245, 233, 0.4)',
                                                            '&:hover': { bgcolor: 'rgba(232, 245, 233, 0.6)' }
                                                        })
                                                    }}
                                                >
                                                    <TableCell>{request.cropName}</TableCell>
                                                    <TableCell>{request.farmerName}</TableCell>
                                                    <TableCell>{request.quantity} kg</TableCell>
                                                    <TableCell>{formatEthPrice(request.price)} ETH per kg</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={request.statusText} 
                                                            color={
                                                                request.status && request.status.toString() === "0" ? "warning" : 
                                                                request.status && request.status.toString() === "1" ? "success" : 
                                                                request.status && request.status.toString() === "2" ? "error" : 
                                                                "default"
                                                            }
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {request.status && request.status.toString() === "1" && (
                                                            <>
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                    size="medium"
                                                                onClick={() => createThenConfirmDelivery(request)}
                                                                disabled={loading}
                                                                    startIcon={<ShoppingCartIcon />}
                                                                    sx={{ 
                                                                        animation: 'pulse 1.5s infinite', 
                                                                        '@keyframes pulse': {
                                                                            '0%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)' },
                                                                            '70%': { boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)' },
                                                                            '100%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)' }
                                                                        },
                                                                        fontWeight: 'bold',
                                                                        py: 1,
                                                                        mr: 1
                                                                    }}
                                                            >
                                                                Complete Purchase & Pay
                                                                </Button>
                                                                <Button
                                                                    variant="outlined"
                                                                    color="error"
                                                                    size="medium"
                                                                    onClick={() => cancelPurchaseRequest(request.requestId)}
                                                                    disabled={loading}
                                                                    startIcon={<CancelIcon />}
                                                                    sx={{ 
                                                                        fontWeight: 'medium',
                                                                        py: 1
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </>
                                                        )}
                                                        
                                                        {request.status && request.status.toString() === "0" && (
                                                            <Button
                                                                variant="outlined"
                                                                color="error"
                                                                size="medium"
                                                                onClick={() => cancelPurchaseRequest(request.requestId)}
                                                                disabled={loading}
                                                                startIcon={<CancelIcon />}
                                                                sx={{ 
                                                                    fontWeight: 'medium',
                                                                    py: 1
                                                                }}
                                                            >
                                                                Cancel Request
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    <Typography variant="body1" sx={{ py: 2 }}>
                                                        No purchase requests found.
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        {/* Recently Cancelled Requests Section */}
                        {(() => {
                            // Get cancelled requests from localStorage
                            const cancelledRequestsObj = JSON.parse(localStorage.getItem('cancelledRequests') || '{}');
                            const cancelledRequestsArray = Object.values(cancelledRequestsObj);
                            
                            // Only show if there are cancelled requests
                            if (cancelledRequestsArray.length === 0) return null;
                            
                            // Only show requests cancelled in the last 48 hours
                            const recentCancelledRequests = cancelledRequestsArray.filter(req => {
                                const cancelledTime = req.timestamp || 0;
                                const twoHoursAgo = new Date().getTime() - (48 * 60 * 60 * 1000);
                                return cancelledTime > twoHoursAgo;
                            });
                            
                            if (recentCancelledRequests.length === 0) return null;
                            
                            return (
                                <Box sx={{ mt: 4, mb: 2 }}>
                                    <Paper elevation={1} sx={{ p: 3, bgcolor: '#fff9f9', borderRadius: 2, border: '1px dashed #ffcccc' }}>
                                        <Typography variant="h6" component="h3" gutterBottom color="error.dark">
                                            <CancelIcon sx={{ mr: 1, fontSize: 20, verticalAlign: 'text-bottom' }} />
                                            Recently Cancelled Requests
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            You've cancelled the following requests recently. If you changed your mind, you can restore them to your active requests.
                                        </Typography>
                                        
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Crop</TableCell>
                                                        <TableCell>Farmer</TableCell>
                                                        <TableCell>Status</TableCell>
                                                        <TableCell>Cancelled</TableCell>
                                                        <TableCell>Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {recentCancelledRequests.map((req, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>{req.cropName || 'Unknown Crop'}</TableCell>
                                                            <TableCell>{req.farmerName || 'Unknown Farmer'}</TableCell>
                                                            <TableCell>
                                                                {req.status === "0" ? (
                                                                    <Chip size="small" label="Pending" color="warning" />
                                                                ) : req.status === "1" ? (
                                                                    <Chip size="small" label="Approved" color="success" />
                                                                ) : (
                                                                    <Chip size="small" label="Unknown" color="default" />
                                                                )}
                                                             </TableCell>
                                                             <TableCell>
                                                                 {req.timestamp ? 
                                                                     new Date(req.timestamp).toLocaleString() : 
                                                                     'Unknown time'
                                                                 }
                                                             </TableCell>
                                                             <TableCell>
                                                                 <Button
                                                                     variant="text"
                                                                     color="primary"
                                                                     size="small"
                                                                     onClick={() => restoreCancelledRequest(req.requestId)}
                                                                     disabled={loading}
                                                                 >
                                                                     Restore
                                                                 </Button>
                                                             </TableCell>
                                                         </TableRow>
                                                     ))}
                                                 </TableBody>
                                             </Table>
                                         </TableContainer>
                                         
                                         {recentCancelledRequests.some(req => req.status === "1") && (
                                             <Alert severity="warning" sx={{ mt: 2 }}>
                                                 <AlertTitle>Important Note About Approved Requests</AlertTitle>
                                                 <Typography variant="body2">
                                                     Some of your cancelled requests were already approved by farmers. Cancelling these locally does not notify the farmers. 
                                                     They may still be preparing your order. Please contact the farmers directly if possible.
                                                 </Typography>
                                             </Alert>
                                         )}
                                    </Paper>
                                </Box>
                            );
                        })()}

                        {/* Accepted requests section with ID for scrolling */}
                        {purchaseRequests.filter(req => req.status && req.status.toString() === "1").length > 0 && (
                            <Box id="accepted-requests-section" sx={{ 
                                mt: 4, 
                                p: 3, 
                                bgcolor: '#e8f5e9', 
                                borderRadius: 2, 
                                border: '2px solid #81c784',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                position: 'relative',
                                overflow: 'hidden',
                                '@keyframes highlight-pulse': {
                                    '0%': { boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
                                    '50%': { boxShadow: '0 0 20px 5px rgba(129, 199, 132, 0.7)' },
                                    '100%': { boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }
                                }
                            }}>
                                <Typography variant="h5" gutterBottom color="success.main" sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    fontWeight: 'bold'
                                }}>
                                    <CheckCircleIcon sx={{ mr: 1, fontSize: 30 }} /> Your Request Has Been Accepted!
                                </Typography>
                                <Typography variant="body1" paragraph sx={{ fontWeight: 'medium' }}>
                                    Great news! The farmer has accepted your purchase request. You need to complete the payment to proceed with delivery.
                                </Typography>
                                <Alert severity="info" sx={{ mb: 3 }} icon={<PriorityHighIcon />}>
                                    <AlertTitle>Important Next Steps</AlertTitle>
                                    <Box component="ol" sx={{ pl: 2, my: 1 }}>
                                        <li><strong>Click the "Complete Purchase & Pay" button</strong> below to release payment into escrow</li>
                                        <li>After payment, the farmer will deliver your crop</li>
                                        <li>Once you receive the crop, confirm the delivery in the "My Purchases" tab</li>
                                    </Box>
                                </Alert>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                        Please complete the purchase within 24 hours to maintain your reserved crop
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        onClick={() => {
                                            // Find the first accepted request to scroll to
                                            const acceptedRequest = purchaseRequests.find(req => req.status && req.status.toString() === "1");
                                            if (acceptedRequest) {
                                                // Find the element containing this request's "Complete Purchase & Pay" button
                                                const requestRows = document.querySelectorAll("tr");
                                                let targetButton = null;
                                                
                                                requestRows.forEach(row => {
                                                    if (row.textContent.includes(acceptedRequest.cropName) && 
                                                        row.textContent.includes("Complete Purchase & Pay")) {
                                                        const button = row.querySelector("button");
                                                        if (button) targetButton = button;
                                                    }
                                                });
                                                
                                                if (targetButton) {
                                                    // Scroll to the button and highlight it
                                                    targetButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    targetButton.style.animation = 'none';
                                                    setTimeout(() => {
                                                        targetButton.style.animation = 'pulse 1.5s infinite';
                                                    }, 10);
                                                }
                                            }
                                        }}
                                        startIcon={<ShoppingCartIcon />}
                                        sx={{ 
                                            py: 1.5, 
                                            px: 4, 
                                            fontSize: '1.1rem',
                                            animation: 'pulse 1.5s infinite',
                                            '@keyframes pulse': {
                                                '0%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)' },
                                                '70%': { boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)' },
                                                '100%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)' }
                                            }
                                        }}
                                    >
                                        Go to Purchase & Payment Button
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </>
                )}

                {tabValue === 2 && (
                    <>
                        <Typography variant="h4" component="h1" gutterBottom>
                            My Purchases
                        </Typography>
                        
                        <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#f9f9f9' }}>
                            <Typography variant="subtitle1" color="primary" fontWeight="bold" gutterBottom>
                                How to confirm your deliveries:
                            </Typography>
                            <ol>
                                <li>First, ensure your purchase is completed by checking the "My Requests" tab</li>
                                <li>After completing a purchase, <strong>wait at least 15 seconds</strong> for the blockchain to update</li>
                                <li>If you just completed a purchase, refresh this page</li>
                                <li>Click the "Confirm Delivery" button once the delivery is ready</li>
                            </ol>
                            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    color="secondary"
                                    onClick={analyzeDeliveryIssues}
                                >
                                    Analyze Delivery Issues
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    color="primary"
                                    onClick={() => {
                                        try {
                                            setEmergencyTabMode(false);
                                            fetchBuyerOrders().catch(err => {
                                                console.error("Error refreshing orders:", err);
                                                setEmergencyTabMode(true);
                                                setSnackbar({
                                                    open: true,
                                                    message: "Error refreshing orders. Please try again.",
                                                    severity: 'error'
                                                });
                                            });
                                        } catch (error) {
                                            console.error("Error in refresh click handler:", error);
                                            setEmergencyTabMode(true);
                                        }
                                    }}
                                >
                                    Refresh Orders
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    color="info"
                                    onClick={() => {
                                        try {
                                            window.location.reload();
                                        } catch (error) {
                                            console.error("Error reloading page:", error);
                                        }
                                    }}
                                >
                                    Reload Page
                                </Button>
                            </Box>
                        </Paper>
                        
                        {emergencyTabMode ? (
                            // Emergency fallback view
                            <Paper elevation={3} sx={{ p: 3, mt: 2, bgcolor: '#fff9c4', borderRadius: 2 }}>
                                <Alert severity="warning" sx={{ mb: 3 }}>
                                    <AlertTitle>Limited View Mode</AlertTitle>
                                    <Typography variant="body2">
                                        We're having trouble loading your purchase data from the blockchain. This could be due to:
                                    </Typography>
                                    <ul>
                                        <li>MetaMask connection issues</li>
                                        <li>Network congestion</li>
                                        <li>Contract interaction errors</li>
                                    </ul>
                                </Alert>
                                
                                <Box sx={{ textAlign: 'center', my: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        To see your purchases, try these steps:
                                    </Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon><RefreshIcon /></ListItemIcon>
                                            <ListItemText primary="Check that your MetaMask is connected and on the correct network" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon>
                                            <ListItemText primary="Make sure you're logged in with the correct account" />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon><HistoryIcon /></ListItemIcon>
                                            <ListItemText primary="Wait a few minutes and try again (blockchain transactions take time)" />
                                        </ListItem>
                                    </List>
                                    
                                    <Box sx={{ mt: 3 }}>
                                        <Button 
                                            variant="contained" 
                                            color="primary"
                                            onClick={() => window.location.reload()}
                                            startIcon={<RefreshIcon />}
                                            sx={{ mr: 2 }}
                                        >
                                            Reload the Page
                                        </Button>
                                        <Button 
                                            variant="outlined" 
                                            color="secondary"
                                            onClick={() => setTabValue(0)}
                                            startIcon={<ArrowBackIcon />}
                                        >
                                            Return to Available Crops
                                        </Button>
                                    </Box>
                                </Box>
                            </Paper>
                        ) : loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer component={Paper} elevation={3}>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell><Typography variant="subtitle2">Crop</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2">Farmer</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2">Quantity</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2">Amount Paid</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2">Action</Typography></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {buyerOrders.length > 0 ? (
                                            buyerOrders.map((order, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{order.cropName || `Crop #${order.cropID}`}</TableCell>
                                                    <TableCell>{order.quantity}</TableCell>
                                                    <TableCell>{order.farmerName || "Unknown Farmer"}</TableCell>
                                                    <TableCell>{order.priceInEth || order.priceEth || order.amountHeldEth || "Unknown"} ETH</TableCell>
                                                    <TableCell>{order.formattedTimestamp || order.estimatedDelivery || "N/A"}</TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Chip 
                                                                label={order.statusText || (order.orderType === 'pending' ? "Awaiting Delivery" : "Completed")}
                                                                color={order.orderType === 'pending' ? "warning" : "success"}
                                                                sx={{ mr: 1 }}
                                                            />
                                                                    <Button
                                                                variant="outlined" 
                                                                        size="small"
                                                                onClick={() => {
                                                                    // Handle view details action
                                                                    console.log("View details for", order);
                                                                }}
                                                            >
                                                                Check Status
                                                            </Button>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    <Typography variant="body1" sx={{ py: 2 }}>
                                                        No completed purchases found. Check the My Requests tab to complete your purchases!
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </>
                )}
            </Container>

            {/* Buy Crop Dialog */}
            <Dialog 
                open={showModal} 
                onClose={closeModal}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6">
                        Request to Buy {selectedCrop?.cropName}
                    </Typography>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedCrop && (
                        <Grid container spacing={2}>
                            {selectedCrop.imageCID && (
                                <Grid item xs={12}>
                                    <Box 
                                        component="img"
                                        src={getCropImageUrl(selectedCrop)}
                                        alt={selectedCrop.cropName}
                                        sx={{ 
                                            width: '100%', 
                                            maxHeight: 250, 
                                            objectFit: 'contain',
                                            borderRadius: 1,
                                            mb: 2
                                        }}
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Price:</strong> {formatEthPrice(selectedCrop.price)} ETH per kg
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Available Quantity:</strong> {selectedCrop.quantity} kg
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Delivery Date:</strong> {selectedCrop.deliveryDate}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    <strong>Farmer:</strong> {selectedCrop.farmerName || selectedCrop.farmer}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Quantity (kg)"
                                    type="number"
                                    fullWidth
                                    variant="outlined"
                                    value={purchaseQuantity}
                                    onChange={(e) => setPurchaseQuantity(e.target.value)}
                                    InputProps={{ 
                                        inputProps: { 
                                            min: 1, 
                                            max: selectedCrop.quantity,
                                            step: 1
                                        } 
                                    }}
                                    required
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={bidEnabled}
                                            onChange={(e) => setBidEnabled(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="I want to bid a custom price"
                                />
                                {bidEnabled && (
                                    <>
                                        {selectedCrop && cropHighestBids && cropHighestBids[selectedCrop.id] ? (
                                            <Alert severity="warning" sx={{ mt: 1, mb: 1 }}>
                                                <strong>ATTENTION:</strong> The current highest bid is <strong>{parseFloat(cropHighestBids[selectedCrop.id].amount).toFixed(4)} ETH</strong> 
                                                {' '}by {getBuyerDisplayName(cropHighestBids[selectedCrop.id].bidder)}
                                                {cropHighestBids[selectedCrop.id].bidder.toLowerCase() === localAccount.toLowerCase() && " (You)"}. 
                                                Your bid must be higher than this amount.
                                            </Alert>
                                        ) : (
                                            <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
                                                <strong>No bids yet!</strong> Minimum bid is {formatEthPrice(selectedCrop?.price)} ETH (base price).
                                            </Alert>
                                        )}
                                        <TextField
                                            label="Your Bid (ETH per kg)"
                                            value={bidPrice}
                                            onChange={(e) => setBidPrice(e.target.value)}
                                            type="number"
                                            fullWidth
                                            disabled={!bidEnabled || loading}
                                            inputProps={{ 
                                              step: "0.01",
                                              min: selectedCrop && cropHighestBids && cropHighestBids[selectedCrop.id] 
                                                ? parseFloat(cropHighestBids[selectedCrop.id].amount) 
                                                : parseFloat(formatEthPrice(selectedCrop?.price)),
                                            }}
                                            InputProps={{
                                              startAdornment: <InputAdornment position="start">ETH</InputAdornment>
                                            }}
                                            helperText={
                                              selectedCrop && cropHighestBids && cropHighestBids[selectedCrop.id] 
                                              ? `Minimum bid: ${parseFloat(cropHighestBids[selectedCrop.id].amount).toFixed(4)} ETH (current highest bid by ${getBuyerDisplayName(cropHighestBids[selectedCrop.id].bidder)})` 
                                              : `Minimum bid: ${formatEthPrice(selectedCrop?.price)} ETH (base price)`
                                            }
                                            FormHelperTextProps={{
                                              sx: { 
                                                fontWeight: 'bold',
                                                color: theme === 'dark' ? 'warning.main' : 'error.main'
                                              }
                                            }}
                                            error={
                                              bidPrice !== '' && (
                                                isNaN(parseFloat(bidPrice)) || 
                                                parseFloat(bidPrice) <= 0 || 
                                                (selectedCrop && parseFloat(bidPrice) < (
                                                  cropHighestBids && cropHighestBids[selectedCrop.id] 
                                                  ? parseFloat(cropHighestBids[selectedCrop.id].amount) 
                                                  : parseFloat(formatEthPrice(selectedCrop.price))
                                                ))
                                              )
                                            }
                                            required={bidEnabled}
                                            margin="normal"
                                            onBlur={() => {
                                              // Validate bid on blur
                                              if (bidPrice && !isNaN(parseFloat(bidPrice)) && selectedCrop) {
                                                const bidAmountNum = parseFloat(bidPrice);
                                                const minimumBidNum = selectedCrop && cropHighestBids && cropHighestBids[selectedCrop.id]
                                                  ? parseFloat(cropHighestBids[selectedCrop.id].amount)
                                                  : parseFloat(formatEthPrice(selectedCrop.price));
                                                    
                                                console.log("Bid field validation:", {
                                                  bidValue: bidAmountNum,
                                                  minRequired: minimumBidNum,
                                                  isValid: bidAmountNum >= minimumBidNum
                                                });
                                                
                                                if (bidAmountNum < minimumBidNum) {
                                                  setSnackbar({
                                                    open: true,
                                                    message: `Your bid must be at least ${minimumBidNum.toFixed(4)} ETH`,
                                                    severity: 'warning'
                                                  });
                                                }
                                              }
                                            }}
                                        />
                                    </>
                                )}
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Message to Farmer (optional)"
                                    fullWidth
                                    variant="outlined"
                                    value={requestMessage}
                                    onChange={(e) => setRequestMessage(e.target.value)}
                                    placeholder="Why are you interested in this crop? Any special requirements?"
                                    multiline
                                    rows={3}
                                    margin="normal"
                                />
                            </Grid>
                            {purchaseQuantity && (
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mt: 1 }}>
                                        <Typography variant="body1" align="center">
                                            <strong>Estimated Cost:</strong> {bidEnabled && bidPrice 
                                                ? (parseFloat(bidPrice) * parseFloat(purchaseQuantity)).toFixed(4) 
                                                : (parseFloat(formatEthPrice(selectedCrop.price)) * parseFloat(purchaseQuantity)).toFixed(4)} ETH
                                        </Typography>
                                        <Typography variant="body2" align="center" color="text.secondary" mt={1}>
                                            {bidEnabled 
                                                ? "Your custom bid price will be sent to the farmer for consideration."
                                                : "Note: This is an estimate. You'll only pay after the farmer accepts your request."}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={closeModal} color="inherit">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleBuy} 
                        variant="contained" 
                        color="primary"
                        disabled={
                            !purchaseQuantity || 
                            loading ||
                            (bidEnabled && (
                                !bidPrice ||
                                isNaN(parseFloat(bidPrice)) || 
                                parseFloat(bidPrice) <= 0 ||
                                (selectedCrop && parseFloat(bidPrice) < (
                                    cropHighestBids && cropHighestBids[selectedCrop.id] 
                                    ? parseFloat(cropHighestBids[selectedCrop.id].amount) 
                                    : parseFloat(formatEthPrice(selectedCrop?.price))
                                ))
                            ))
                        }
                    >
                        {loading ? <CircularProgress size={24} /> : 'Send Purchase Request'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity} 
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Bid Dialog */}
            <Dialog 
                open={bidDialogOpen} 
                onClose={() => setBidDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Place Bid for {selectedCrop?.cropName || selectedCrop?.name}
                </DialogTitle>
                <DialogContent>
                    {selectedCrop && (
                        <>
                            <Typography variant="body1" gutterBottom>
                                Base Price: {formatEthPrice(selectedCrop.price)} ETH
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Cultivation Date: {selectedCrop.cultivationDate}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Quantity: {selectedCrop.quantity} kg
                            </Typography>
                            
                            {/* Add bidding status */}
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Typography 
                                    variant="body2" 
                                    color={isBiddingAllowed(selectedCrop.cultivationDate) ? "success.main" : "error.main"}
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    {getBiddingStatusMessage(selectedCrop.cultivationDate)}
                                </Typography>
                            </Box>

                            {/* Show highest bid information */}
                            {cropHighestBids && cropHighestBids[selectedCrop.id] && (
                                <Box sx={{ 
                                    mt: 2, 
                                    mb: 2, 
                                    p: 2, 
                                    borderRadius: '8px',
                                    backgroundColor: theme === 'dark' ? 'rgba(52,211,153,0.1)' : 'rgba(52,211,153,0.05)',
                                    border: '1px solid',
                                    borderColor: theme === 'dark' ? 'rgba(52,211,153,0.2)' : 'rgba(52,211,153,0.15)'
                                }}>
                                    <Typography 
                                        variant="h6" 
                                        color="success.main"
                                        sx={{ fontWeight: 'bold' }}
                                    >
                                        Current Highest Bid: {parseFloat(cropHighestBids[selectedCrop.id].amount).toFixed(4)} ETH
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        by {getBuyerDisplayName(cropHighestBids[selectedCrop.id].bidder)}
                                        {cropHighestBids[selectedCrop.id].bidder.toLowerCase() === localAccount.toLowerCase() && 
                                            " (You)"}
                                    </Typography>
                                    <Alert severity="info" sx={{ mt: 1 }}>
                                        Your new bid must be higher than the current highest bid.
                                    </Alert>
                                </Box>
                            )}

                            <TextField
                                autoFocus
                                margin="dense"
                                label="Your Bid Amount (ETH)"
                                type="number"
                                fullWidth
                                value={bidAmount}
                                onChange={(e) => {
                                  // Only allow valid numeric input
                                  const value = e.target.value;
                                  if (value === '' || (!isNaN(parseFloat(value)) && isFinite(value))) {
                                    setBidAmount(value);
                                  }
                                }}
                                onBlur={() => {
                                  // Validate bid on blur and make sure it's a valid number
                                  if (bidAmount && !isNaN(parseFloat(bidAmount)) && selectedCrop) {
                                    const bidAmountNum = parseFloat(bidAmount);
                                    const minimumBidNum = selectedCrop && cropHighestBids && cropHighestBids[selectedCrop.id]
                                      ? parseFloat(cropHighestBids[selectedCrop.id].amount)
                                      : parseFloat(formatEthPrice(selectedCrop.price));
                                        
                                    console.log("Bid field validation:", {
                                      bidValue: bidAmountNum,
                                      minRequired: minimumBidNum,
                                      isValid: bidAmountNum >= minimumBidNum
                                    });
                                    
                                    if (bidAmountNum < minimumBidNum) {
                                      setSnackbar({
                                        open: true,
                                        message: `Your bid must be at least ${minimumBidNum.toFixed(4)} ETH`,
                                        severity: 'warning'
                                      });
                                    }
                                  }
                                }}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">ETH</InputAdornment>,
                                  inputProps: {
                                    min: selectedCrop && cropHighestBids && cropHighestBids[selectedCrop.id] 
                                      ? parseFloat(cropHighestBids[selectedCrop.id].amount) 
                                      : parseFloat(formatEthPrice(selectedCrop?.price)),
                                    step: 0.001
                                  }
                                }}
                                error={
                                  bidAmount !== '' && (
                                    isNaN(parseFloat(bidAmount)) || 
                                    parseFloat(bidAmount) <= 0 || 
                                    (selectedCrop && parseFloat(bidAmount) < (
                                      cropHighestBids && cropHighestBids[selectedCrop.id] 
                                      ? parseFloat(cropHighestBids[selectedCrop.id].amount) 
                                      : parseFloat(formatEthPrice(selectedCrop.price))
                                    ))
                                  )
                                }
                                helperText={
                                  bidAmount === '' ? "Please enter a bid amount" :
                                  isNaN(parseFloat(bidAmount)) ? "Please enter a valid number" :
                                  parseFloat(bidAmount) <= 0 ? "Bid amount must be greater than zero" :
                                  selectedCrop && parseFloat(bidAmount) < (
                                    cropHighestBids && cropHighestBids[selectedCrop.id] 
                                    ? parseFloat(cropHighestBids[selectedCrop.id].amount) 
                                    : parseFloat(formatEthPrice(selectedCrop.price))
                                  )
                                  ? `Bid too low! Minimum: ${
                                    selectedCrop && cropHighestBids && cropHighestBids[selectedCrop.id] 
                                    ? cropHighestBids[selectedCrop.id].amount 
                                    : formatEthPrice(selectedCrop.price)
                                  } ETH` 
                                  : selectedCrop && cropHighestBids && cropHighestBids[selectedCrop.id] 
                                  ? `Minimum bid: ${cropHighestBids[selectedCrop.id].amount} ETH (current highest bid)` 
                                  : `Minimum bid: ${formatEthPrice(selectedCrop?.price)} ETH (base price)`
                                }
                                disabled={!isBiddingAllowed(selectedCrop?.cultivationDate)}
                                required
                            />

                            {/* Add bid history section */}
                            {bidHistory.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Bid History (sorted highest to lowest)
                                    </Typography>
                                    <Paper sx={{ maxHeight: 250, overflow: 'auto' }}>
                                        <List>
                                            {bidHistory.map((bid, index) => (
                                                <ListItem 
                                                    key={index}
                                                    sx={{
                                                        backgroundColor: index === 0 ? 
                                                            (theme === 'dark' ? 'rgba(52,211,153,0.1)' : 'rgba(52,211,153,0.05)') : 
                                                            'transparent',
                                                        borderRadius: '4px',
                                                        mb: 1
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={
                                                            <Typography 
                                                                variant="body1" 
                                                                sx={{ 
                                                                    fontWeight: index === 0 ? 'bold' : 'normal',
                                                                    color: index === 0 ? 'success.main' : 'inherit'
                                                                }}
                                                            >
                                                                {parseFloat(bid.amount).toFixed(4)} ETH
                                                                {index === 0 && " (Highest Bid)"}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <>
                                                                Bid by {bid.bidder.slice(0, 6)}...{bid.bidder.slice(-4)}
                                                                {bid.bidder.toLowerCase() === localAccount.toLowerCase() && 
                                                                    " (You)"} at {bid.timestamp}
                                                            </>
                                                        }
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Paper>
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBidDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handlePlaceBid} 
                        variant="contained"
                        disabled={
                            !selectedCrop ||
                            !isBiddingAllowed(selectedCrop?.cultivationDate) || 
                            !bidAmount || 
                            bidAmount === '' ||
                            isNaN(parseFloat(bidAmount)) || 
                            parseFloat(bidAmount) <= 0 ||
                            (selectedCrop && parseFloat(bidAmount) < (
                                cropHighestBids && cropHighestBids[selectedCrop.id] 
                                ? parseFloat(cropHighestBids[selectedCrop.id].amount) 
                                : parseFloat(formatEthPrice(selectedCrop?.price))
                            ))
                        }
                    >
                        {loading ? <CircularProgress size={24} /> : "Place Bid"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default BuyerDashboard;
