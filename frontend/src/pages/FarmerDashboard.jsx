import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract, ethers } from "ethers";
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
    DialogContentText,
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
    Tab,
    Tabs,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Badge
} from '@mui/material';
import { 
    Add as AddIcon, 
    Logout as LogoutIcon, 
    Person as PersonIcon, 
    FilterList as FilterListIcon,
    Agriculture as AgricultureIcon,
    AttachMoney as AttachMoneyIcon,
    CalendarMonth as CalendarMonthIcon,
    Inventory as InventoryIcon,
    CloudUpload as CloudUploadIcon,
    Image as ImageIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Notifications as NotificationsIcon
} from '@mui/icons-material';
import { uploadImageToPinata, getIPFSGatewayURL } from '../services/pinataService';
import { getUserDisplayName, getProfileImageUrl } from '../services/profileService';
import Web3 from 'web3';

const CONTRACT_ADDRESS = "0xd6B17407713602eCBbC1eDCa66B2ec8Dc8aB4B06";

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

function FarmerDashboard({ account }) {
    const [localAccount, setLocalAccount] = useState(account || "");
    const [contract, setContract] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [crops, setCrops] = useState([]);
    const [orders, setOrders] = useState([]);
    const [purchaseRequests, setPurchaseRequests] = useState([]);
    const [hasNewRequests, setHasNewRequests] = useState(false);
    const [cropName, setCropName] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [cropID, setCropID] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [cropImage, setCropImage] = useState(null);
    const [cropImagePreview, setCropImagePreview] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageCID, setImageCID] = useState("");
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [tabValue, setTabValue] = useState(0);
    const [farmerName, setFarmerName] = useState("");
    const [profileImageUrl, setProfileImageUrl] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            await initializeContract();
        };
        init();

        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                setLocalAccount(accounts[0]);
                // Re-initialize with new account
                initializeContract();
            });
        }
    }, []);

    // Refresh data when contract changes
    useEffect(() => {
        if (contract && localAccount) {
            fetchListings();
            fetchPurchaseRequests();
        }
    }, [contract, localAccount]);

    useEffect(() => {
        if (account) {
            loadFarmerProfile();
        }
    }, [account]);

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
            
            // Fetch data once contract is initialized
            await fetchUserProfile(contractInstance, account);
            await fetchListings();
            await fetchPurchaseRequests();
            
            // Debug contract state
            await debugContractState();
            
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

    const loadFarmerProfile = async () => {
        try {
            const displayName = await getUserDisplayName(account);
            setFarmerName(displayName);
            
            // Attempt to get the profile image
            const profileImage = await getProfileImageUrl(account);
            if (profileImage) {
                setProfileImageUrl(profileImage);
            }
        } catch (error) {
            console.error("Error loading farmer profile:", error);
        }
    };

    // Function to fetch user profile data from contract
    const fetchUserProfile = async (contractInstance, userAddress) => {
        try {
            if (!contractInstance) contractInstance = contract;
            if (!userAddress) userAddress = localAccount;
            
            const profile = await contractInstance.methods.getUserProfile(userAddress).call();
            console.log("User profile data:", profile);
            
            // Profile returns [name, profileImageCID, location, contact, role]
            if (profile && profile.length >= 2) {
                const [name, profileImageCID] = profile;
                setFarmerName(name || "Farmer");
                
                if (profileImageCID) {
                    const imageUrl = getIPFSGatewayURL(profileImageCID);
                    setProfileImageUrl(imageUrl);
                }
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const 
    fetchListings = async () => {
        try {
            if (!contract || !contract.methods) {
                console.error("Contract not initialized in fetchListings");
                return;
            }
            
            console.log("Fetching listings using contract methods:", Object.keys(contract.methods));
            const listings = await contract.methods.getMyListings().call({from: localAccount});
            console.log("Raw listings from contract:", listings);
            
            const enrichedListings = await Promise.all(listings.map(async (listing) => {
                // Convert price from wei to ether
                const priceInEth = web3 ? web3.utils.fromWei(listing.price, 'ether') : '0';
                
                // Get the IPFS gateway URL for the image if available
                const imageUrl = listing.imageCID 
                    ? getIPFSGatewayURL(listing.imageCID) 
                    : null;

                return {
                    ...listing,
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
                message: "Error fetching listings. Please try again.",
                severity: 'error'
            });
        }
    };

    const fetchOrdersForFarmer = async (contractInstance) => {
        try {
            // This would need to be implemented in your contract
            // For now, we'll leave it empty as a placeholder
            // setOrders(await contractInstance.getOrdersForFarmer());
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    // New function to fetch purchase requests
    const fetchPurchaseRequests = async (contractInstance) => {
        try {
            if (!contractInstance) contractInstance = contract;
            console.log("Fetching purchase requests...");
            console.log("Contract instance:", contractInstance);
            
            // Log the ABI function to debug
            console.log("getFarmerRequests function:", 
                CONTRACT_ABI.find(item => item.name === "getFarmerRequests"));
            
            const requests = await contractInstance.methods.getFarmerRequests().call({from: localAccount});
            console.log("Raw purchase requests:", requests);
            
            // Get raw array values for better debugging
            if (requests && requests.length > 0) {
                // Log raw array values at numeric indexes to see actual structure
                console.log("Request as array:", Array.from({length: 10}, (_, i) => requests[0][i]));
                
                console.log("First request object keys:", Object.keys(requests[0]));
                requests.forEach((req, index) => {
                    console.log(`Request ${index}:`, {
                        requestId: req.requestId ? req.requestId.toString() : 'undefined',
                        cropID: req.cropID ? req.cropID.toString() : 'undefined',
                        quantity: req.quantity ? req.quantity.toString() : 'undefined',
                        price: req.price ? req.price.toString() : 'undefined',
                        status: req.status !== undefined ? req.status.toString() : 'undefined',
                        buyer: req.buyer || 'undefined',
                        farmer: req.farmer || 'undefined',
                        message: req.message || 'undefined'
                    });
                });
            }
            
            // Enrich requests with buyer names
            const enrichedRequests = await Promise.all(requests.map(async (request) => {
                let cropName = "Unknown";
                
                // Find crop in the crops list to get the name
                for (const crop of crops) {
                    if (crop && crop.cropID && request && request.cropID && 
                        crop.cropID.toString() === request.cropID.toString()) {
                        cropName = crop.cropName;
                        break;
                    }
                }
                
                const buyerName = await getBuyerName(request.buyer);
                
                // Convert status number to string - handle if status is undefined
                const statusMap = ["Pending", "Accepted", "Rejected", "Completed"];
                let statusText = "Unknown";
                if (request && request.status !== undefined) {
                    statusText = statusMap[Number(request.status)] || "Unknown";
                }
                
                // Calculate total price using Web3.js (not ethers.js)
                const totalPrice = request && request.price && request.quantity
                    ? web3.utils.toBN(request.price).mul(web3.utils.toBN(request.quantity)).toString()
                    : '0';
                
                const enrichedRequest = {
                    ...request,
                    cropName,
                    buyerName,
                    statusText,
                    totalPrice
                };
                
                console.log("Enriched request:", enrichedRequest);
                return enrichedRequest;
            }));
            
            // Check if there are any new pending requests - safely check if status exists
            const hasPending = enrichedRequests.some(req => 
                (req && req.status && req.status.toString() === "0") || 
                (req && req.statusText === "Pending")
            );
            setHasNewRequests(hasPending);
            
            console.log("Final purchase requests:", enrichedRequests);
            setPurchaseRequests(enrichedRequests);
        } catch (error) {
            console.error("Error fetching purchase requests:", error);
            setSnackbar({
                open: true,
                message: "Error fetching purchase requests. Please try again.",
                severity: 'error'
            });
        }
    };

    // Function to get buyer's display name
    const getBuyerName = async (buyerAddress) => {
        try {
            return await getUserDisplayName(buyerAddress);
        } catch (error) {
            console.error("Error getting buyer name:", error);
            return buyerAddress.substring(0, 6) + '...' + buyerAddress.substring(buyerAddress.length - 4);
        }
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setCropImage(file);
            
            // Create a preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setCropImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = async () => {
        if (!cropImage) {
            setSnackbar({
                open: true,
                message: "Please select an image to upload.",
                severity: 'warning'
            });
            return;
        }

        setUploadingImage(true);
        try {
            const cid = await uploadImageToPinata(cropImage);
            setImageCID(cid);
            setSnackbar({
                open: true,
                message: "Image uploaded successfully!",
                severity: 'success'
            });
        } catch (error) {
            console.error("Error uploading image:", error);
            setSnackbar({
                open: true,
                message: "Error uploading image. Please try again.",
                severity: 'error'
            });
        } finally {
            setUploadingImage(false);
        }
    };

    const addListing = async () => {
        if (!cropName || !price || !quantity || !cropID || !deliveryDate) {
            setSnackbar({
                open: true,
                message: "Please fill in all fields",
                severity: 'warning'
            });
            return;
        }

        setLoading(true);
        try {
            // Convert price to wei
            const priceInWei = web3.utils.toWei(price, 'ether');

            // Add the listing with image CID if available
            await contract.methods.addListing(
                cropName,
                priceInWei,
                cropID,
                quantity,
                deliveryDate,
                imageCID || "" // Use empty string if no image uploaded
            ).send({
                from: localAccount
            });

            setSnackbar({
                open: true,
                message: "Crop listing added successfully!",
                severity: 'success'
            });

            // Reset form and close dialog
            resetForm();
            setShowAddDialog(false);

            // Refresh listings
            await fetchListings();
        } catch (error) {
            console.error("Error adding listing:", error);
            setSnackbar({
                open: true,
                message: "Error adding listing. Please try again.",
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const confirmDelivery = async (cropID) => {
        try {
            setLoading(true);
            const tx = await contract.confirmDelivery(cropID);
            await tx.wait();
            
            setSnackbar({
                open: true,
                message: "Delivery confirmed successfully!",
                severity: 'success'
            });
            
            // Refresh orders
            await fetchOrdersForFarmer();
        } catch (error) {
            console.error("Error confirming delivery:", error);
            setSnackbar({
                open: true,
                message: `Error confirming delivery: ${error.message}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // New function to respond to purchase requests
    const respondToPurchaseRequest = async (requestId, accept) => {
        try {
            setLoading(true);
            console.log("Responding to purchase request", { requestId, accept });
            
            // Debug contract state before attempting to respond
            await debugContractState(requestId);
            
            // Check if contract is initialized
            if (!contract) {
                console.error("Contract not initialized");
                setSnackbar({
                    open: true,
                    message: "Contract not initialized. Please refresh the page and try again.",
                    severity: 'error'
                });
                return;
            }
            
            // Check if respondToPurchaseRequest function exists on contract
            if (!contract.methods || !contract.methods.respondToPurchaseRequest) {
                console.error("respondToPurchaseRequest function not found on contract", contract);
                setSnackbar({
                    open: true,
                    message: "Contract method not found. Please refresh the page and try again.",
                    severity: 'error'
                });
                return;
            }
            
            console.log("Sending transaction with params:", requestId, accept);
            const tx = await contract.methods.respondToPurchaseRequest(requestId, accept).send({
                from: localAccount
            });
            console.log("Transaction sent:", tx);
            
            setSnackbar({
                open: true,
                message: accept ? "Purchase request accepted!" : "Purchase request rejected.",
                severity: accept ? 'success' : 'info'
            });
            
            // Refresh purchase requests
            await fetchPurchaseRequests();
        } catch (error) {
            console.error("Error responding to purchase request:", error);
            setSnackbar({
                open: true,
                message: `Error responding to purchase request: ${error.message}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };
    
    // Debug function to check contract state
    const debugContractState = async (requestId) => {
        try {
            console.log("Debugging contract state for requestId:", requestId);
            
            // Get all requests again to verify what's available
            const requests = await contract.methods.getFarmerRequests().call({from: localAccount});
            console.log("All requests at debug time:", requests);
            
            // If we have the specific request ID, check if it exists in the array
            if (requestId) {
                const matchingRequest = requests.find(req => 
                    req && req.requestId && req.requestId.toString() === requestId.toString()
                );
                console.log("Matching request found:", matchingRequest || "No matching request found");
            }
        } catch (error) {
            console.error("Error in debugContractState:", error);
        }
    };

    const resetForm = () => {
        setCropName("");
        setPrice("");
        setQuantity("");
        setCropID("");
        setDeliveryDate("");
        setCropImage(null);
        setCropImagePreview(null);
        setImageCID("");
    };

    const handleOpenAddDialog = () => {
        resetForm();
        setShowAddDialog(true);
    };

    const handleCloseAddDialog = () => {
        setShowAddDialog(false);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        if (newValue === 1) {
            // If switching to the purchase requests tab, clear the notification indicator
            setHasNewRequests(false);
        }
    };

    // Helper function to safely format ETH price
    const formatEthPrice = (weiPrice) => {
        try {
            if (!web3 || !weiPrice) return '0';
            return web3.utils.fromWei(weiPrice.toString(), 'ether');
        } catch (error) {
            console.error("Error formatting ETH price:", error, weiPrice);
            return "0";
        }
    };

    // Helper function to get crop image URL
    const getCropImageUrl = (crop) => {
        if (crop && crop.imageCID) {
            return getIPFSGatewayURL(crop.imageCID);
        }
        // Return a default image if no CID is available
        return 'https://via.placeholder.com/300x200?text=No+Image';
    };

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            <AppBar position="static" sx={{ bgcolor: '#2e7d32' }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Farm Assure - Farmer Dashboard
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {hasNewRequests && (
                            <IconButton color="inherit" sx={{ mr: 1 }} onClick={() => setTabValue(1)}>
                                <Badge color="error" variant="dot">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                        )}
                        <Chip
                            avatar={<Avatar src={profileImageUrl}><PersonIcon /></Avatar>}
                            label={farmerName || (localAccount ? `${localAccount.substring(0, 6)}...${localAccount.substring(localAccount.length - 4)}` : 'Not Connected')}
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

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Welcome, {farmerName || 'Farmer'}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddDialog}
                    >
                        Add New Crop
                    </Button>
                </Box>

                <Paper sx={{ mb: 3, p: 2 }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange} 
                        centered
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        <Tab label="My Listings" />
                        <Tab 
                            label="Purchase Requests" 
                            icon={hasNewRequests ? <Badge color="error" variant="dot"><NotificationsIcon /></Badge> : null}
                            iconPosition="end"
                        />
                        <Tab label="Orders & Deliveries" />
                    </Tabs>
                </Paper>

                {tabValue === 0 && (
                    // My Listings Tab
                    <Grid container spacing={3}>
                        {loading ? (
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                                <CircularProgress />
                            </Grid>
                        ) : crops.length > 0 ? (
                            crops.map((crop, index) => (
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
                                            <Typography variant="h5" component="h2">
                                                {crop.cropName}
                                            </Typography>
                                            <Divider sx={{ my: 1.5 }} />
                                            <Typography variant="body1">
                                                Price: {formatEthPrice(crop.price)} ETH per kg
                                            </Typography>
                                            <Typography variant="body1">
                                                Available: {crop.quantity.toString()} kg
                                            </Typography>
                                            <Typography variant="body1">
                                                Crop ID: {crop.cropID.toString()}
                                            </Typography>
                                            <Typography variant="body1">
                                                Delivery Date: {crop.deliveryDate}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                        ))
                    ) : (
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="h6" color="textSecondary">
                                        No crops listed. Add your first crop!
                                    </Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                )}

                {tabValue === 1 && (
                    // Purchase Requests Tab
                    <>
                        <Typography variant="h5" gutterBottom>
                            Purchase Requests
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
                                            <TableCell><Typography variant="subtitle2" sx={{fontWeight: 'bold'}}>Request ID</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2" sx={{fontWeight: 'bold'}}>Crop</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2" sx={{fontWeight: 'bold'}}>Buyer</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2" sx={{fontWeight: 'bold'}}>Quantity</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2" sx={{fontWeight: 'bold'}}>Price</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2" sx={{fontWeight: 'bold'}}>Message</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2" sx={{fontWeight: 'bold'}}>Status</Typography></TableCell>
                                            <TableCell><Typography variant="subtitle2" sx={{fontWeight: 'bold'}}>Actions</Typography></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {purchaseRequests.length > 0 ? (
                                            purchaseRequests.map((request, index) => (
                                                <TableRow key={request && request.requestId ? request.requestId.toString() : index}>
                                                    <TableCell>{request && request.requestId ? request.requestId.toString() : 'N/A'}</TableCell>
                                                    <TableCell>{request.cropName || 'N/A'}</TableCell>
                                                    <TableCell>{request.buyerName || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <strong>{request && request.quantity ? request.quantity.toString() : '0'} kg</strong>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                                            {web3 && request && request.price ? web3.utils.fromWei(request.price, 'ether') : '0'} ETH per kg
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                                            Total: {web3 && request && request.quantity && request.price ? 
                                                                web3.utils.fromWei(
                                                                    web3.utils.toBN(request.price)
                                                                        .mul(web3.utils.toBN(request.quantity))
                                                                        .toString(), 
                                                                    'ether'
                                                                ) : '0'} ETH
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            sx={{
                                                                maxWidth: 200,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                            title={request.message || ''}
                                                        >
                                                            {request.message || 'No message'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={request.statusText || 'Unknown'} 
                                                            color={
                                                                request && request.status && request.status.toString() === "0" ? "warning" : 
                                                                request && request.status && request.status.toString() === "1" ? "success" : 
                                                                request && request.status && request.status.toString() === "2" ? "error" : 
                                                                request && request.status && request.status.toString() === "3" ? "default" :
                                                                "default"
                                                            }
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {/* Show Accept/Reject buttons for all requests that appear to be pending */}
                                                        {(request && 
                                                          ((request.status && request.status.toString() === "0") || 
                                                           (request.statusText === "Pending"))) ? (
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    size="small"
                                                                    startIcon={<CheckCircleIcon />}
                                                                    onClick={() => respondToPurchaseRequest(request.requestId || 0, true)}
                                                                    sx={{ fontWeight: 'bold' }}
                                                                >
                                                                    Accept
                                                                </Button>
                                                                <Button
                                                                    variant="contained"
                                                                    color="error"
                                                                    size="small"
                                                                    startIcon={<CancelIcon />}
                                                                    onClick={() => respondToPurchaseRequest(request.requestId || 0, false)}
                                                                    sx={{ fontWeight: 'bold' }}
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </Box>
                                                        ) : (
                                                            <Typography variant="body2" color="text.secondary">
                                                                {request && request.status && request.status.toString() === "1" ? "Accepted" :
                                                                 request && request.status && request.status.toString() === "2" ? "Rejected" :
                                                                 request && request.status && request.status.toString() === "3" ? "Completed" : 
                                                                 request && request.statusText === "Accepted" ? "Accepted" :
                                                                 request && request.statusText === "Rejected" ? "Rejected" :
                                                                 request && request.statusText === "Completed" ? "Completed" :
                                                                 "No action needed"}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center">
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
                    // Orders & Deliveries Tab
                    <Typography variant="body1" sx={{ textAlign: 'center', py: 5 }}>
                        Orders and delivery tracking will be implemented soon.
                    </Typography>
                )}
            </Container>

            {/* Add New Crop Dialog */}
            <Dialog open={showAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Crop</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter the details of your crop to list it on the marketplace.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Crop Name"
                        fullWidth
                        value={cropName}
                        onChange={(e) => setCropName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Price per kg (ETH)"
                        type="number"
                        fullWidth
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        inputProps={{ step: "0.001" }}
                    />
                    <TextField
                        margin="dense"
                        label="Quantity Available (kg)"
                        type="number"
                        fullWidth
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Crop ID"
                        type="number"
                        fullWidth
                        value={cropID}
                        onChange={(e) => setCropID(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Delivery Date"
                        fullWidth
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        placeholder="e.g., 15th June 2023"
                    />
                    <Box sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Upload Crop Image (Optional)
                        </Typography>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            id="crop-image-upload"
                        />
                        <label htmlFor="crop-image-upload">
                            <Button
                                variant="outlined"
                                component="span"
                                sx={{ mr: 2 }}
                            >
                                Select Image
                            </Button>
                        </label>
                        <Button
                            variant="contained"
                            onClick={handleImageUpload}
                            disabled={!cropImage || uploadingImage}
                        >
                            {uploadingImage ? "Uploading..." : "Upload"}
                        </Button>
                        
                        {cropImagePreview && (
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <img 
                                    src={cropImagePreview} 
                                    alt="Crop preview" 
                                    style={{ 
                                        maxWidth: '100%', 
                                        maxHeight: '200px',
                                        objectFit: 'contain'
                                    }} 
                                />
                                {imageCID && (
                                    <Typography variant="caption" color="success.main" display="block">
                                        Image uploaded to IPFS
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddDialog} color="inherit">
                        Cancel
                    </Button>
                    <Button 
                        onClick={addListing} 
                        color="primary" 
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Add Listing"}
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

export default FarmerDashboard;
