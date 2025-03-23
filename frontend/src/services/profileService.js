import { uploadImageToPinata, getIPFSGatewayURL } from './pinataService';
import Web3 from 'web3';

const CONTRACT_ADDRESS = "0x8805E08E5e795F02A60505a41af0b13FE996B216";

// This should match your contract ABI
const USER_PROFILE_ABI = [
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
        "type": "function"
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
    }
];

// Cache for user profiles
const profileCache = new Map();

/**
 * Get user profile from blockchain
 * @param {string} address - User's wallet address
 * @returns {Promise<Object>} - User profile data
 */
export const getUserProfile = async (address) => {
    // Check cache first
    if (profileCache.has(address)) {
        return profileCache.get(address);
    }

    try {
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(USER_PROFILE_ABI, CONTRACT_ADDRESS);
        
        const result = await contract.methods.getUserProfile(address).call();
        
        const profile = {
            address,
            name: result[0] || "",
            profileImageCID: result[1] || "",
            location: result[2] || "",
            contact: result[3] || "",
            role: parseInt(result[4])
        };
        
        // Cache the profile
        profileCache.set(address, profile);
        
        return profile;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return {
            address,
            name: "",
            profileImageCID: "",
            location: "",
            contact: "",
            role: 0
        };
    }
};

/**
 * Update user profile on blockchain
 * @param {Object} profileData - User profile data
 * @param {string} accountAddress - User's wallet address
 * @returns {Promise<boolean>} - Success status
 */
export const updateUserProfile = async (profileData, accountAddress) => {
    try {
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(USER_PROFILE_ABI, CONTRACT_ADDRESS);
        
        await contract.methods.updateUserProfile(
            profileData.name,
            profileData.profileImageCID,
            profileData.location,
            profileData.contact
        ).send({ from: accountAddress });
        
        // Update cache
        profileCache.set(accountAddress, {
            ...profileData,
            address: accountAddress
        });
        
        return true;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};

/**
 * Upload profile image to IPFS
 * @param {File} imageFile - Profile image file
 * @returns {Promise<string>} - IPFS CID of the uploaded image
 */
export const uploadProfileImage = async (imageFile) => {
    try {
        const cid = await uploadImageToPinata(imageFile);
        return cid;
    } catch (error) {
        console.error("Error uploading profile image:", error);
        throw error;
    }
};

/**
 * Get profile image URL
 * @param {string} imageCID - IPFS CID of the profile image
 * @returns {string} - URL of the profile image
 */
export const getProfileImageUrl = (imageCID) => {
    if (!imageCID) {
        return 'https://via.placeholder.com/150?text=No+Profile';
    }
    return getIPFSGatewayURL(imageCID);
};

/**
 * Get user's display name or formatted address
 * @param {string} address - User's wallet address
 * @returns {Promise<string>} - User's name or formatted address
 */
export const getUserDisplayName = async (address) => {
    try {
        const profile = await getUserProfile(address);
        if (profile && profile.name) {
            return profile.name;
        }
        // Return abbreviated address if no name is set
        return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    } catch (error) {
        console.error("Error getting user display name:", error);
        return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    }
}; 