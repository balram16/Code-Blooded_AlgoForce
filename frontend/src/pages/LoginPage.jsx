import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import Web3Modal from "web3modal";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper, 
  FormControl, 
  RadioGroup, 
  Radio, 
  FormControlLabel,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Grid,
  CircularProgress
} from '@mui/material';
import { AccountBalanceWallet, Agriculture, ShoppingCart, Business } from '@mui/icons-material';

const CONTRACT_ADDRESS = "0xd6B17407713602eCBbC1eDCa66B2ec8Dc8aB4B06";

const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "enum FarmerPortal.UserRole", "name": "role", "type": "uint8" }
    ],
    "name": "UserRegistered",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "getUserRole",
    "outputs": [{ "internalType": "enum FarmerPortal.UserRole", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint8", "name": "role", "type": "uint8" }],
    "name": "registerUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

function LoginPage({ onLogin }) {
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState(null);
  const [registeredRole, setRegisteredRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new BrowserProvider(connection);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      fetchUserRole(address, provider);
    } catch (error) {
      console.error("Wallet connection failed:", error);
      setError("Failed to connect wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkWalletConnection = async () => {
    try {
    if (window.ethereum) {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        fetchUserRole(accounts[0], provider);
      }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };
  
  const fetchUserRole = async (userAddress, provider) => {
    try {
      setLoading(true);
      setError(null);
      const contract = new Contract(CONTRACT_ADDRESS, contractABI, provider);
      const role = await contract.getUserRole(userAddress);
      const roleString = role.toString();
      console.log("Fetched user role:", roleString);
      
      // Only set registered role if it's not "0" (unregistered)
      if (roleString !== "0") {
      setRegisteredRole(roleString); 

        // Pass account and role to parent component
        if (onLogin) {
          onLogin(userAddress, roleString);
        }
 
      if (roleString === "1") {
          navigate("/farmer-dashboard"); 
      } else if (roleString === "2") {
          navigate("/buyer-dashboard"); 
      } else if (roleString === "3") {
          navigate("/broker-dashboard");
        }
      } else {
        console.log("User is not registered yet");
        setRegisteredRole(null);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      setError("Error fetching user role. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const registerRole = async () => {
    if (!account || role === null) return;
    try {
      setLoading(true);
      setError(null);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, contractABI, signer);

      console.log("Registering role:", role);
      const tx = await contract.registerUser(role);
      console.log("Transaction sent:", tx);
      await tx.wait();
      console.log("Transaction confirmed");

      // Pass account and role to parent component
      if (onLogin) {
        onLogin(account, role.toString());
      }

      setRegisteredRole(role.toString());
      
      if (role === 1) {
        navigate("/farmer-dashboard");
      } else if (role === 2) {
        navigate("/buyer-dashboard");
      } else if (role === 3) {
        navigate("/broker-dashboard");
      }
    } catch (error) {
      console.error("Error registering role:", error);
      setError("Error registering role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a237e 0%, #4caf50 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'white' }}>
            Farm Assure
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ color: 'white', pr: { md: 4 }, mb: { xs: 4, md: 0 } }}>
              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                Blockchain-Powered Agriculture Marketplace
              </Typography>
              <Typography variant="h6" paragraph>
                Connect farmers directly with buyers, ensuring transparency, fair prices, and secure transactions.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom align="center" fontWeight="bold">
                {account ? "Welcome to Farm Assure" : "Connect Your Wallet"}
              </Typography>
              
              {error && (
                <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
                  {error}
                </Typography>
              )}

      {!account ? (
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    startIcon={<AccountBalanceWallet />}
                    onClick={connectWallet}
                    disabled={loading}
                    sx={{ py: 1.5, px: 4 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Connect Wallet"}
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2, wordBreak: 'break-all' }}>
                    Connected: {account}
                  </Typography>
                  
                  {registeredRole ? (
                    <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
                      You are registered as: <strong>
                        {registeredRole === "1" ? "Farmer" : 
                         registeredRole === "2" ? "Buyer" : 
                         registeredRole === "3" ? "Broker" : "Unknown"}
                      </strong>
                    </Typography>
                  ) : (
                    <>
                      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                        Select your role:
                      </Typography>
                      
                      <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                        <RadioGroup
                          value={role}
                          onChange={(e) => setRole(parseInt(e.target.value))}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <Card 
                                variant={role === 1 ? "outlined" : "elevation"} 
                                sx={{ 
                                  cursor: 'pointer',
                                  border: role === 1 ? '2px solid #4caf50' : 'none',
                                  transition: 'all 0.3s ease'
                                }}
                                onClick={() => setRole(1)}
                              >
                                <CardContent sx={{ textAlign: 'center' }}>
                                  <Agriculture fontSize="large" color="primary" />
                                  <FormControlLabel
                                    value="1"
                                    control={<Radio />}
                                    label="Farmer"
                                    sx={{ mt: 1 }}
                                  />
                                </CardContent>
                              </Card>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Card 
                                variant={role === 2 ? "outlined" : "elevation"} 
                                sx={{ 
                                  cursor: 'pointer',
                                  border: role === 2 ? '2px solid #4caf50' : 'none',
                                  transition: 'all 0.3s ease'
                                }}
                                onClick={() => setRole(2)}
                              >
                                <CardContent sx={{ textAlign: 'center' }}>
                                  <ShoppingCart fontSize="large" color="primary" />
                                  <FormControlLabel
                                    value="2"
                                    control={<Radio />}
                                    label="Buyer"
                                    sx={{ mt: 1 }}
                                  />
                                </CardContent>
                              </Card>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Card 
                                variant={role === 3 ? "outlined" : "elevation"} 
                                sx={{ 
                                  cursor: 'pointer',
                                  border: role === 3 ? '2px solid #4caf50' : 'none',
                                  transition: 'all 0.3s ease'
                                }}
                                onClick={() => setRole(3)}
                              >
                                <CardContent sx={{ textAlign: 'center' }}>
                                  <Business fontSize="large" color="primary" />
                                  <FormControlLabel
                                    value="3"
                                    control={<Radio />}
                                    label="Broker"
                                    sx={{ mt: 1 }}
                                  />
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>
                        </RadioGroup>
                      </FormControl>
                      
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        onClick={registerRole}
                        disabled={role === null || loading}
                        sx={{ py: 1.5 }}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Register Role"}
                      </Button>
                    </>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default LoginPage;
