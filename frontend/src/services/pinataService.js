import axios from 'axios';
import FormData from 'form-data';

// Replace these with your Pinata API keys
const PINATA_API_KEY = 'fc4208f52083639c40ba';
const PINATA_SECRET_KEY = 'e1ec94e83fd86e63ab16208364bedbb1d612f34b6042ee41f554ba34871034e3';
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1NjI5Y2EwMC0xMTEyLTRiOWQtYjY4YS02OTFjNWNmYjUwNzYiLCJlbWFpbCI6InBhbmlncmFoaWJhbHJhbTE2QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJmYzQyMDhmNTIwODM2MzljNDBiYSIsInNjb3BlZEtleVNlY3JldCI6ImUxZWM5NGU4M2ZkODZlNjNhYjE2MjA4MzY0YmVkYmIxZDYxMmYzNGI2MDQyZWU0MWY1NTRiYTM0ODcxMDM0ZTMiLCJleHAiOjE3NzM4NjYyNDB9.zxuHTQXffSubUV4Ma7eYO0atC__UBfsV7EFmil20N54';

/**
 * Upload an image file to IPFS via Pinata
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The IPFS CID of the uploaded file
 */
export const uploadImageToPinata = async (file) => {
    if (!file) {
        throw new Error('No file provided');
    }

    try {
        // Create a FormData object and append the file
        const formData = new FormData();
        formData.append('file', file);

        // Add metadata
        const metadata = JSON.stringify({
            name: file.name,
            keyvalues: {
                app: 'farm-assure',
                type: 'crop-image'
            }
        });
        formData.append('pinataMetadata', metadata);

        // Set up the options
        const options = JSON.stringify({
            cidVersion: 0
        });
        formData.append('pinataOptions', options);

        // Make the API request using JWT for authentication
        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
                maxBodyLength: 'Infinity',
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    'Authorization': `Bearer ${PINATA_JWT}`
                }
            }
        );

        // Return the IPFS hash (CID)
        return response.data.IpfsHash;
    } catch (error) {
        console.error('Error uploading to Pinata:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }
};

/**
 * Get the IPFS gateway URL for a CID
 * @param {string} cid - The IPFS CID
 * @returns {string} - The gateway URL
 */
export const getIPFSGatewayURL = (cid) => {
    if (!cid || cid === '') return 'https://via.placeholder.com/300x200?text=No+Image';
    
    // Use multiple gateways in a single string to provide browser with alternatives
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
    
    // If you need the gateway to work without authentication, uncomment one of these alternatives:
    // return `https://ipfs.io/ipfs/${cid}`;
    // return `https://cloudflare-ipfs.com/ipfs/${cid}`;
    // return `https://ipfs.infura.io/ipfs/${cid}`;
};

/**
 * Try to fetch an IPFS image via a direct authenticated request
 * This can be used as a backup method if the gateway URLs don't work
 * @param {string} cid - The IPFS CID
 * @returns {Promise<string>} - Base64 encoded image data
 */
export const fetchIPFSImageDirectly = async (cid) => {
    if (!cid) return null;
    
    // Check if we have this image in local storage cache first
    const cachedImage = localStorage.getItem(`ipfs-image-cache-${cid}`);
    if (cachedImage) {
        console.log(`Using cached image for CID ${cid}`);
        return cachedImage;
    }
    
    // Try multiple gateways to improve reliability
    const gateways = [
        {
            url: `https://gateway.pinata.cloud/ipfs/${cid}`,
            needsAuth: true
        },
        {
            url: `https://ipfs.io/ipfs/${cid}`,
            needsAuth: false
        },
        {
            url: `https://cloudflare-ipfs.com/ipfs/${cid}`,
            needsAuth: false
        },
        {
            url: `https://ipfs.infura.io/ipfs/${cid}`,
            needsAuth: false
        }
    ];
    
    // Try each gateway in order with retry logic
    for (const gateway of gateways) {
        try {
            const headers = gateway.needsAuth 
                ? { 'Authorization': `Bearer ${PINATA_JWT}` }
                : {};
            
            const response = await axios.get(gateway.url, {
                headers,
                responseType: 'arraybuffer',
                timeout: 10000 // 10 second timeout to prevent hanging requests
            });
            
            // Convert the image data to base64
            const base64 = Buffer.from(response.data, 'binary').toString('base64');
            const contentType = response.headers['content-type'] || 'image/jpeg';
            const dataUrl = `data:${contentType};base64,${base64}`;
            
            // Cache successful response in localStorage
            try {
                localStorage.setItem(`ipfs-image-cache-${cid}`, dataUrl);
            } catch (cacheError) {
                console.warn('Unable to cache image, localStorage may be full:', cacheError);
            }
            
            return dataUrl;
        } catch (error) {
            console.error(`Error fetching from ${gateway.url}:`, error);
            // Continue to next gateway on failure
        }
    }
    
    // All gateways failed
    console.error(`All gateways failed for CID ${cid}`);
    return null;
};

/**
 * Clear the image cache to force re-fetching images
 */
export const clearImageCache = () => {
    // Get all keys in localStorage
    const keys = Object.keys(localStorage);
    
    // Filter for the image cache keys
    const cacheKeys = keys.filter(key => key.startsWith('ipfs-image-cache-'));
    
    // Remove them all
    cacheKeys.forEach(key => localStorage.removeItem(key));
    
    console.log(`Cleared ${cacheKeys.length} cached images from local storage`);
    return cacheKeys.length;
}; 