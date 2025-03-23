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
    Badge,
    Skeleton,
    Tooltip
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
    Notifications as NotificationsIcon,
    Delete as DeleteIcon,
    Sync as SyncIcon
} from '@mui/icons-material';
import { uploadImageToPinata, getIPFSGatewayURL, fetchIPFSImageDirectly, clearImageCache } from '../services/pinataService';
import { getUserDisplayName, getProfileImageUrl } from '../services/profileService';
import Web3 from 'web3';
import { motion } from "framer-motion";
import { useTheme } from "../components/theme-provider";
import { ThemeToggle } from "../components/theme-toggle";

const CONTRACT_ADDRESS = "0x8805E08E5e795F02A60505a41af0b13FE996B216";

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
    const navigate = useNavigate();
    const [localAccount, setLocalAccount] = useState(account);
    const { theme } = useTheme();
    const [contract, setContract] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [crops, setCrops] = useState([]);
    const [orders, setOrders] = useState([]);
    const [purchaseRequests, setPurchaseRequests] = useState([]);
    const [hasNewRequests, setHasNewRequests] = useState(false);
    const [cropName, setCropName] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [cultivationDate, setCultivationDate] = useState("");
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
    const [fallbackAttempt, setFallbackAttempt] = useState({});
    const [directImageData, setDirectImageData] = useState({});
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        cropId: null,
        cropName: ''
    });
    const [removedCropIds, setRemovedCropIds] = useState([]);
    const [loadingImages, setLoadingImages] = useState({});
    const [sortBy, setSortBy] = useState('dateDesc');
    // Add state for bid details dialog
    const [bidDetailsDialog, setBidDetailsDialog] = useState({
        open: false,
        cropId: null,
        cropName: '',
        bids: []
    });
    // Add state for tracking new bids
    const [hasNewBids, setHasNewBids] = useState(false);
    // Make sure to add a new state variable for failed images to track permanent failures
    const [failedImages, setFailedImages] = useState({});

    useEffect(() => {
        const init = async () => {
            await initializeContract();
        };
        init();
        
        // Clear image cache if it's over 2 days old
        const lastCacheClear = localStorage.getItem('last-image-cache-clear');
        const now = new Date().getTime();
        if (!lastCacheClear || (now - parseInt(lastCacheClear)) > (2 * 24 * 60 * 60 * 1000)) {
            clearImageCache();
            localStorage.setItem('last-image-cache-clear', now.toString());
        }
        
        return () => {
            // Cleanup
            if (contractRef.current) {
                contractRef.current.events.allEvents().unsubscribe();
            }
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Add persistent MetaMask connection check with improved reliability
    const checkAndRestoreConnection = async () => {
        try {
            // Check if previous connection exists in localStorage
            const previousAccount = localStorage.getItem('farmerAccount');
            
            if (previousAccount && window.ethereum) {
                // Get current accounts
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                
                if (!accounts || accounts.length === 0) {
                    console.log("No connected accounts found, attempting to reconnect previous account:", previousAccount);
                    
                    // Set loading state during reconnection attempt
                    setLoading(true);
                    
                    // Try silently requesting account access
                    try {
                        const newAccounts = await window.ethereum.request({ 
                            method: 'eth_requestAccounts',
                            params: [] // Empty params to make it more reliable
                        });
                        
                        if (newAccounts && newAccounts.length > 0) {
                            console.log("Successfully reconnected to MetaMask with account:", newAccounts[0]);
                            setLocalAccount(newAccounts[0]);
                            localStorage.setItem('farmerAccount', newAccounts[0]);
                            
                            // Re-initialize contract with newly connected account
                            await initializeContract();
                        }
                    } catch (requestError) {
                        console.log("User needs to manually connect MetaMask");
                        // Record failed attempt to avoid too frequent re-prompts
                        const now = Date.now();
                        localStorage.setItem('lastMetaMaskConnectAttempt', now.toString());
                        
                        // Only show the error if we haven't shown it recently
                        const lastErrorTime = parseInt(localStorage.getItem('lastMetaMaskErrorTime') || '0');
                        if (now - lastErrorTime > 60000) { // Show error at most once per minute
                            setSnackbar({
                                open: true,
                                message: "MetaMask connection lost. Please click the MetaMask extension and connect your account.",
                                severity: 'warning',
                                duration: 10000
                            });
                            localStorage.setItem('lastMetaMaskErrorTime', now.toString());
                        }
                    } finally {
                        setLoading(false);
                    }
                } else if (accounts[0] !== previousAccount) {
                    console.log("Account changed from", previousAccount, "to", accounts[0]);
                    setLocalAccount(accounts[0]);
                    localStorage.setItem('farmerAccount', accounts[0]);
                    
                    // Re-initialize contract with new account
                    await initializeContract();
                } else {
                    console.log("Already connected to correct account:", accounts[0]);
                    setLocalAccount(accounts[0]);
                }
            }
        } catch (error) {
            console.error("Error in checkAndRestoreConnection:", error);
            setLoading(false);
        }
    };
    
    checkAndRestoreConnection();

    // Enhanced event listeners for account changes and connection
    if (window.ethereum) {
        // Detect account changes
        const handleAccountsChanged = (accounts) => {
            console.log("MetaMask accounts changed:", accounts);
            if (accounts && accounts.length > 0) {
                setLocalAccount(accounts[0]);
                localStorage.setItem('farmerAccount', accounts[0]);
                // Re-initialize with new account
                initializeContract();
            } else {
                console.log("Disconnected from MetaMask");
                // Don't clear the localAccount immediately - we'll try to reconnect on next check
                
                // Record that we've been disconnected so we can show appropriate UI
                localStorage.setItem('metaMaskDisconnected', 'true');
                localStorage.setItem('metaMaskDisconnectTime', Date.now().toString());
                
                // Show a notification but don't remove account from localStorage
                setSnackbar({
                    open: true,
                    message: "MetaMask disconnected. Click the MetaMask extension to reconnect.",
                    severity: 'warning',
                    duration: 8000
                });
            }
        };
        
        // Detect chain changes
        const handleChainChanged = (chainId) => {
            console.log("MetaMask chain changed. Reloading the page for new chain:", chainId);
            // Reload the page as recommended by MetaMask
            window.location.reload();
        };
        
        // Detect connection
        const handleConnect = (connectInfo) => {
            console.log("MetaMask connected:", connectInfo);
            // Try to get accounts again
            window.ethereum.request({ method: 'eth_accounts' })
                .then(accounts => {
                    if (accounts && accounts.length > 0) {
                        setLocalAccount(accounts[0]);
                        localStorage.setItem('farmerAccount', accounts[0]);
                    }
                })
                .catch(error => console.error("Error fetching accounts after connect:", error));
        };
        
        // Detect disconnection
        const handleDisconnect = (error) => {
            console.log("MetaMask disconnected:", error);
            // Wait a bit then try to reconnect
            setTimeout(checkAndRestoreConnection, 1000);
        };
        
        // Set up event listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('connect', handleConnect);
        window.ethereum.on('disconnect', handleDisconnect);
        
        // Set up periodic connection check (every 30 seconds)
        const connectionCheckInterval = setInterval(checkAndRestoreConnection, 30000);
        
        // Clean up event listeners on component unmount
        return () => {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
            window.ethereum.removeListener('connect', handleConnect);
            window.ethereum.removeListener('disconnect', handleDisconnect);
            clearInterval(connectionCheckInterval);
        };
    }

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

    // Add a useEffect hook to ensure zero quantity crops are properly marked as removed
    useEffect(() => {
        // When crops state changes, make sure all zero quantity crops are marked as removed
        if (crops.length > 0) {
            // Check for any crops with zero quantity that aren't marked as removed
            const needsUpdate = crops.some(crop => 
                crop.quantity && crop.quantity.toString() === "0" && !crop.isRemoved
            );
            
            if (needsUpdate) {
                console.log("Found crops with zero quantity not marked as removed, updating state...");
                setCrops(currentCrops => 
                    currentCrops.map(crop => 
                        crop.quantity && crop.quantity.toString() === "0" 
                            ? { ...crop, isRemoved: true } 
                            : crop
                    )
                );
            }
        }
    }, [crops]);

    // Add this useEffect hook below the existing ones
    useEffect(() => {
        // This effect runs once on component mount to ensure all zero quantity crops are marked as removed
        const ensureRemovedCropsMarked = () => {
            console.log("Running initial check for zero quantity crops...");
            // Force a refresh of the listings to ensure they are properly loaded
            if (contract && localAccount) {
                fetchListings();
            }
        };
        
        ensureRemovedCropsMarked();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contract, localAccount]);

    // Add tracking for removed crops using localStorage
    useEffect(() => {
        // Load previously removed crops from localStorage when component mounts
        const loadRemovedCrops = () => {
            try {
                const storedRemovedCrops = localStorage.getItem('removedCrops');
                if (storedRemovedCrops) {
                    const removedCropsObj = JSON.parse(storedRemovedCrops);
                    
                    // Convert the object to an array of crop IDs if it's in object format
                    if (typeof removedCropsObj === 'object' && !Array.isArray(removedCropsObj)) {
                        const removedCropIds = Object.keys(removedCropsObj).filter(id => removedCropsObj[id]);
                        console.log("Loaded removed crop IDs from localStorage:", removedCropIds);
                        setRemovedCropIds(removedCropIds);
                    } else if (Array.isArray(removedCropsObj)) {
                        console.log("Loaded removed crop IDs from localStorage:", removedCropsObj);
                        setRemovedCropIds(removedCropsObj);
                    }
                }
            } catch (error) {
                console.error("Error loading removed crops from localStorage:", error);
            }
        };
        
        loadRemovedCrops();
    }, []);

    // Add useEffect to check for new bids
    useEffect(() => {
        if (purchaseRequests && purchaseRequests.length > 0) {
            // Check if there are any pending requests with bids
            const newBids = purchaseRequests.some(request => 
                request.status.toString() === "0" && request.hasBid
            );
            
            setHasNewBids(newBids);
        }
    }, [purchaseRequests]);

    const initializeContract = async () => {
        setLoading(true);
        let contractInstance = null;
        
        try {
            console.log("Initializing contract...");
            
            // Check if web3 is injected by MetaMask
            if (!window.ethereum) {
                throw new Error("Please install MetaMask to use this app.");
            }

            // Initialize web3 with proper error handling
            let web3Instance;
            try {
                web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);
                window.web3 = web3Instance; // For global access
                console.log("Web3 initialized successfully");
            } catch (web3Error) {
                console.error("Error initializing Web3:", web3Error);
                throw new Error("Failed to initialize Web3. Please refresh and try again.");
            }

            // Try to get previously connected account first
            try {
                // Reset MetaMask disconnected flag if it was set previously
                if (localStorage.getItem('metaMaskDisconnected') === 'true') {
                    localStorage.removeItem('metaMaskDisconnected');
                    localStorage.removeItem('metaMaskDisconnectTime');
                    console.log("Resetting previous MetaMask disconnect status");
                }
                
                const accounts = await window.ethereum.request({ 
                    method: 'eth_accounts',
                    params: [] 
                });
                
                if (accounts && accounts.length > 0) {
                    const account = accounts[0];
                    setLocalAccount(account);
                    localStorage.setItem('farmerAccount', account);
                    console.log("Using existing connected account:", account);
                } else {
                    // If no existing connection, request account access
                    console.log("No existing connection, requesting account access...");
                    
                    // Check for previous session key - this is for users who have allowed the dApp before
                    const previousAccount = localStorage.getItem('farmerAccount');
                    if (previousAccount) {
                        console.log("Attempting to reconnect to previous account:", previousAccount);
                    }
                    
                    const requestedAccounts = await window.ethereum.request({ 
                        method: 'eth_requestAccounts',
                        params: []
                    });
                    
                    if (!requestedAccounts || requestedAccounts.length === 0) {
                        throw new Error("No accounts found. Please check MetaMask.");
                    }
            
                    // Set local account
                    const account = requestedAccounts[0];
                    setLocalAccount(account);
                    localStorage.setItem('farmerAccount', account);
                    console.log("Connected to new account:", account);
                    
                    // Store connection timestamp
                    localStorage.setItem('metaMaskLastConnectTime', Date.now().toString());
                }
            } catch (accountError) {
                console.error("Error accessing accounts:", accountError);
                
                // Handle specific MetaMask errors
                if (accountError.code === 4001) {
                    // User rejected request
                    throw new Error("MetaMask connection rejected. Please connect to continue.");
                } else if (accountError.code === -32002) {
                    // Request already pending
                    throw new Error("MetaMask connection request already pending. Please check the MetaMask extension.");
                } else if (accountError.code === 4100) {
                    // Unauthorized - can happen if user manually disconnected via MetaMask
                    throw new Error("MetaMask account not authorized. Please connect via the MetaMask extension.");
                } else {
                    throw accountError;
                }
            }

            // Create contract instance with error handling
            try {
                console.log("Creating contract instance with ABI and address:", CONTRACT_ADDRESS);
                contractInstance = new web3Instance.eth.Contract(
                    CONTRACT_ABI,
                    CONTRACT_ADDRESS
                );
                
                if (!contractInstance) {
                    throw new Error("Failed to create contract instance - instance is null");
                }
                
                if (!contractInstance.methods) {
                    throw new Error("Contract instance missing methods property");
                }
                
                // Log available methods for debugging
                console.log("Contract methods:", Object.keys(contractInstance.methods));
                
                // Test a simple call to verify the connection
                try {
                    console.log("Testing contract connection...");
                    const testAccount = await contractInstance.methods.getUserRole(localAccount).call({from: localAccount});
                    console.log("Contract test successful, account role:", testAccount);
                } catch (testError) {
                    console.warn("Contract test call failed:", testError);
                    // Continue anyway - the contract might not have this specific method
                }
                
                // Store contract instance in state
                setContract(contractInstance);
                
                // Record successful initialization
                localStorage.setItem('lastContractInitTime', Date.now().toString());
                localStorage.removeItem('initFailCount');
                
                console.log("Contract initialized successfully");
            } catch (contractError) {
                console.error("Error creating contract instance:", contractError);
                throw new Error("Failed to connect to blockchain contract. Please check your network connection.");
            }
            
            // Return the contract instance for immediate use in subsequent calls
            return contractInstance;
        } catch (error) {
            console.error("Error initializing contract:", error);
            
            // Track failed init attempts
            const failCount = parseInt(localStorage.getItem('initFailCount') || '0') + 1;
            localStorage.setItem('initFailCount', failCount.toString());
            
            // Only show snackbar for errors if we haven't shown too many
            if (failCount <= 3) {
                setSnackbar({
                    open: true,
                    message: `Connection error: ${error.message}`,
                    severity: 'error',
                    duration: 6000
                });
            }
            
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

    const fetchListings = async () => {
        try {
            if (!contract || !contract.methods) {
                console.error("Contract not initialized in fetchListings");
                return;
            }
            
            console.log("Fetching listings using contract methods:", Object.keys(contract.methods));
            const listings = await contract.methods.getMyListings().call({from: localAccount});
            console.log("Raw listings from contract:", listings);
            
            // Apply filtering: Remove any crops that are in our removedCropIds array
            const filteredListings = listings.filter(listing => {
                const cropId = listing.cropID.toString();
                const isZeroQuantity = listing.quantity && listing.quantity.toString() === "0";
                const isInRemovedList = removedCropIds.includes(cropId);
                
                // Log details for debugging
                if (isZeroQuantity || isInRemovedList) {
                    console.log(`Filtering out crop ${cropId} (${listing.cropName}):`, {
                        isZeroQuantity,
                        isInRemovedList
                    });
                }
                
                // Keep this crop only if it's not zero quantity AND not in the removed list
                return !isZeroQuantity && !isInRemovedList;
            });
            
            console.log("Filtered listings:", filteredListings);
            
            // Debug image CIDs and zero quantity crops
            filteredListings.forEach((listing, index) => {
                console.log(`Listing ${index}:`, {
                    cropName: listing.cropName,
                    cropID: listing.cropID.toString(),
                    quantity: listing.quantity.toString(),
                    imageCID: listing.imageCID,
                    hasValidCID: Boolean(listing.imageCID && listing.imageCID !== ''),
                    url: listing.imageCID ? getIPFSGatewayURL(listing.imageCID) : 'No URL'
                });
            });
            
            const enrichedListings = await Promise.all(filteredListings.map(async (listing) => {
                // Convert price from wei to ether
                const priceInEth = web3 ? web3.utils.fromWei(listing.price, 'ether') : '0';
                
                // Get the IPFS gateway URL for the image if available
                const imageUrl = listing.imageCID 
                    ? getIPFSGatewayURL(listing.imageCID) 
                    : null;

                return {
                    ...listing,
                    priceInEth,
                    imageUrl,
                    isRemoved: false // All crops here are already filtered and should not be removed
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

    // Add a function to get bid information from localStorage with better error handling
    const getBidForRequest = (requestId) => {
        try {
            if (!requestId) {
                console.warn("Can't get bid for null/undefined requestId");
                return null;
            }
            
            // First try getting from cropBids
            const bids = JSON.parse(localStorage.getItem('cropBids') || '{}');
            const bid = bids[requestId];
            
            // If bid exists and has valid price data, use it
            if (bid && bid.bidPrice && bid.bidPrice !== '0') {
                console.log(`Found bid in cropBids for request ${requestId}:`, bid);
                return bid;
            } 
            
            // For debug: look at all stored bids
            console.log(`Stored cropBids in localStorage:`, bids);
            
            // If not found, look for manually created bids for testing
            const debugBids = JSON.parse(localStorage.getItem('debugBids') || '{}');
            if (debugBids[requestId]) {
                console.log(`Found debug bid for request ${requestId}:`, debugBids[requestId]);
                return debugBids[requestId];
            }
            
            // If nothing found, return null
            console.log(`No bid found for request ${requestId}`);
            return null;
        } catch (error) {
            console.error(`Error getting bid information for request ${requestId}:`, error);
            return null;
        }
    };

    // Update fetchPurchaseRequests to include bid information
    const fetchPurchaseRequests = async () => {
        try {
            if (!contract || !contract.methods) {
                console.error("Contract not initialized in fetchPurchaseRequests");
                return;
            }

            console.log("Fetching purchase requests...");
            const requests = await contract.methods.getFarmerRequests().call({from: localAccount});
            console.log("Raw purchase requests:", requests);
            
            // Filter out empty requests (address(0))
            const validRequests = requests.filter(
                request => request.buyer !== "0x0000000000000000000000000000000000000000"
            );
            
            // Get Web3 instance to convert prices
            const web3Instance = window.web3 || web3;
            
            // Enrich the requests with crop names and buyer names
            const enrichedRequests = await Promise.all(
                validRequests.map(async (request) => {
                    try {
                        // Get crop details
                        const cropName = await getCropName(request.cropId);
                const buyerName = await getBuyerName(request.buyer);
                
                        // Convert prices to ether for display
                        const priceInEther = web3Instance.utils.fromWei(request.price, 'ether');
                        
                        // Get any custom bid information from localStorage
                        const bidInfo = getBidForRequest(request.requestId);
                        
                        // Set flag if this request has a custom bid
                        const hasBid = bidInfo !== null;
                        
                        // Store the bid price for display (either from localStorage or contract)
                        let bidPriceInEther = null;
                        
                        if (hasBid && bidInfo) {
                            // Use the stored bid price
                            bidPriceInEther = bidInfo.bidPrice;
                            console.log(`Found stored bid ${bidPriceInEther} ETH for request ${request.requestId}`);
                        }
                        
                        // Calculate price difference as percentage if bid exists
                        let priceDiffPercentage = 0;
                        if (hasBid && bidPriceInEther) {
                            const originalPrice = parseFloat(priceInEther);
                            const bidPrice = parseFloat(bidPriceInEther);
                            
                            if (originalPrice > 0) {
                                // Calculate percentage difference ((bid - original) / original) * 100
                                priceDiffPercentage = ((bidPrice - originalPrice) / originalPrice) * 100;
                            }
                        }
                        
                        let statusText;
                        switch(request.status.toString()) {
                            case "0":
                                statusText = "Pending";
                                break;
                            case "1":
                                statusText = "Accepted";
                                break;
                            case "2":
                                statusText = "Rejected";
                                break;
                            default:
                                statusText = "Unknown";
                        }
                        
                        return {
                    ...request,
                    cropName,
                    buyerName,
                            priceInEther,
                    statusText,
                            hasBid,
                            bidPriceInEther,
                            priceDiffPercentage
                        };
                    } catch (error) {
                        console.error("Error processing request:", error);
                        return request;
                    }
                })
            );
            
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
            // Compress the image before uploading if it's large
            const compressedImage = await compressImageIfNeeded(cropImage);
            
            console.log("Uploading image to Pinata...");
            const cid = await uploadImageToPinata(compressedImage || cropImage);
            console.log("Image uploaded successfully with CID:", cid);
            
            setImageCID(cid);
            
            // Save the image in our direct image data cache too
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageData = reader.result;
                // Use a temporary ID until we generate the real cropID
                setDirectImageData(prev => ({
                    ...prev,
                    'temp-new-crop': imageData
                }));
            };
            reader.readAsDataURL(compressedImage || cropImage);
            
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

    // Helper function to compress images if they're large
    const compressImageIfNeeded = async (file) => {
        // Skip compression for small files (< 1MB)
        if (file.size < 1024 * 1024) {
            console.log("Image is small, skipping compression");
            return null;
        }
        
        console.log("Image is large, compressing...");
        
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    // Calculate new dimensions (maintain aspect ratio)
                    let width = img.width;
                    let height = img.height;
                    
                    // Max dimensions
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to Blob
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            console.error("Failed to compress image");
                            resolve(null);
                            return;
                        }
                        
                        // Create a new File from the blob
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        
                        console.log(`Compressed image from ${(file.size / 1024).toFixed(2)}KB to ${(compressedFile.size / 1024).toFixed(2)}KB`);
                        resolve(compressedFile);
                    }, 'image/jpeg', 0.8); // 80% quality
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const addListing = async () => {
        if (!cropName || !price || !quantity || !cultivationDate) {
            setSnackbar({
                open: true,
                message: "Please fill in all fields",
                severity: 'warning'
            });
            return;
        }

        setLoading(true);
        try {
            // Upload image first if selected but not yet uploaded
            let finalImageCID = imageCID;
            if (cropImage && !imageCID) {
                try {
                    setUploadingImage(true);
                    console.log("Uploading image before creating listing...");
                    finalImageCID = await uploadImageToPinata(cropImage);
                    setImageCID(finalImageCID);
                    console.log("Image uploaded successfully with CID:", finalImageCID);
                } catch (imageError) {
                    console.error("Error auto-uploading image:", imageError);
                    setSnackbar({
                        open: true,
                        message: "Warning: Image upload failed, continuing without image",
                        severity: 'warning'
                    });
                    finalImageCID = "";
                } finally {
                    setUploadingImage(false);
                }
            }

            // Generate a unique crop ID based on timestamp and random number
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000);
            const generatedCropID = timestamp + random;
            
            console.log("Generated unique crop ID:", generatedCropID);

            // Convert price to wei
            const priceInWei = web3.utils.toWei(price, 'ether');
            
            // Format the date for the contract
            const dateObj = new Date(cultivationDate);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Add the listing with image CID if available
            await contract.methods.addListing(
                cropName,
                priceInWei,
                generatedCropID,
                quantity,
                formattedDate,
                finalImageCID || "" // Use the image CID or empty string if not available
            ).send({
                from: localAccount
            });

            setSnackbar({
                open: true,
                message: `Crop listing added successfully! Crop ID: ${generatedCropID}`,
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

    // Update the respond to purchase request function to handle bids and authorization errors
    const handleRespondToPurchaseRequest = async (requestId, accept) => {
        try {
            setLoading(true);
            
            // Get the request details from the purchaseRequests state
            const request = purchaseRequests.find(req => req.requestId.toString() === requestId.toString());
            
            if (!request) {
                throw new Error(`Request with ID ${requestId} not found`);
            }
            
            console.log(`${accept ? "Accepting" : "Rejecting"} purchase request:`, request);
            
            // Check if contract and methods are available
            if (!contract || !contract.methods) {
                console.error("Contract or contract methods not available");
                
                // Try to reinitialize the contract
                const newContract = await initializeContract();
                if (!newContract || !newContract.methods) {
                    throw new Error("Smart contract not initialized properly. Please refresh the page and try again.");
                }
                
                // Update local reference
                setContract(newContract);
            }
            
            // Make sure we're connected with the right account
            let currentAccount = localAccount;
            
            try {
                const accounts = await window.ethereum.request({ 
                    method: 'eth_accounts',
                    params: []
                });
                
                if (!accounts || accounts.length === 0) {
                    // This means MetaMask is logged out, try to reconnect
                    setSnackbar({
                        open: true,
                        message: "MetaMask session lost. Please reconnect to continue.",
                        severity: 'warning',
                        duration: 8000
                    });
                    
                    try {
                        console.log("Attempting to reconnect to MetaMask...");
                        const newAccounts = await window.ethereum.request({ 
                            method: 'eth_requestAccounts',
                            params: []
                        });
                        
                        if (!newAccounts || newAccounts.length === 0) {
                            throw new Error("Failed to connect to MetaMask");
                        }
                        
                        currentAccount = newAccounts[0];
                        setLocalAccount(newAccounts[0]);
                        localStorage.setItem('farmerAccount', newAccounts[0]);
                        
                        // Re-create contract instance with the new account
                        await initializeContract();
                        
                        console.log("Successfully reconnected to MetaMask with account:", currentAccount);
                    } catch (connectError) {
                        console.error("Failed to reconnect to MetaMask:", connectError);
                        throw new Error("Please connect to MetaMask to continue. Click the MetaMask extension and connect your account.");
                    }
                } else if (accounts[0] !== localAccount) {
                    // Account changed - update our state
                    console.log("Account changed from", localAccount, "to", accounts[0]);
                    currentAccount = accounts[0];
                    setLocalAccount(accounts[0]);
                    localStorage.setItem('farmerAccount', accounts[0]);
                }
            } catch (accountError) {
                console.error("Error checking MetaMask accounts:", accountError);
                
                // If this is a MetaMask error, provide a specific message
                if (accountError.code === 4100 || accountError.code === 4001) {
                    throw new Error("MetaMask requires authorization. Please open MetaMask and connect your account.");
                } else {
                    throw new Error("Error connecting to your wallet: " + accountError.message);
                }
            }
            
            console.log("Available contract methods:", Object.keys(contract.methods));
            
            // Debug to see what's in the contract methods
            if (!contract.methods.respondToPurchaseRequest) {
                console.error("respondToPurchaseRequest method not found in contract");
                
                // Try to find similar methods
                const methodNames = Object.keys(contract.methods);
                const similarMethods = methodNames.filter(name => 
                    name.toLowerCase().includes("request") || 
                    name.toLowerCase().includes("purchase") ||
                    name.toLowerCase().includes("respond") ||
                    name.toLowerCase().includes("accept")
                );
                
                console.log("Similar methods found:", similarMethods);
                
                if (similarMethods.length === 0) {
                    throw new Error("No request-related methods found in contract. Please refresh the page.");
                }
                
                // Try to reinstantiate the contract
                const refreshedContract = await initializeContract();
                if (!refreshedContract || !refreshedContract.methods.respondToPurchaseRequest) {
                    throw new Error("Contract methods missing after refresh. Please reload the page completely.");
                }
            }
            
            console.log(`Calling respondToPurchaseRequest with requestId=${requestId}, accept=${accept}`);
            
            // Check for gas estimation first to detect errors early
            let gasEstimate;
            try {
                gasEstimate = await contract.methods.respondToPurchaseRequest(
                    requestId,
                    accept
                ).estimateGas({from: currentAccount});
                
                console.log(`Gas estimate for transaction: ${gasEstimate}`);
            } catch (gasError) {
                console.error("Gas estimation error:", gasError);
                
                // Check for common gas estimation errors
                if (gasError.message.includes("execution reverted")) {
                    throw new Error("Transaction would fail: " + gasError.message);
                } else {
                    // Continue anyway, MetaMask will show the error
                    console.warn("Continuing despite gas estimation error");
                }
            }
            
            // Execute the transaction with proper error handling
            try {
                const tx = await contract.methods.respondToPurchaseRequest(
                    requestId,
                    accept
                ).send({
                    from: currentAccount,
                    gas: gasEstimate ? Math.floor(gasEstimate * 1.2) : undefined, // Add 20% buffer if we have an estimate
                });
                
                console.log("Transaction successful:", tx);
                
                setSnackbar({
                    open: true,
                    message: accept ? 
                        "Purchase request accepted. The buyer can now complete the purchase." : 
                        "Purchase request rejected.",
                    severity: accept ? 'success' : 'info'
                });
                
                // Update the local state to reflect the change
                setPurchaseRequests(prevRequests => 
                    prevRequests.map(req => 
                        req.requestId.toString() === requestId.toString() 
                            ? { ...req, status: accept ? 1 : 2, statusText: accept ? "Approved" : "Rejected" } 
                            : req
                    )
                );
            } catch (txError) {
                console.error("Transaction error:", txError);
                
                // Check for different MetaMask error types
                if (txError.code === 4001) {
                    console.warn("User denied transaction in MetaMask");
                    setSnackbar({
                        open: true,
                        message: "Transaction was rejected in MetaMask. Please try again.",
                        severity: 'warning'
                    });
                    return; // This is user cancellation, not an error
                } else if (txError.code === -32603) {
                    console.error("MetaMask authorization error:", txError);
                    setSnackbar({
                        open: true,
                        message: "Transaction was not authorized. Please check MetaMask and try again.",
                        severity: 'error'
                    });
                } else {
                    throw txError;
                }
            }
            
            // Refresh purchase requests after successful transaction
            await fetchPurchaseRequests();
        } catch (error) {
            console.error("Error in handleRespondToPurchaseRequest:", error);
            
            // Provide a friendly error message based on error type
            let errorMessage = error.message;
            if (error.message.includes("User denied")) {
                errorMessage = "You rejected the transaction in MetaMask. Try again when ready.";
            } else if (error.message.includes("insufficient funds")) {
                errorMessage = "You don't have enough ETH to complete this transaction. Please add funds to your wallet.";
            } else if (error.message.includes("nonce too low") || error.message.includes("already known")) {
                errorMessage = "Transaction already pending. Please check MetaMask for details."; 
            }
            
            setSnackbar({
                open: true,
                message: `Error: ${errorMessage}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCropName("");
        setPrice("");
        setQuantity("");
        setCultivationDate("");
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
        } else if (newValue === 0) {
            // If switching to My Listings tab, refresh listings to ensure they're up to date
            fetchListings();
            // Clear the new bids indicator when viewing listings
            setHasNewBids(false);
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

    // Helper function to get crop image URL with fallbacks - updated to prevent flickering
    const getCropImageUrl = (crop) => {
        if (!crop) return 'https://via.placeholder.com/300x200?text=No+Image';
        
        const cropId = crop.cropID ? crop.cropID.toString() : '';
        
        // If this image has permanently failed, return placeholder immediately
        if (failedImages[cropId]) {
            return 'https://via.placeholder.com/300x200?text=Image+Unavailable';
        }
        
        // If we already have direct image data for this crop, use it
        if (directImageData[cropId]) {
            return directImageData[cropId];
        }
        
        // If the crop has a valid CID, use the gateway URL
        if (crop.imageCID && crop.imageCID !== '') {
            // Mark this image as loading if it's not already loading
            if (!loadingImages[cropId]) {
                setLoadingImages(prev => ({
                    ...prev,
                    [cropId]: true
                }));
            }
            
            // Try to fetch the image directly in the background without affecting the UI
            setTimeout(() => {
                fetchDirectImageIfNeeded(crop.imageCID, cropId);
            }, 0);
            
            return getIPFSGatewayURL(crop.imageCID);
        }
        
        // Return a default image if no CID is available
        return 'https://via.placeholder.com/300x200?text=No+Image';
    };

    // Function to fetch image directly if needed - updated to handle loading state
    const fetchDirectImageIfNeeded = async (cid, cropId) => {
        if (!cid || directImageData[cropId]) return;
        
        try {
            console.log(`Attempting to fetch image directly for crop ${cropId}...`);
            const imageData = await fetchIPFSImageDirectly(cid);
            if (imageData) {
                console.log(`Direct image fetch successful for crop ${cropId}`);
                setDirectImageData(prev => ({
                    ...prev,
                    [cropId]: imageData
                }));
            } else {
                // If all methods failed, mark as permanently failed
                console.error(`All image fetch methods failed for crop ${cropId}`);
                setFailedImages(prev => ({
                    ...prev,
                    [cropId]: true
                }));
            }
        } catch (error) {
            console.error(`Failed to fetch image directly for crop ${cropId}:`, error);
            setFailedImages(prev => ({
                ...prev,
                [cropId]: true
            }));
        } finally {
            // Update loading state once completed (success or failure)
            setLoadingImages(prev => ({
                ...prev,
                [cropId]: false
            }));
        }
    };

    // Handler for image errors with multiple fallback attempts - updated to prevent flickering
    const handleImageError = async (event, cropId, cid) => {
        console.warn("Image failed to load, trying fallback", cropId);
        
        // If we already have a direct data URL for this image, use it
        if (directImageData[cropId]) {
            event.target.src = directImageData[cropId];
            return;
        }
        
        // Start fetching directly if not already in progress
        if (!loadingImages[cropId] && cid) {
            setLoadingImages(prev => ({
                ...prev,
                [cropId]: true
            }));
            
            try {
                const imageData = await fetchIPFSImageDirectly(cid);
                if (imageData) {
                    setDirectImageData(prev => ({
                        ...prev,
                        [cropId]: imageData
                    }));
                    event.target.src = imageData;
                    return;
                }
            } catch (error) {
                console.error(`Failed to fetch image directly for crop ${cropId} after error:`, error);
            } finally {
                setLoadingImages(prev => ({
                    ...prev,
                    [cropId]: false
                }));
            }
        }
        
        // If direct fetch already failed or wasn't possible, use placeholder
        event.target.src = 'https://via.placeholder.com/300x200?text=Image+Unavailable';
        setFailedImages(prev => ({
            ...prev,
            [cropId]: true
        }));
    };

    // Handler for image load events
    const handleImageLoad = (cropId) => {
        setLoadingImages(prev => ({
            ...prev,
            [cropId]: false
        }));
    };

    // Function to get removed crop IDs from localStorage
    const getRemovedCropIdsFromLocalStorage = () => {
        try {
            const stored = localStorage.getItem('removedCrops');
            if (!stored) return [];
            
            const parsed = JSON.parse(stored);
            
            // Handle both array and object formats for compatibility
            if (Array.isArray(parsed)) {
                return parsed;
            } else if (typeof parsed === 'object') {
                return Object.keys(parsed);
            }
            
            return [];
        } catch (error) {
            console.error("Error parsing removed crops from localStorage:", error);
            return [];
        }
    };

    // Function to notify other components about removed crops
    const notifyRemovedCrop = (cropId) => {
        try {
            // Create a custom event that components can listen for
            const event = new CustomEvent('cropRemoved', { 
                detail: { 
                    cropId,
                    timestamp: new Date().getTime()
                } 
            });
            
            // Dispatch the event globally
            window.dispatchEvent(event);
            console.log(`Dispatched cropRemoved event for crop ID ${cropId}`);
            
            // Also trigger a storage event for cross-tab communication
            // We do this by updating localStorage in a way that triggers the event
            const currentValue = localStorage.getItem('removedCrops');
            localStorage.setItem('removedCrops_temp', currentValue || '[]');
            localStorage.removeItem('removedCrops_temp');
        } catch (error) {
            console.error("Error dispatching crop removed event:", error);
        }
    };

    // Function to remove a crop from the listings
    const removeCrop = async (cropId) => {
        try {
            setLoading(true);
            
            // Find the crop in our local state
            const crop = crops.find(c => c.cropID.toString() === cropId.toString());
            if (!crop) {
                throw new Error("Crop not found");
            }
            
            console.log(`Removing crop ${cropId} (${crop.cropName}) by setting quantity to zero...`);
            
            // Since there is no removeCrop function in the contract, we'll update the listing
            // with zero quantity to effectively remove it from availability
            
            // Add listing with same details but zero quantity
            const result = await contract.methods.addListing(
                crop.cropName,
                crop.price,
                cropId,
                "0", // Set quantity to zero
                crop.deliveryDate,
                crop.imageCID || ""
            ).send({
                from: localAccount
            });
            
            console.log("Transaction result:", result);
            
            // Get current removed crop IDs
            const currentRemovedCropIds = getRemovedCropIdsFromLocalStorage();
            
            // Add this crop ID if not already in the list
            if (!currentRemovedCropIds.includes(cropId.toString())) {
                const updatedRemovedCropIds = [...currentRemovedCropIds, cropId.toString()];
                
                // Save to localStorage for persistence across page refreshes
                localStorage.setItem('removedCrops', JSON.stringify(updatedRemovedCropIds));
                console.log("Updated removed crops in localStorage:", updatedRemovedCropIds);
                
                // Update local state
                setRemovedCropIds(updatedRemovedCropIds);
                
                // Notify other components about the removed crop
                notifyRemovedCrop(cropId.toString());
            }
            
            // Remove this crop from the current crops state
            setCrops(currentCrops => 
                currentCrops.filter(c => c.cropID.toString() !== cropId.toString())
            );
            
            setSnackbar({
                open: true,
                message: `${crop.cropName} has been permanently removed from your listings`,
                severity: 'success'
            });
            
            // Close confirmation dialog
            setConfirmDialog({
                open: false,
                cropId: null,
                cropName: ''
            });
            
            // Refresh listings to get the updated data from the contract
            await fetchListings();
        } catch (error) {
            console.error("Error removing crop:", error);
            setSnackbar({
                open: true,
                message: `Failed to remove crop: ${error.message}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };
    
    // Handle opening the confirmation dialog
    const handleOpenConfirmDialog = (cropId, cropName) => {
        setConfirmDialog({
            open: true,
            cropId,
            cropName
        });
    };
    
    // Handle closing the confirmation dialog
    const handleCloseConfirmDialog = () => {
        setConfirmDialog({
            open: false,
            cropId: null,
            cropName: ''
        });
    };

    // Debug function to verify the filtering of removed crops
    const debugCropFiltering = () => {
        console.log("Debugging crop filtering:");
        console.log("Total crops in state:", crops.length);
        console.log("Removed crop IDs tracked:", removedCropIds);
        
        // Load from localStorage for verification
        try {
            const storedRemovedCrops = localStorage.getItem('removedCrops');
            if (storedRemovedCrops) {
                console.log("Removed crops in localStorage:", JSON.parse(storedRemovedCrops));
            } else {
                console.log("No removed crops found in localStorage");
            }
        } catch (error) {
            console.error("Error reading localStorage:", error);
        }
        
        return null; // Return null so it doesn't affect rendering
    };

    // Debug helper function to force sync removed crops
    const forceSyncRemovedCrops = () => {
        try {
            // Get the current removed crop IDs
            const removedIds = getRemovedCropIdsFromLocalStorage();
            console.log("Current removed crop IDs:", removedIds);
            
            // Ensure localStorage is up to date
            localStorage.setItem('removedCrops', JSON.stringify(removedIds));
            
            // Dispatch events for each removed crop to ensure all components are in sync
            removedIds.forEach(cropId => {
                notifyRemovedCrop(cropId);
            });
            
            setSnackbar({
                open: true,
                message: `Force synced ${removedIds.length} removed crops`,
                severity: 'success'
            });
        } catch (error) {
            console.error("Error force syncing removed crops:", error);
            setSnackbar({
                open: true,
                message: `Error syncing removed crops: ${error.message}`,
                severity: 'error'
            });
        }
    };

    // Add a function to sort purchase requests
    const getSortedRequests = () => {
        if (!purchaseRequests || purchaseRequests.length === 0) {
            return [];
        }
        
        // Create a copy to avoid mutating the original array
        const sortedRequests = [...purchaseRequests];
        
        switch (sortBy) {
            case 'bidDesc':
                // Sort by bid price, highest first (bids at top, then non-bids)
                return sortedRequests.sort((a, b) => {
                    // If both have bids, compare bid prices
                    if (a.hasBid && b.hasBid) {
                        return parseFloat(b.bidPriceInEther) - parseFloat(a.bidPriceInEther);
                    }
                    // If only a has bid, a comes first
                    if (a.hasBid) return -1;
                    // If only b has bid, b comes first
                    if (b.hasBid) return 1;
                    // If neither has bid, sort by original price
                    return parseFloat(b.priceInEther) - parseFloat(a.priceInEther);
                });
            case 'bidAsc':
                // Sort by bid price, lowest first
                return sortedRequests.sort((a, b) => {
                    if (a.hasBid && b.hasBid) {
                        return parseFloat(a.bidPriceInEther) - parseFloat(b.bidPriceInEther);
                    }
                    if (a.hasBid) return -1; // Still put bids first
                    if (b.hasBid) return 1;
                    return parseFloat(a.priceInEther) - parseFloat(b.priceInEther);
                });
            case 'percentDesc':
                // Sort by percentage difference, highest first
                return sortedRequests.sort((a, b) => {
                    if (a.hasBid && b.hasBid) {
                        return b.priceDiffPercentage - a.priceDiffPercentage;
                    }
                    if (a.hasBid) return -1;
                    if (b.hasBid) return 1;
                    return 0; // No difference for non-bids
                });
            case 'dateAsc':
                // Sort by request ID (proxy for date), oldest first
                return sortedRequests.sort((a, b) => 
                    parseInt(a.requestId.toString()) - parseInt(b.requestId.toString())
                );
            case 'dateDesc':
            default:
                // Sort by request ID (proxy for date), newest first
                return sortedRequests.sort((a, b) => 
                    parseInt(b.requestId.toString()) - parseInt(a.requestId.toString())
                );
        }
    };

    // Function to open the bid details dialog for a crop with proper bid amount handling
    const handleViewBidsForCrop = async (cropId, cropName) => {
        try {
            setLoading(true);
            console.log(`Fetching bids for crop ${cropId} (${cropName})`);
            
            // Find all purchase requests related to this crop
            const relatedRequests = purchaseRequests.filter(
                request => request.cropID.toString() === cropId.toString() && 
                request.status.toString() === "0" // Only show pending requests
            );
            
            console.log("Found related requests:", relatedRequests);
            
            // Process the requests to get bid information with better logging
            const bidsInfo = relatedRequests.map(request => {
                // Get custom bid information if available
                const bidInfo = getBidForRequest(request.requestId);
                
                // Check if this is a bid with custom price
                const hasBid = bidInfo !== null;
                
                // Get the bid price from the bidInfo if available, or use bidPriceInEther from the request
                // This ensures we use the actual bid value entered by the buyer
                let bidPrice = null;
                let bidPriceWei = null;
                
                if (hasBid && bidInfo && bidInfo.bidPrice) {
                    // Use price from stored bid info
                    bidPrice = bidInfo.bidPrice;
                    bidPriceWei = bidInfo.bidPriceWei;
                } else if (request.bidPriceInEther) {
                    // Use price from the request itself if available (this is the price entered by buyer)
                    bidPrice = request.bidPriceInEther;
                    bidPriceWei = null;  // We don't have the Wei value in this case
                }
                
                console.log(`Processing request ${request.requestId}:`, {
                    basePrice: request.priceInEther,
                    hasBid: hasBid,
                    bidInfo: bidInfo,
                    bidPrice: bidPrice,
                    bidPriceInEther: request.bidPriceInEther
                });
                
                return {
                    requestId: request.requestId.toString(),
                    buyerId: request.buyer,
                    buyerName: request.buyerName || "Anonymous Buyer",
                    // Anonymize the buyer address
                    anonymousBuyerId: `Buyer_${request.buyer.substring(2, 6)}`,
                    quantity: request.quantity.toString(),
                    basePrice: request.priceInEther || '0',
                    hasBid: hasBid || (request.bidPriceInEther ? true : false), // Consider it a bid if we have a bidPriceInEther
                    bidPrice: bidPrice || request.bidPriceInEther || null, // Use the processed bidPrice or the bidPriceInEther from request
                    bidPriceWei: bidPriceWei,
                    priceDiffPercentage: request.priceDiffPercentage || 0,
                    timestamp: request.timestamp || Date.now()
                };
            });
            
            console.log("Processed bids info:", bidsInfo);
            
            // Sort bids by price (highest first) with proper null checking
            const sortedBids = bidsInfo.sort((a, b) => {
                const priceA = a.hasBid && a.bidPrice ? parseFloat(a.bidPrice) : parseFloat(a.basePrice || 0);
                const priceB = b.hasBid && b.bidPrice ? parseFloat(b.bidPrice) : parseFloat(b.basePrice || 0);
                return priceB - priceA;
            });
            
            console.log("Sorted bids:", sortedBids);
            
            // Open the dialog with bid information
            setBidDetailsDialog({
                open: true,
                cropId,
                cropName,
                bids: sortedBids
            });
        } catch (error) {
            console.error("Error fetching bids for crop:", error);
            setSnackbar({
                open: true,
                message: `Error fetching bids: ${error.message}`,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Function to close the bid details dialog
    const handleCloseBidDetailsDialog = () => {
        setBidDetailsDialog({
            ...bidDetailsDialog,
            open: false
        });
    };

    // Add function to check MetaMask connection before accepting bids
    const checkMetaMaskAndAcceptBid = async (bidInfo) => {
        try {
            // First check if MetaMask is installed
            if (!window.ethereum) {
                setSnackbar({
                    open: true,
                    message: "MetaMask is not installed. Please install MetaMask to continue.",
                    severity: 'error'
                });
                return;
            }
            
            // Check if MetaMask is connected
            let accounts = await window.ethereum.request({ 
                method: 'eth_accounts',
                params: []
            });
            
            if (!accounts || accounts.length === 0) {
                // Not connected, try to connect
                console.log("MetaMask not connected. Requesting connection...");
                
                try {
                    // Show a user-friendly message before attempting connection
                    setSnackbar({
                        open: true,
                        message: "Please connect to MetaMask when prompted to accept this bid",
                        severity: 'info',
                        duration: 6000
                    });
                    
                    const newAccounts = await window.ethereum.request({ 
                        method: 'eth_requestAccounts',
                        params: []
                    });
                    
                    if (!newAccounts || newAccounts.length === 0) {
                        throw new Error("Failed to connect to MetaMask");
                    }
                    
                    accounts = newAccounts;
                    
                    // If account changed, update local state
                    if (newAccounts[0] !== localAccount) {
                        setLocalAccount(newAccounts[0]);
                        localStorage.setItem('farmerAccount', newAccounts[0]);
                        
                        // Allow time for state update and show success message
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        setSnackbar({
                            open: true,
                            message: "Successfully connected to MetaMask",
                            severity: 'success',
                            duration: 3000
                        });
                    }
                } catch (connectError) {
                    console.error("Error connecting to MetaMask:", connectError);
                    
                    // Check if this was a user rejection
                    if (connectError.code === 4001) {
                        setSnackbar({
                            open: true,
                            message: "MetaMask connection was rejected. Please try again.",
                            severity: 'warning'
                        });
                    } else {
                        setSnackbar({
                            open: true,
                            message: "Could not connect to MetaMask. Please try again.",
                            severity: 'error'
                        });
                    }
                    return;
                }
            }
            
            // Verify we're connected with the right account
            const currentAccount = accounts[0];
            console.log("Connected with account:", currentAccount);
            
            // Check if we need to reinitialize the contract or refresh data
            if (currentAccount !== localAccount) {
                // Account has changed, update state
                setLocalAccount(currentAccount);
                localStorage.setItem('farmerAccount', currentAccount);
                
                // Reinitialize contract with new account
                await initializeContract();
                
                // Refresh data with the new account
                await fetchPurchaseRequests();
                
                // Give time for data to refresh
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // Get the full request info
            const request = purchaseRequests.find(req => req.requestId.toString() === bidInfo.requestId.toString());
            if (!request) {
                throw new Error(`Request with ID ${bidInfo.requestId} not found`);
            }
            
            // If this is a custom bid with a bidPrice, ask for confirmation
            if (bidInfo.hasBid && bidInfo.bidPrice) {
                // Close the dialog if open
                if (bidDetailsDialog.open) {
                    handleCloseBidDetailsDialog();
                }
                
                // Show confirmation dialog with custom price
                if (!window.confirm(`Accept this purchase request at the custom bid price of ${bidInfo.bidPrice} ETH?`)) {
                    console.log("User cancelled custom price acceptance");
                    return;
                }
                
                console.log(`Accepting request with custom bid price of ${bidInfo.bidPrice} ETH`);
            } else {
                // Close the dialog if open
                if (bidDetailsDialog.open) {
                    handleCloseBidDetailsDialog();
                }
            }
            
            // Show a message that we're processing the transaction
            setSnackbar({
                open: true,
                message: "Processing transaction. Please confirm in MetaMask...",
                severity: 'info',
                duration: 15000
            });
            
            // Accept the bid
            await handleRespondToPurchaseRequest(bidInfo.requestId, true);
            
            // After successfully accepting the request, create a record in localStorage to remember the custom price
            if (bidInfo.hasBid && bidInfo.bidPrice && bidInfo.bidPriceWei) {
                try {
                    const acceptedCustomBids = JSON.parse(localStorage.getItem('acceptedCustomBids') || '{}');
                    
                    // Store the accepted bid details
                    acceptedCustomBids[bidInfo.requestId] = {
                        requestId: bidInfo.requestId,
                        originalPrice: request.priceInEther,
                        originalPriceWei: request.price,
                        customPrice: bidInfo.bidPrice,
                        customPriceWei: bidInfo.bidPriceWei,
                        timestamp: Date.now()
                    };
                    
                    localStorage.setItem('acceptedCustomBids', JSON.stringify(acceptedCustomBids));
                    console.log(`Stored accepted custom bid for request ${bidInfo.requestId} in localStorage`);
                    
                    // Show success message with custom price
                    setSnackbar({
                        open: true,
                        message: `Purchase request accepted at custom bid price of ${bidInfo.bidPrice} ETH!`,
                        severity: 'success'
                    });
                } catch (error) {
                    console.error("Error storing accepted custom bid in localStorage:", error);
                }
            }
        } catch (error) {
            console.error("Error in MetaMask connection check:", error);
            setSnackbar({
                open: true,
                message: `Connection error: ${error.message}`,
                severity: 'error'
            });
        }
    };

    // Function to accept a bid directly from the bid details dialog
    const handleAcceptBidFromDialog = (bidInfo) => {
        // Use the MetaMask check function instead of directly calling accept
        checkMetaMaskAndAcceptBid(bidInfo);
    };

    // Function to check if a crop has any bids
    const hasBidsForCrop = (cropId) => {
        if (!purchaseRequests || purchaseRequests.length === 0) return false;
        
        // Check if there are any pending purchase requests for this crop with bids
        const hasBids = purchaseRequests.some(request => 
            request.cropID.toString() === cropId.toString() && 
            request.status.toString() === "0" && // Pending requests only
            request.hasBid // Has a custom bid
        );
        
        return hasBids;
    };

    // Add a function to count bids for a crop
    const countBidsForCrop = (cropId) => {
        if (!purchaseRequests || purchaseRequests.length === 0) return 0;
        
        // Count pending purchase requests for this crop
        return purchaseRequests.filter(request => 
            request.cropID.toString() === cropId.toString() && 
            request.status.toString() === "0" // Pending requests only
        ).length;
    };

    // Add a function to count custom bids for a crop (bids with custom price)
    const countCustomBidsForCrop = (cropId) => {
        if (!purchaseRequests || purchaseRequests.length === 0) return 0;
        
        // Count pending purchase requests with custom bids for this crop
        return purchaseRequests.filter(request => 
            request.cropID.toString() === cropId.toString() && 
            request.status.toString() === "0" && // Pending requests only
            request.hasBid // Has a custom bid
        ).length;
    };

    // Add a debug function to analyze and fix bid amounts
    const debugPurchaseRequestsAndBids = () => {
        try {
            console.log("==== DEBUG: PURCHASE REQUESTS ====");
            console.log("All purchase requests:", purchaseRequests);
            
            // Check localStorage for bid information
            const storedBids = JSON.parse(localStorage.getItem('cropBids') || '{}');
            console.log("==== DEBUG: STORED BIDS ====");
            console.log("Stored bids in localStorage:", storedBids);
            
            // Analyze each request for bid info
            if (purchaseRequests && purchaseRequests.length > 0) {
                console.log("==== DEBUG: ANALYZING REQUESTS ====");
                purchaseRequests.forEach(request => {
                    const requestId = request.requestId?.toString();
                    if (!requestId) {
                        console.log("Request missing ID:", request);
                        return;
                    }
                    
                    console.log(`Analyzing request ${requestId}:`);
                    console.log("- Base price:", request.priceInEther, "ETH");
                    console.log("- Buyer:", request.buyer);
                    
                    // Check if this has a bid
                    const bidInfo = getBidForRequest(requestId);
                    if (bidInfo) {
                        console.log("- Has bid:", true);
                        console.log("- Bid price:", bidInfo.bidPrice, "ETH");
                        console.log("- Bid price (wei):", bidInfo.bidPriceWei);
                    } else {
                        console.log("- Has bid:", false);
                        if (request.bidPriceInEther) {
                            console.log("- Request has bidPriceInEther:", request.bidPriceInEther, "ETH");
                        }
                    }
                    
                    console.log("- Full request data:", request);
                    console.log("------------------------");
                });
            }
        } catch (error) {
            console.error("Error in debug function:", error);
        }
    };

    // Call the debug function when viewing bids
    useEffect(() => {
        if (bidDetailsDialog.open) {
            debugPurchaseRequestsAndBids();
        }
    }, [bidDetailsDialog.open]);

    // Add a helper function to set debug bids for testing
    const setDebugBid = (requestId, bidPrice) => {
        try {
            console.log(`Setting debug bid of ${bidPrice} ETH for request ${requestId}`);
            
            const debugBids = JSON.parse(localStorage.getItem('debugBids') || '{}');
            
            // Create a fake bid object
            debugBids[requestId] = {
                requestId: requestId,
                bidPrice: bidPrice.toString(),
                bidPriceWei: window.web3.utils.toWei(bidPrice.toString(), 'ether'),
                timestamp: Date.now()
            };
            
            localStorage.setItem('debugBids', JSON.stringify(debugBids));
            console.log(`Set debug bid successfully:`, debugBids[requestId]);
            
            // Refresh purchase requests to show the new bid
            fetchPurchaseRequests();
            
            return true;
        } catch (error) {
            console.error(`Error setting debug bid:`, error);
            return false;
        }
    };

    // Call this function directly in the console for debugging:
    // Example: window.setDebugBid = setDebugBid;
    useEffect(() => {
        // Make the function available globally for debugging
        window.setDebugBid = setDebugBid;
    }, []);

    // Modify the acceptRequest function to add a notification about delivery
    const acceptRequest = async (requestId) => {
        try {
            setLoading(true);
            console.log(`Accepting request ${requestId}`);
            
            // Use respondToPurchaseRequest instead of direct contract call
            await handleRespondToPurchaseRequest(requestId, true);
            
            // After successful acceptance, show a notification with delivery instructions
            setSnackbar({
                open: true,
                message: "Purchase request accepted successfully. Prepare the crop for delivery!",
                severity: "success",
                duration: 6000
            });
            
            // Show a more detailed alert about next steps
            setTimeout(() => {
                alert("Request accepted! Next steps:\n\n" +
                      "1. Prepare the crop for delivery\n" +
                      "2. The buyer will now complete the purchase by paying\n" +
                      "3. Once payment is received, deliver the crop to the buyer\n" +
                      "4. The buyer will confirm delivery to release your payment\n\n" +
                      "You will be notified when payment is made.");
            }, 1000);
            
            // Store that this request was accepted to notify later about payment
            const acceptedRequests = JSON.parse(localStorage.getItem('farmerAcceptedRequests') || '[]');
            if (!acceptedRequests.includes(requestId.toString())) {
                acceptedRequests.push(requestId.toString());
                localStorage.setItem('farmerAcceptedRequests', JSON.stringify(acceptedRequests));
            }
            
            // Refresh the dashboard to update the UI
            fetchPurchaseRequests();
        } catch (error) {
            console.error("Error accepting request:", error);
            setSnackbar({
                open: true,
                message: `Error accepting request: ${error.message}`,
                severity: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    // Add a function to check if payments were made for accepted requests
    const checkForPayments = async () => {
        try {
            if (!contract || !account) return;
            
            console.log("Checking for payments on previously accepted requests...");
            
            // Get all accepted requests that we're tracking
            const acceptedRequestIds = JSON.parse(localStorage.getItem('farmerAcceptedRequests') || '[]');
            if (acceptedRequestIds.length === 0) {
                console.log("No accepted requests to check for payments");
                return;
            }
            
            console.log("Checking payments for these accepted request IDs:", acceptedRequestIds);
            
            // Get all deliveries to check which requests have been paid for
            const allDeliveries = await contract.methods.getAllDeliveries().call({from: account});
            console.log("All deliveries:", allDeliveries);
            
            // Get already notified payments from localStorage
            const notifiedPayments = JSON.parse(localStorage.getItem('farmerNotifiedPayments') || '[]');
            
            // For each delivery, check if it corresponds to one of our accepted requests
            for (const delivery of allDeliveries) {
                const requestId = delivery.requestId.toString();
                
                // If this is one of our accepted requests and we haven't notified about it yet
                if (acceptedRequestIds.includes(requestId) && !notifiedPayments.includes(requestId)) {
                    console.log(`Found payment for request ${requestId}`);
                    
                    // Fetch more details about this request
                    let requestDetails;
                    try {
                        // Try to get request details
                        requestDetails = await contract.methods.getSingleRequest(requestId).call({from: account});
                        console.log("Request details:", requestDetails);
                    } catch (error) {
                        console.error(`Error getting details for request ${requestId}:`, error);
                        // Continue to next delivery if we can't get details
                        continue;
                    }
                    
                    // Fetch crop name for better notification
                    let cropName = `Crop #${requestDetails.cropID}`;
                    try {
                        const crop = await contract.methods.getCrop(requestDetails.cropID).call({from: account});
                        cropName = crop.cropName;
                    } catch (error) {
                        console.error(`Error getting crop name for ID ${requestDetails.cropID}:`, error);
                    }
                    
                    // Fetch buyer name if possible
                    let buyerName = requestDetails.buyer.substring(0, 6) + "..." + requestDetails.buyer.substring(requestDetails.buyer.length - 4);
                    try {
                        const buyerProfile = await contract.methods.getBuyerProfile(requestDetails.buyer).call({from: account});
                        if (buyerProfile && buyerProfile.name) {
                            buyerName = buyerProfile.name;
                        }
                    } catch (error) {
                        console.warn(`Could not get buyer name for ${requestDetails.buyer}:`, error);
                    }
                    
                    // Calculate payment amount
                    const paymentAmount = web3.utils.fromWei(delivery.amountHeld.toString(), 'ether');
                    
                    // Show notification
                    setSnackbar({
                        open: true,
                        message: `Payment of ${paymentAmount} ETH received for ${cropName}. Please deliver to ${buyerName}!`,
                        severity: "success",
                        duration: 8000
                    });
                    
                    // Show more detailed alert
                    setTimeout(() => {
                        alert(`Payment Received!\n\n` +
                              `Buyer: ${buyerName}\n` +
                              `Crop: ${cropName}\n` +
                              `Quantity: ${requestDetails.quantity} kg\n` +
                              `Payment: ${paymentAmount} ETH (held in escrow)\n\n` +
                              `Next Steps:\n` +
                              `1. Contact the buyer to arrange delivery\n` +
                              `2. Deliver the crop to the buyer\n` +
                              `3. Ask the buyer to confirm delivery to release your payment`);
                    }, 1000);
                    
                    // Add to notified payments
                    notifiedPayments.push(requestId);
                }
            }
            
            // Save updated notified payments to localStorage
            if (notifiedPayments.length > 0) {
                localStorage.setItem('farmerNotifiedPayments', JSON.stringify(notifiedPayments));
            }
        } catch (error) {
            console.error("Error checking for payments:", error);
        }
    };

    // Call the check function periodically
    useEffect(() => {
        // Check for payments on initial load
        checkForPayments();
        
        // Set up interval to check periodically (every 30 seconds)
        const intervalId = setInterval(checkForPayments, 30000);
        
        return () => clearInterval(intervalId);
    }, [contract, account, web3]);

    // Add a function to check for confirmed deliveries and released payments
    const checkForConfirmedDeliveries = async () => {
        try {
            if (!contract || !account) return;
            
            console.log("Checking for confirmed deliveries...");
            
            // Get all deliveries
            const allDeliveries = await contract.methods.getAllDeliveries().call({from: account});
            
            // Get already notified confirmed deliveries from localStorage
            const notifiedDeliveries = JSON.parse(localStorage.getItem('farmerNotifiedDeliveries') || '[]');
            
            // Filter for confirmed deliveries that are tied to this farmer and not yet notified
            for (const delivery of allDeliveries) {
                if (delivery.isDelivered && !notifiedDeliveries.includes(delivery.deliveryId.toString())) {
                    // Check if this is our delivery
                    try {
                        const request = await contract.methods.getSingleRequest(delivery.requestId).call({from: account});
                        
                        // If this farmer is the seller
                        if (request.seller.toLowerCase() === account.toLowerCase()) {
                            console.log(`Found confirmed delivery: ${delivery.deliveryId} for request ${delivery.requestId}`);
                            
                            // Get crop details
                            let cropName = `Crop #${request.cropID}`;
                            try {
                                const crop = await contract.methods.getCrop(request.cropID).call({from: account});
                                cropName = crop.cropName;
                            } catch (error) {
                                console.error("Error getting crop name:", error);
                            }
                            
                            // Get buyer details
                            let buyerName = request.buyer.substring(0, 6) + "..." + request.buyer.substring(request.buyer.length - 4);
                            try {
                                const buyerProfile = await contract.methods.getBuyerProfile(request.buyer).call({from: account});
                                if (buyerProfile && buyerProfile.name) {
                                    buyerName = buyerProfile.name;
                                }
                            } catch (error) {
                                console.warn("Could not get buyer name:", error);
                            }
                            
                            // Calculate payment amount
                            const paymentAmount = web3.utils.fromWei(delivery.amountHeld.toString(), 'ether');
                            
                            // Show notification
                            setSnackbar({
                                open: true,
                                message: `${buyerName} has confirmed delivery of ${cropName}. Payment of ${paymentAmount} ETH has been released to your account!`,
                                severity: "success",
                                duration: 10000
                            });
                            
                            // Show more detailed alert
                            setTimeout(() => {
                                alert(`Delivery Confirmed - Payment Released!\n\n` +
                                      `Buyer: ${buyerName}\n` +
                                      `Crop: ${cropName}\n` +
                                      `Quantity: ${request.quantity} kg\n` +
                                      `Payment: ${paymentAmount} ETH\n\n` +
                                      `The payment has been transferred to your wallet. Thank you for using Farm Assure!`);
                            }, 1000);
                            
                            // Add to notified deliveries
                            notifiedDeliveries.push(delivery.deliveryId.toString());
                        }
                    } catch (error) {
                        console.error(`Error checking request for delivery ${delivery.deliveryId}:`, error);
                    }
                }
            }
            
            // Save updated notified deliveries to localStorage
            if (notifiedDeliveries.length > 0) {
                localStorage.setItem('farmerNotifiedDeliveries', JSON.stringify(notifiedDeliveries));
            }
        } catch (error) {
            console.error("Error checking for confirmed deliveries:", error);
        }
    };

    // Add to existing useEffect or create a new one to check for confirmed deliveries
    useEffect(() => {
        // Check for confirmed deliveries on initial load
        checkForConfirmedDeliveries();
        
        // Set up interval to check periodically (every 30 seconds)
        const intervalId = setInterval(checkForConfirmedDeliveries, 30000);
        
        return () => clearInterval(intervalId);
    }, [contract, account, web3]);

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
                        Farm Assure - Farmer Dashboard
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
                    <Tooltip title="Force Sync Removed Crops">
                        <IconButton 
                            color="secondary" 
                            onClick={forceSyncRemovedCrops}
                            size="small"
                            sx={{ 
                                ml: 1, 
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                }
                            }}
                        >
                            <SyncIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
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
                        <Tab 
                            label="My Listings" 
                            icon={hasNewBids ? <Badge color="error" variant="dot"><AgricultureIcon /></Badge> : null}
                            iconPosition="end"
                        />
                        <Tab 
                            label="Purchase Requests" 
                            icon={hasNewRequests ? <Badge color="error" variant="dot"><NotificationsIcon /></Badge> : null}
                            iconPosition="end"
                        />
                        <Tab label="Orders & Cultivation" />
                    </Tabs>
                </Paper>

                {tabValue === 0 && (
                    // My Listings Tab
                    <Grid container spacing={3}>
                        {debugCropFiltering()}
                        {loading ? (
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                                <CircularProgress />
                            </Grid>
                        ) : crops.length > 0 ? (
                            crops.map((crop, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                        {hasBidsForCrop(crop.cropID) ? (
                                        <Box 
                                            sx={{ 
                                                    position: 'absolute',
                                                    top: 10,
                                                    right: 10,
                                                    zIndex: 1,
                                                    bgcolor: 'success.main',
                                                    color: 'white',
                                                    borderRadius: '4px',
                                                    px: 1,
                                                    py: 0.5,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                {countCustomBidsForCrop(crop.cropID)} BIDS
                                            </Box>
                                        ) : countBidsForCrop(crop.cropID) > 0 ? (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 10,
                                                    right: 10,
                                                    zIndex: 1,
                                                    bgcolor: 'primary.main',
                                                    color: 'white',
                                                    borderRadius: '4px',
                                                    px: 1,
                                                    py: 0.5,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <NotificationsIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                {countBidsForCrop(crop.cropID)} REQUESTS
                                            </Box>
                                        ) : null}
                                        <Box 
                                            sx={{ 
                                                position: 'relative',
                                                height: 200, 
                                                backgroundColor: 'grey.200',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {loadingImages[crop.cropID.toString()] ? (
                                                <Skeleton 
                                                    variant="rectangular" 
                                                    animation="wave"
                                                    width="100%" 
                                                    height="100%" 
                                                    sx={{ position: 'absolute', top: 0, left: 0 }}
                                                />
                                            ) : null}
                                            <img
                                                src={getCropImageUrl(crop)}
                                                alt={crop.cropName}
                                                data-cid={crop.imageCID}
                                                onError={(e) => handleImageError(e, crop.cropID.toString(), crop.imageCID)}
                                                onLoad={() => handleImageLoad(crop.cropID.toString())}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    objectPosition: 'center',
                                                    transition: 'opacity 0.3s ease',
                                                    opacity: loadingImages[crop.cropID.toString()] ? 0 : 1
                                                }}
                                            />
                                        </Box>
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
                                                Cultivation Date: {crop.deliveryDate}
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                            <Button 
                                                startIcon={<DeleteIcon />} 
                                                color="error" 
                                                size="small"
                                                onClick={() => handleOpenConfirmDialog(crop.cropID, crop.cropName)}
                                            >
                                                Remove
                                            </Button>
                                            <Button
                                                startIcon={
                                                    <Badge 
                                                        color="primary" 
                                                        badgeContent={countBidsForCrop(crop.cropID)} 
                                                        invisible={countBidsForCrop(crop.cropID) === 0}
                                                    >
                                                        <AttachMoneyIcon />
                                                    </Badge>
                                                } 
                                                color="primary"
                                                size="small"
                                                onClick={() => handleViewBidsForCrop(crop.cropID, crop.cropName)}
                                            >
                                                {countBidsForCrop(crop.cropID) > 0 
                                                    ? `View ${countBidsForCrop(crop.cropID)} ${countBidsForCrop(crop.cropID) === 1 ? 'Request' : 'Requests'}` 
                                                    : 'View Requests'}
                                            </Button>
                                        </CardActions>
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

                        {hasNewRequests && (
                            <Alert severity="info" sx={{ mb: 3 }}>
                                You have new purchase requests waiting for your response!
                            </Alert>
                        )}
                        
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">Purchase Requests</Typography>
                                    <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                                        <InputLabel>Sort By</InputLabel>
                                        <Select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            label="Sort By"
                                        >
                                            <MenuItem value="dateDesc">Newest First</MenuItem>
                                            <MenuItem value="dateAsc">Oldest First</MenuItem>
                                            <MenuItem value="bidDesc">Highest Bid First</MenuItem>
                                            <MenuItem value="bidAsc">Lowest Bid First</MenuItem>
                                            <MenuItem value="percentDesc">Highest % Increase First</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                
                                <TableContainer component={Paper} sx={{ mt: 3 }}>
                                <Table>
                                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableRow>
                                                <TableCell>Crop</TableCell>
                                                <TableCell>Buyer</TableCell>
                                                <TableCell>Quantity</TableCell>
                                                <TableCell>Price (ETH)</TableCell>
                                                <TableCell>Bid</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                            {getSortedRequests().length > 0 ? (
                                                getSortedRequests().map((request, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{request.cropName}</TableCell>
                                                        <TableCell>{request.buyerName}</TableCell>
                                                        <TableCell>{request.quantity.toString()} kg</TableCell>
                                                        <TableCell>{request.priceInEther} ETH</TableCell>
                                                    <TableCell>
                                                            {request.hasBid ? (
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                                    <Typography variant="body2" fontWeight="bold">
                                                                        {request.bidPriceInEther} ETH
                                                        </Typography>
                                                                    <Chip 
                                                                        size="small"
                                                                        label={`${request.priceDiffPercentage >= 0 ? '+' : ''}${request.priceDiffPercentage.toFixed(1)}%`}
                                                                        color={request.priceDiffPercentage >= 0 ? "success" : "error"}
                                                                        sx={{ mt: 0.5 }}
                                                                    />
                                                                </Box>
                                                            ) : (
                                                                <Typography variant="body2" color="text.secondary">
                                                                    No Bid
                                                        </Typography>
                                                            )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                                label={request.statusText} 
                                                            color={
                                                                    request.status.toString() === "0" ? "warning" : 
                                                                    request.status.toString() === "1" ? "success" : "error"
                                                            }
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                            {request.status.toString() === "0" && (
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    size="small"
                                                                    onClick={() => checkMetaMaskAndAcceptBid({requestId: request.requestId})}
                                                                    disabled={loading}
                                                                >
                                                                    Accept
                                                                </Button>
                                                                <Button
                                                                        variant="outlined" 
                                                                    color="error"
                                                                    size="small"
                                                                        onClick={() => handleRespondToPurchaseRequest(request.requestId, false)}
                                                                        disabled={loading}
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </Box>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                    <TableCell colSpan={7} align="center">No purchase requests found.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            </>
                        )}
                    </>
                )}

                {tabValue === 2 && (
                    // Orders & Cultivation Tab
                    <Typography variant="body1" sx={{ textAlign: 'center', py: 5 }}>
                        Orders and cultivation tracking will be implemented soon.
                    </Typography>
                )}
            </Container>

            {/* Add New Crop Dialog */}
            <Dialog open={showAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Crop</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Enter the details of your crop to list it on the marketplace. A unique crop ID will be automatically generated for your listing.
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
                        label="Cultivation Date"
                        type="date"
                        fullWidth
                        value={cultivationDate}
                        onChange={(e) => setCultivationDate(e.target.value)}
                        helperText="When was the crop cultivated?"
                        InputProps={{
                            startAdornment: <CalendarMonthIcon color="action" sx={{ mr: 1 }} />
                        }}
                        InputLabelProps={{
                            shrink: true,
                        }}
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
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <label htmlFor="crop-image-upload">
                            <Button
                                variant="outlined"
                                component="span"
                                sx={{ mr: 2 }}
                                    startIcon={<CloudUploadIcon />}
                            >
                                Select Image
                            </Button>
                        </label>
                            {cropImage && !imageCID && (
                        <Button
                            variant="contained"
                            onClick={handleImageUpload}
                            disabled={!cropImage || uploadingImage}
                                    startIcon={uploadingImage ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                        >
                                    {uploadingImage ? "Uploading..." : "Upload Now"}
                        </Button>
                            )}
                            {imageCID && (
                                <Chip 
                                    color="success" 
                                    icon={<CheckCircleIcon />} 
                                    label="Image Uploaded" 
                                    variant="outlined"
                                />
                            )}
                        </Box>
                        
                        {cropImagePreview && (
                            <Paper 
                                elevation={2} 
                                sx={{ 
                                    mt: 2, 
                                    p: 1, 
                                    textAlign: 'center',
                                    position: 'relative',
                                    bgcolor: imageCID ? 'success.50' : 'background.paper'
                                }}
                            >
                                <img 
                                    src={cropImagePreview} 
                                    alt="Crop preview" 
                                    style={{ 
                                        maxWidth: '100%', 
                                        maxHeight: '200px',
                                        objectFit: 'contain',
                                        border: imageCID ? '1px solid #4caf50' : 'none',
                                        borderRadius: '4px'
                                    }} 
                                />
                                <Typography 
                                    variant="caption" 
                                    color={imageCID ? "success.main" : "text.secondary"} 
                                    sx={{ 
                                        display: 'block', 
                                        mt: 1, 
                                        fontWeight: imageCID ? 'bold' : 'normal' 
                                    }}
                                >
                                    {imageCID 
                                        ? "✓ Image uploaded to IPFS (will be included with your listing)" 
                                        : "Image will be automatically uploaded when you add the listing"}
                                    </Typography>
                            </Paper>
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

            {/* Confirmation Dialog for Deleting Crops */}
            <Dialog
                open={confirmDialog.open}
                onClose={loading ? undefined : handleCloseConfirmDialog}
            >
                <DialogTitle>Permanently Remove Crop</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to permanently remove "{confirmDialog.cropName}" from your listings?
                        <br /><br />
                        <strong>Important:</strong> This action will:
                        <ul>
                            <li>Set the crop's quantity to zero in the blockchain</li>
                            <li>Hide this crop from your listings permanently</li>
                            <li>The crop will remain hidden even after page refreshes</li>
                        </ul>
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDialog} color="primary" disabled={loading}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={() => removeCrop(confirmDialog.cropId)} 
                        color="error" 
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                        disabled={loading}
                    >
                        {loading ? "Removing..." : "Permanently Remove"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bid Details Dialog */}
            <Dialog 
                open={bidDetailsDialog.open} 
                onClose={handleCloseBidDetailsDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6">
                            {bidDetailsDialog.bids.length > 0 
                                ? `${bidDetailsDialog.bids.length} ${bidDetailsDialog.bids.length === 1 ? 'Bid' : 'Bids'} for ${bidDetailsDialog.cropName}`
                                : `Bids for ${bidDetailsDialog.cropName}`
                            }
                        </Typography>
                        <IconButton
                            aria-label="close"
                            onClick={handleCloseBidDetailsDialog}
                            sx={{
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {bidDetailsDialog.bids.length === 0 ? (
                        <Box sx={{ py: 3, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                No bids have been placed for this crop yet.
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Check back later or adjust your listing to attract more buyers.
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Bid Summary
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Showing all active bids for this crop. Buyer identities are anonymized for privacy. 
                                    Bids are sorted with highest price first.
                                </Typography>
                            </Box>
                            
                            {/* Highlight highest bid section */}
                            {bidDetailsDialog.bids.length > 0 && bidDetailsDialog.bids[0].hasBid && (
                                <Paper 
                                    elevation={3} 
                                    sx={{ 
                                        mb: 3, 
                                        p: 2, 
                                        bgcolor: 'success.light', 
                                        color: 'success.contrastText',
                                        borderRadius: 2
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                        <Box>
                                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                                Highest Bid: {bidDetailsDialog.bids[0].bidPrice} ETH
                                            </Typography>
                                            <Typography variant="body2">
                                                <strong>Buyer:</strong> {bidDetailsDialog.bids[0].anonymousBuyerId} | 
                                                <strong> Quantity:</strong> {bidDetailsDialog.bids[0].quantity} kg
                                            </Typography>
                                            {bidDetailsDialog.bids[0].priceDiffPercentage > 0 && (
                                                <Typography variant="body2" sx={{ color: 'success.dark', fontWeight: 'bold', mt: 0.5 }}>
                                                    {bidDetailsDialog.bids[0].priceDiffPercentage.toFixed(1)}% higher than your listing price!
                                                </Typography>
                                            )}
                                        </Box>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="large"
                                            startIcon={<CheckCircleIcon />}
                                            onClick={() => handleAcceptBidFromDialog(bidDetailsDialog.bids[0])}
                                        >
                                            Accept Request
                                        </Button>
                                    </Box>
                                </Paper>
                            )}
                            
                            {/* Show statistics if there are multiple bids */}
                            {bidDetailsDialog.bids.length > 1 && (
                                <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    <Paper sx={{ p: 2, flex: 1, minWidth: '200px' }}>
                                        <Typography variant="subtitle2" color="text.secondary">Total Bids</Typography>
                                        <Typography variant="h6">{bidDetailsDialog.bids.length}</Typography>
                                    </Paper>
                                    <Paper sx={{ p: 2, flex: 1, minWidth: '200px', bgcolor: bidDetailsDialog.bids && bidDetailsDialog.bids.length > 0 && bidDetailsDialog.bids[0].hasBid ? 'primary.light' : 'background.paper', color: bidDetailsDialog.bids && bidDetailsDialog.bids.length > 0 && bidDetailsDialog.bids[0].hasBid ? 'primary.contrastText' : 'text.primary', border: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="subtitle2" color="inherit">Highest Offer</Typography>
                                        {bidDetailsDialog.bids && bidDetailsDialog.bids.length > 0 ? (
                                            <>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                    {bidDetailsDialog.bids[0].hasBid && bidDetailsDialog.bids[0].bidPrice && bidDetailsDialog.bids[0].bidPrice !== '0'
                                                        ? `${bidDetailsDialog.bids[0].bidPrice} ETH` 
                                                        : `${bidDetailsDialog.bids[0].basePrice || "0"} ETH (base)`}
                                                </Typography>
                                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                                    by {bidDetailsDialog.bids[0].anonymousBuyerId}
                                                </Typography>
                                            </>
                                        ) : (
                                            <Typography variant="body1" color="text.secondary">No bids yet</Typography>
                                        )}
                                    </Paper>
                                    <Paper sx={{ p: 2, flex: 1, minWidth: '200px' }}>
                                        <Typography variant="subtitle2" color="text.secondary">Total Quantity</Typography>
                                        <Typography variant="h6">
                                            {bidDetailsDialog.bids.reduce((acc, bid) => acc + parseInt(bid.quantity), 0)} kg
                                        </Typography>
                                    </Paper>
                                </Box>
                            )}
                            
                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                All Bids
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ bgcolor: 'background.default' }}>
                                        <TableRow>
                                            <TableCell>Buyer ID</TableCell>
                                            <TableCell>Quantity</TableCell>
                                            <TableCell>Bid Amount</TableCell>
                                            <TableCell>Difference</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bidDetailsDialog.bids.map((bid, index) => (
                                            <TableRow 
                                                key={index}
                                                sx={{
                                                    backgroundColor: index === 0 ? 'rgba(76, 175, 80, 0.1)' : 'inherit',
                                                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                                                }}
                                            >
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        {index === 0 && (
                                                            <Chip 
                                                                label="HIGHEST" 
                                                                color="success" 
                                                                size="small" 
                                                                sx={{ mr: 1 }}
                                                            />
                                                        )}
                                                        <Typography variant="body2">
                                                            {bid.anonymousBuyerId}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{bid.quantity} kg</TableCell>
                                                <TableCell>
                                                    {bid.hasBid && bid.bidPrice && bid.bidPrice !== '0' ? (
                                                        <Box>
                                                            <Typography fontWeight="bold" color="primary">
                                                                {bid.bidPrice} ETH
                                                            </Typography>
                                                            {index > 0 && bidDetailsDialog.bids[0].hasBid && bidDetailsDialog.bids[0].bidPrice && bidDetailsDialog.bids[0].bidPrice !== '0' && (
                                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                                    {parseFloat(bid.bidPrice) === parseFloat(bidDetailsDialog.bids[0].bidPrice) 
                                                                        ? "Same as highest bid" 
                                                                        : `${((parseFloat(bid.bidPrice) - parseFloat(bidDetailsDialog.bids[0].bidPrice)) / parseFloat(bidDetailsDialog.bids[0].bidPrice) * 100).toFixed(1)}% lower than highest`}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Typography variant="body2">
                                                                {bid.basePrice} ETH
                                                            </Typography>
                                                            <Chip 
                                                                size="small"
                                                                label="Base Price"
                                                                variant="outlined"
                                                                color="default"
                                                                sx={{ ml: 1, fontSize: '0.6rem' }}
                                                            />
                                                        </Box>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {bid.hasBid && (
                                                        <Chip 
                                                            size="small"
                                                            label={`${bid.priceDiffPercentage >= 0 ? '+' : ''}${bid.priceDiffPercentage.toFixed(1)}%`}
                                                            color={bid.priceDiffPercentage >= 0 ? "success" : "error"}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        onClick={() => handleAcceptBidFromDialog(bid)}
                                                    >
                                                        Accept Request
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                                <Typography variant="body2" color="info.contrastText" gutterBottom>
                                    <strong>Note:</strong> When accepting a custom bid, the buyer will be able to complete the purchase at the bid price they offered. This allows for negotiated pricing between farmers and buyers.
                                </Typography>
                                <Typography variant="body2" color="info.contrastText" sx={{ mt: 1 }}>
                                    <strong>⚠️ Important:</strong> You will need to approve the transaction in MetaMask. If the MetaMask popup doesn't appear, check the extension icon in your browser.
                                </Typography>
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseBidDetailsDialog}>Close</Button>
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
