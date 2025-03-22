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
    if (!cid) return '';
    // You can use different gateways:
    // - Pinata: https://gateway.pinata.cloud/ipfs/
    // - IPFS.io: https://ipfs.io/ipfs/
    // - Cloudflare: https://cloudflare-ipfs.com/ipfs/
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
}; 