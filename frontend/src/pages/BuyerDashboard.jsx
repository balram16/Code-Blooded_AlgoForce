import React, { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import { 
    Box, Typography, Button, Container, Grid, Paper, Card, CardContent, 
    CardActions, CircularProgress, TextField, AppBar, Tabs, Tab, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
    InputLabel, MenuItem, Select, Chip, Snackbar, Alert, ListItem,
    ListItemText, List, Badge, IconButton, Skeleton
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
    Sync as SyncIcon,
    AccountBalance as AccountBalanceIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    Check as CheckIcon,
    Gavel as GavelIcon,
    Paid as PaidIcon,
    Verified as VerifiedIcon
} from '@mui/icons-material';

import { getIPFSGatewayURL, fetchIPFSImageDirectly, clearImageCache } from '../services/pinataService';
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
    const [activeTab, setActiveTab] = useState(0);
    const [contract, setContract] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [localAccount, setLocalAccount] = useState(account || null);
    const [loading, setLoading] = useState(true);
    const [crops, setCrops] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [bidAmount, setBidAmount] = useState("");
    const [bidQuantity, setBidQuantity] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("info");
    const [buyerName, setBuyerName] = useState("Buyer");
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [myRequests, setMyRequests] = useState([]);
    const [myBids, setMyBids] = useState([]);
    const [openBidHistory, setOpenBidHistory] = useState(false);
    const [bidHistory, setBidHistory] = useState([]);
    const [currentBidHistoryCrop, setCurrentBidHistoryCrop] = useState(null);
    const [cropHighestBids, setCropHighestBids] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [filterLocation, setFilterLocation] = useState("");
    const [priceRange, setPriceRange] = useState([0, 10]);
    const [deliveryDates, setDeliveryDates] = useState([]);
    const [filterDeliveryDate, setFilterDeliveryDate] = useState("");
    const [sortOption, setSortOption] = useState("price-asc");
    const [farmerAcceptedDeliveries, setFarmerAcceptedDeliveries] = useState([]);
    const [showCompletedRequests, setShowCompletedRequests] = useState(false);
    const [farmersCache, setFarmersCache] = useState({});
    
    // Image handling states
    const [directImageData, setDirectImageData] = useState({});
    const [loadingImages, setLoadingImages] = useState({});
    const [failedImages, setFailedImages] = useState({});
    
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
        
        // Clear image cache if it's over 2 days old
        const lastCacheClear = localStorage.getItem('last-image-cache-clear');
        const now = new Date().getTime();
        if (!lastCacheClear || (now - parseInt(lastCacheClear)) > (2 * 24 * 60 * 60 * 1000)) {
            clearImageCache();
            localStorage.setItem('last-image-cache-clear', now.toString());
        }
        
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
        if (activeTab === 2) {
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
    }, [activeTab, contract, localAccount]);

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
                    setActiveTab(tabIndex);
                }
            }
        } catch (error) {
            console.error("Error restoring tab from localStorage:", error);
            // Default to first tab if there's an error
            setActiveTab(0);
        }
    }, []);

    // Effect to load data when tab changes
    useEffect(() => {
        // Don't load on initial mount since we have a separate init effect
        if (activeTab === undefined) return;
        
        console.log("Tab changed effect triggered for tab:", activeTab);
        
        // Available Crops tab
        if (activeTab === 0) {
            if (!loading) {
                console.log("Loading data for Available Crops tab");
                setLoading(true);
                fetchListings()
                    .finally(() => setLoading(false));
            }
        }
        // My Requests tab - load once contract is initialized
        else if (activeTab === 1 && contract && localAccount) {
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
        else if (activeTab === 2) {
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
    }, [activeTab, contract, localAccount, account]);

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

    // Helper function to get image URL from IPFS CID - improved version
    const getCropImageUrl = (crop) => {
        if (!crop || !crop.imageCID) {
            return 'https://via.placeholder.com/300x200?text=No+Image';
        }
        
        const cropId = crop.id ? crop.id.toString() : '';
        
        // If this image has permanently failed, return placeholder immediately
        if (failedImages[cropId]) {
            return 'https://via.placeholder.com/300x200?text=Image+Unavailable';
        }
        
        // If we already have direct image data for this crop, use it
        if (directImageData[cropId]) {
            return directImageData[cropId];
        }
        
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
    };

    // Function to fetch image directly if needed
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

    // Handler for image errors
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
            const bids = await contract.methods.getBidsForCrop(cropId).call();
            
            // Transform contract data to a more usable format
            const formattedBids = bids.map(bid => ({
                bidder: bid.bidder,
                amount: web3.utils.fromWei(bid.amount, 'ether'),
                amountNumber: parseFloat(web3.utils.fromWei(bid.amount, 'ether')), // Add numeric value for comparison
                timestamp: new Date(parseInt(bid.timestamp) * 1000).toLocaleString()
            }));
            
            // Sort bids by numeric amount (highest first)
            formattedBids.sort((a, b) => b.amountNumber - a.amountNumber);
            
            console.log(`Fetched ${formattedBids.length} bids for crop ${cropId}`, formattedBids);
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
                        value={activeTab} 
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

                {activeTab === 0 && (
                    <>
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h4" component="h1" gutterBottom>
                                Available Crops
                            </Typography>
                            <TextField
                                placeholder="Search crops..."
                                variant="outlined"
                                size="small"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {loadingImages[crop.id] && (
                                                        <Skeleton 
                                                            variant="rectangular" 
                                                            animation="wave"
                                                            width="100%" 
                                                            height="100%" 
                                                            sx={{ position: 'absolute', top: 0, left: 0 }}
                                                        />
                                                    )}
                                                    <img
                                                        src={getCropImageUrl(crop)}
                                                        alt={crop.cropName}
                                                        data-cid={crop.imageCID}
                                                        onError={(e) => handleImageError(e, crop.id, crop.imageCID)}
                                                        onLoad={() => handleImageLoad(crop.id)}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            objectPosition: 'center',
                                                            transition: 'opacity 0.3s ease',
                                                            opacity: loadingImages[crop.id] ? 0 : 1
                                                        }}
                                                    />
                                                </Box>
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

                {activeTab === 1 && (
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

                {activeTab === 2 && (
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
                                            onClick={() => setActiveTab(0)}
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
                open={openDialog} 
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
                            <Grid item xs={12}>
                                <Box 
                                    sx={{ 
                                        position: 'relative',
                                        width: '100%',
                                        maxHeight: 250,
                                        mb: 2
                                    }}
                                >
                                    {loadingImages[selectedCrop.id] && (
                                        <Skeleton 
                                            variant="rectangular" 
                                            animation="wave"
                                            width="100%" 
                                            height={250} 
                                            sx={{ borderRadius: 1 }}
                                        />
                                    )}
                                    <img
                                        src={getCropImageUrl(selectedCrop)}
                                        alt={selectedCrop.cropName}
                                        data-cid={selectedCrop.imageCID}
                                        onError={(e) => handleImageError(e, selectedCrop.id, selectedCrop.imageCID)}
                                        onLoad={() => handleImageLoad(selectedCrop.id)}
                                        style={{
                                            width: '100%',
                                            maxHeight: 250,
                                            objectFit: 'contain',
                                            borderRadius: '4px',
                                            transition: 'opacity 0.3s ease',
                                            opacity: loadingImages[selectedCrop.id] ? 0 : 1
                                        }}
                                    />
                                </Box>
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
                                          ? `Minimum bid: ${cropHighestBids[selectedCrop.id].amount} ETH (current highest bid by ${getBuyerDisplayName(cropHighestBids[selectedCrop.id].bidder)})` 
                                          : `Minimum bid: ${formatEthPrice(selectedCrop?.price)} ETH`
                                        }
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
                                            const minimumBid = selectedCrop && cropHighestBids && cropHighestBids[selectedCrop.id]
                                              ? parseFloat(cropHighestBids[selectedCrop.id].amount)
                                              : parseFloat(formatEthPrice(selectedCrop.price));
                                                
                                            if (parseFloat(bidPrice) < minimumBid) {
                                              setSnackbar({
                                                open: true,
                                                message: `Your bid must be at least ${minimumBid} ETH`,
                                                severity: 'warning'
                                              });
                                            }
                                          }
                                        }}
                                    />
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
                open={openSnackbar} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbarSeverity} 
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
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
