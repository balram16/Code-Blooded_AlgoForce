import React, { useState, useEffect } from "react";
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
    Tab
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
    Search as SearchIcon
} from '@mui/icons-material';
import { getIPFSGatewayURL } from '../services/pinataService';
import { getUserDisplayName, getProfileImageUrl, getUserProfile } from '../services/profileService';

const CONTRACT_ADDRESS = "0xd6B17407713602eCBbC1eDCa66B2ec8Dc8aB4B06"; // Replace with your deployed contract address
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
    }
  ];

function BuyerDashboard({ account }) {
    const [localAccount, setLocalAccount] = useState(account || "");
    const [contract, setContract] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [crops, setCrops] = useState([]);
    const [deliveries, setDeliveries] = useState([]);
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
    
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            try {
                console.log("Starting contract initialization...");
                const contractInstance = await initializeContract();
                
                if (contractInstance && contractInstance.methods) {
                    console.log("Contract initialized successfully, setting up listeners");
                    
                    // Add timeout to ensure contract is fully initialized before fetching data
                    setTimeout(async () => {
                        try {
                            await fetchListings();
                            await fetchPurchaseRequests();
                            await fetchBuyerOrders();
                } catch (error) {
                            console.error("Error fetching initial data:", error);
                        }
                    }, 500);
                    
                    // Set up event listener for account changes
                    if (window.ethereum) {
                        window.ethereum.on('accountsChanged', (accounts) => {
                            console.log("MetaMask account changed:", accounts[0]);
                            setLocalAccount(accounts[0]);
                            // Re-initialize with new account
                            initializeContract();
                        });
                    }
            } else {
                    console.error("Contract initialization failed");
                    setSnackbar({
                        open: true,
                        message: "Failed to connect to blockchain. Please check MetaMask.",
                        severity: 'error'
                    });
                }
            } catch (error) {
                console.error("Error in initialization:", error);
                setSnackbar({
                    open: true,
                    message: `Initialization error: ${error.message}`,
                    severity: 'error'
                });
            }
        };
        
        init();
        
        // Cleanup function
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => {
                    console.log("Removed account change listener");
                });
            }
        };
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
        if (tabValue === 2 && contract && localAccount) {
            fetchBuyerOrders();
            // Call debug function to help troubleshoot
            debugContractState();
        }
    }, [tabValue, contract, localAccount]);

    useEffect(() => {
        if (account) {
            loadBuyerProfile();
        }
    }, [account]);

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
        console.log("Fetching purchase requests...");
        
        if (!contractInstance || !contractInstance.methods) {
            console.log("Contract not initialized yet, skipping fetch purchase requests");
            return;
        }

        if (!localAccount) {
            console.log("No account connected, skipping fetch purchase requests");
            return;
        }
        
        try {
            console.log("Calling contract method: getBuyerRequests");
            const requests = await contractInstance.methods.getBuyerRequests().call({ from: localAccount });
            console.log("Raw purchase requests:", requests);
            
            if (!requests || !Array.isArray(requests)) {
                console.error("Invalid requests data:", requests);
                setPurchaseRequests([]);
                return;
            }
            
            // Filter out empty requests (address(0))
            const validRequests = requests.filter(
                request => request.farmer !== "0x0000000000000000000000000000000000000000"
            );
            
            // Enrich with crop and farmer names
            const enrichedRequests = await Promise.all(
                validRequests.map(async (request) => {
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
            
            console.log("Enriched purchase requests:", enrichedRequests);
            setPurchaseRequests(enrichedRequests);
        } catch (error) {
            console.error("Error fetching purchase requests:", error);
            setSnackbar({
                open: true,
                message: `Error fetching purchase requests: ${error.message}`,
                severity: 'error'
            });
        }
    };

    // Replace buyCrop with requestPurchase
    const requestPurchase = async (cropID, quantity, message) => {
        try {
            setLoading(true);
            console.log("Requesting to buy crop:", cropID, "Quantity:", quantity, "Message:", message);
            
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
                message: message
            });
            
            // Send the transaction
            const result = await contract.methods.requestPurchase(cropID, quantity, message).send({
                from: localAccount
            });
            
            console.log("Purchase request transaction result:", result);

            setSnackbar({
                open: true,
                message: "Purchase request sent successfully! The farmer will review your request.",
                severity: 'success'
            });
            
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

    // New function to complete the purchase after request is accepted
    const completePurchase = async (requestId, priceInWei, quantity) => {
        try {
            setLoading(true);
            console.log("Completing purchase for request:", requestId);
            
            // Calculate total price
            const totalWei = web3.utils.toBN(priceInWei)
                .mul(web3.utils.toBN(quantity))
                .toString();
            
            console.log("Total price in Wei:", totalWei);
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
                
                setSnackbar({
                    open: true,
                    message: "Purchase completed successfully! Payment sent to escrow.",
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
            
            // Check for common error patterns
            if (error.code === -32603) {
                // MetaMask internal JSON-RPC error
                if (error.message.includes("insufficient funds")) {
                    errorMessage = "You don't have enough ETH to complete this purchase";
                    actionAdvice = "Add more ETH to your wallet and try again.";
                } else if (error.message.includes("gas required exceeds allowance")) {
                    errorMessage = "Transaction requires more gas than allowed";
                    actionAdvice = "Try increasing your MetaMask gas limit settings.";
                } else if (error.message.includes("already completed")) {
                    errorMessage = "This purchase has already been completed";
                    actionAdvice = "Try confirming the delivery directly.";
                } else {
                    // Generic RPC error
                    errorMessage = "MetaMask RPC error. This might be because the contract rejected the transaction.";
                    actionAdvice = "Try again later or contact support if this persists.";
                    
                    // Debug log detailed error for troubleshooting
                    console.log("Full RPC error details:", error);
                }
            }
            
            setSnackbar({
                open: true,
                message: `Error completing purchase: ${errorMessage}. ${actionAdvice}`,
                severity: 'error'
            });
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

    const openBuyModal = (crop) => {
        setSelectedCrop(crop);
        setPurchaseQuantity("");
        setRequestMessage("");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedCrop(null);
        setPurchaseQuantity("");
        setRequestMessage("");
    };

    // Update the handleBuy function to use requestPurchase
    const handleBuy = () => {
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

        requestPurchase(selectedCrop.cropID, purchaseQuantity, requestMessage || "Interested in buying this crop");
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const filteredCrops = crops.filter(crop =>
        crop.cropName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchListings = async () => {
        try {
            if (!contract || !contract.methods) {
                console.error("Contract not initialized in fetchListings");
                return;
            }
            
            console.log("Fetching all listings with contract:", contract);
            const listings = await contract.methods.getAllListings().call({from: localAccount});
            console.log("Raw listings from contract:", listings);
            
            // Enrich the listings with additional data
            const enrichedListings = await Promise.all(listings.map(async (listing) => {
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
            
            console.log("Enriched listings:", enrichedListings);
            setCrops(enrichedListings);
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
                return;
            }
            
            console.log("Fetching buyer orders and checking deliveries...");
            
            // First check for pending deliveries using our debug function
            const pendingDeliveries = await debugPendingDeliveries();
            
            // Use getBuyerRequests to get completed requests (status 3)
            const requests = await contract.methods.getBuyerRequests().call({ from: localAccount });
            console.log("All buyer requests:", requests);
            
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
            
            // Enrich with crop and farmer information
            const enrichedOrders = await Promise.all(completedRequests.map(async (order) => {
                // Get farmer name
                const farmerName = await getFarmerName(order.farmer);
                
                // Find the crop name from the listings if possible
                let cropName = `Crop #${order.cropID}`;
                for (const crop of crops) {
                    if (crop.cropID && crop.cropID.toString() === order.cropID.toString()) {
                        cropName = crop.cropName;
                        break;
                    }
                }
                
                // Calculate total amount held in escrow (price * quantity)
                const totalAmount = web3.utils.toBN(order.price)
                    .mul(web3.utils.toBN(order.quantity))
                    .toString();
                
                // Check if this order's cropID has a pending delivery
                const hasPendingDelivery = deliveryStatusMap[order.cropID] || false;
                
                return {
                    ...order,
                    cropName,
                    farmerName,
                    amountHeld: totalAmount,
                    isDelivered: !hasPendingDelivery // If no pending delivery exists, assume it's been delivered
                };
            }));
            
            console.log("Enriched orders:", enrichedOrders);
            // Set these as the deliveries
            setDeliveries(enrichedOrders);
        } catch (error) {
            console.error("Error fetching buyer orders:", error);
            setSnackbar({
                open: true,
                message: "Error fetching your orders. Please try again.",
                severity: 'error'
            });
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
            
            // Check available methods
            const methods = Object.keys(contract.methods);
            console.log("Available methods:", methods);
            
            // First, calculate total price
            const totalPrice = web3.utils.toBN(purchase.price)
                .mul(web3.utils.toBN(purchase.quantity))
                .toString();
            
            console.log("Total price in wei:", totalPrice);
            console.log("Total price in ETH:", web3.utils.fromWei(totalPrice, 'ether'));
            
            // Try completePurchase first
            if (contract.methods.completePurchase) {
                try {
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
                    
                    // First call completePurchase to create the delivery
                    const result = await contract.methods.completePurchase(purchase.requestId).send({
                        from: localAccount,
                        value: totalPrice, // Required to send the payment
                        gas: 600000,
                        gasPrice: adjustedGasPrice
                    });
                    
                    console.log("completePurchase successful:", result);
                    
                    setSnackbar({
                        open: true,
                        message: "Purchase completed successfully! The delivery has been created. You can confirm it after a short delay.",
                        severity: 'success'
                    });
                    
                    // Refresh the purchases immediately to get the updated data
                    await fetchBuyerOrders();
                    console.log("Fetched updated orders");
                    
                    // Set loading to false immediately after purchase is completed
                    setLoading(false);
                    
                    // Show a follow-up message about the delivery confirmation
                    setSnackbar({
                        open: true,
                        message: "Please wait 15-30 seconds and then press 'Confirm Delivery' button manually in My Orders tab.",
                        severity: 'info'
                    });
                    
                    return true;
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
                }
            } else {
                setSnackbar({
                    open: true,
                    message: "Contract doesn't have a method to complete the purchase.",
                    severity: 'error'
                });
                return false;
            }
        } catch (error) {
            console.error("Error creating delivery:", error);
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

    // Debug function to check for pending deliveries and show details
    const debugPendingDeliveries = async () => {
        try {
            if (!contract || !contract.methods) {
                console.log("Contract not initialized for debugging deliveries");
                return;
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
                }
            } else {
                console.log("getPendingDeliveries method not available");
            }
            
            // Fallback: check buyer requests for completed purchases
            console.log("Checking buyer requests for completed purchases that may need delivery...");
            const buyerRequests = await contract.methods.getBuyerRequests().call({from: localAccount});
            const completedPurchases = buyerRequests.filter(req => req.status.toString() === "3");
            
            console.log("Completed purchases from requests:", completedPurchases);
            if (completedPurchases.length > 0) {
                completedPurchases.forEach((purchase, index) => {
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
                });
            } else {
                console.log("No completed purchases found");
            }
            
            return completedPurchases;
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

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            bgcolor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <AppBar position="static" sx={{ bgcolor: '#1a237e' }}>
                <Toolbar>
                    <ShoppingCartIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Farm Assure - Buyer Dashboard
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                                                <TableRow key={index}>
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
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                size="small"
                                                                onClick={() => createThenConfirmDelivery(request)}
                                                                disabled={loading}
                                                            >
                                                                Complete Purchase & Pay
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
                                    onClick={fetchBuyerOrders}
                                >
                                    Refresh Orders
                                </Button>
                            </Box>
                        </Paper>
                        
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
                                            <TableCell><Typography variant="subtitle2">Amount Paid</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2">Action</Typography></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {deliveries.length > 0 ? (
                                            deliveries.map((delivery, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        {delivery.cropName || `Crop #${delivery.cropID}`}
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            ID: {delivery.cropID}
                                                        </Typography>
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            Request ID: {delivery.requestId}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>{delivery.farmerName}</TableCell>
                                                    <TableCell>{delivery.quantity} kg</TableCell>
                                                    <TableCell>
                                                        {web3 ? web3.utils.fromWei(delivery.amountHeld, "ether") : 
                                                          window.web3 ? window.web3.utils.fromWei(delivery.amountHeld, "ether") : "0"} ETH
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={delivery.isDelivered ? "Delivered" : "Awaiting Confirmation"} 
                                                            color={delivery.isDelivered ? "success" : "warning"}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            {!delivery.isDelivered && (
                                                                <>
                                                                    <Button
                                                                        variant="contained"
                                                                        color="success"
                                                                        size="small"
                                                                        startIcon={<CheckCircleIcon />}
                                                                        onClick={() => confirmDelivery(delivery.cropID)}
                                                                        disabled={loading}
                                                                    >
                                                                        Confirm Delivery
                                                                    </Button>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        This will confirm delivery and release payment to the farmer.
                                                                    </Typography>
                                                                </>
                                                            )}
                                                            
                                                            <Button
                                                                variant="text"
                                                                color="info"
                                                                size="small"
                                                                onClick={async () => {
                                                                    setLoading(true);
                                                                    try {
                                                                        // First check delivery permission
                                                                        const permission = await checkDeliveryPermission(delivery);
                                                                        console.log("Permission check result:", permission);
                                                                        
                                                                        // Then debug pending deliveries
                                                                        await debugPendingDeliveries();
                                                                        
                                                                        setSnackbar({
                                                                            open: true,
                                                                            message: `Status check: ${permission.message}`,
                                                                            severity: permission.canConfirm ? 'info' : 'warning'
                                                                        });
                                                                    } catch (error) {
                                                                        console.error("Error checking status:", error);
                                                                        setSnackbar({
                                                                            open: true,
                                                                            message: `Error: ${error.message}`,
                                                                            severity: 'error'
                                                                        });
                                                                    } finally {
                                                                        setLoading(false);
                                                                    }
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
                                            <strong>Estimated Cost:</strong> {(parseFloat(formatEthPrice(selectedCrop.price)) * parseFloat(purchaseQuantity)).toFixed(4)} ETH
                                        </Typography>
                                        <Typography variant="body2" align="center" color="text.secondary" mt={1}>
                                            Note: This is an estimate. You'll only pay after the farmer accepts your request.
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
                        disabled={!purchaseQuantity || loading}
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
        </Box>
    );
}

export default BuyerDashboard;
