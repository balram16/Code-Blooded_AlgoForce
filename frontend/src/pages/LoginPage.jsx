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
import { AccountBalanceWallet, Agriculture, ShoppingCart } from '@mui/icons-material';
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../components/theme-provider";
import { ThemeToggle } from "../components/theme-toggle";

const CONTRACT_ADDRESS = "0x8805E08E5e795F02A60505a41af0b13FE996B216";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren", 
      staggerChildren: 0.1,
      duration: 0.3
    }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const buttonVariants = {
  hover: { 
    scale: 1.03,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.16, 1, 0.3, 1]  // nice deceleration curve
    }
  }
};

const errorVariants = {
  hidden: { opacity: 0, height: 0, marginBottom: 0 },
  visible: { 
    opacity: 1, 
    height: "auto", 
    marginBottom: "1rem",
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    height: 0, 
    marginBottom: 0,
    transition: { duration: 0.2 }
  }
};

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
  const { theme } = useTheme();

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
      background: theme === 'dark' 
        ? '#09090b' 
        : '#ffffff',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          backgroundColor: 'transparent', 
          borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
          boxShadow: 'none'
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: '500', 
              color: theme === 'dark' ? '#ffffff' : '#000000',
              letterSpacing: '-0.01em'
            }}
          >
            Farm Assure
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ThemeToggle />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 8 }, mb: 4, px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <Box sx={{ pr: { md: 4 }, mb: { xs: 4, md: 0 } }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  <Typography 
                    variant="h2" 
                    component="h1" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: '600',
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                      color: theme === 'dark' ? '#ffffff' : '#000000',
                      mb: 3
                    }}
                  >
                  Blockchain-Powered Agriculture Marketplace
                </Typography>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: '1.125rem',
                      color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                      lineHeight: 1.5,
                      mb: 4
                    }}
                  >
                    Connect farmers directly with buyers, ensuring transparency, fair prices, and secure transactions through blockchain technology.
                </Typography>
                </motion.div>
              </Box>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  borderRadius: '12px', 
                  backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'white',
                  border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                  boxShadow: theme === 'dark' 
                    ? '0 4px 20px rgba(0,0,0,0.25)'
                    : '0 4px 20px rgba(0,0,0,0.05)',
                  overflow: 'hidden'
                }}
              >
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    gutterBottom 
                    align="center" 
                    sx={{ 
                      fontWeight: '600',
                      color: theme === 'dark' ? '#ffffff' : '#000000',
                      mb: 3,
                      fontSize: '1.5rem',
                      letterSpacing: '-0.01em'
                    }}
                  >
                {account ? "Welcome to Farm Assure" : "Connect Your Wallet"}
              </Typography>
                </motion.div>
              
                <AnimatePresence>
              {error && (
                    <motion.div
                      variants={errorVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <Box 
                        sx={{ 
                          mb: 3, 
                          p: 2, 
                          borderRadius: '8px', 
                          backgroundColor: theme === 'dark' ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)',
                          border: '1px solid rgba(239,68,68,0.2)'
                        }}
                      >
                        <Typography 
                          sx={{ 
                            color: theme === 'dark' ? 'rgb(248,113,113)' : 'rgb(220,38,38)',
                            fontSize: '0.875rem'
                          }}
                        >
                  {error}
                </Typography>
                      </Box>
                    </motion.div>
              )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
      {!account ? (
                    <motion.div
                      key="wallet-connect"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <motion.div
                          variants={itemVariants}
                        >
                          <motion.div
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                  <Button 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    startIcon={<AccountBalanceWallet />}
                    onClick={connectWallet}
                    disabled={loading}
                              sx={{ 
                                py: 1.5, 
                                px: 4, 
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 500,
                                fontSize: '1rem',
                                boxShadow: 'none',
                                '&:hover': {
                                  boxShadow: 'none',
                                  backgroundColor: theme === 'dark' ? '#4338ca' : '#0d47a1',
                                }
                              }}
                            >
                              {loading ? (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <CircularProgress size={24} color="inherit" />
                                </motion.div>
                              ) : "Connect Wallet"}
                  </Button>
                          </motion.div>
                        </motion.div>
                </Box>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="connected-account"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                <Box>
                        <motion.div variants={itemVariants}>
                          <Box 
                            sx={{ 
                              mb: 3, 
                              p: 2, 
                              borderRadius: '8px',
                              backgroundColor: theme === 'dark' ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)', 
                              border: '1px solid',
                              borderColor: theme === 'dark' ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: 'monospace', 
                                wordBreak: 'break-all',
                                color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'
                              }}
                            >
                              {account}
                  </Typography>
                          </Box>
                        </motion.div>
                  
                        <AnimatePresence mode="wait">
                  {registeredRole ? (
                            <motion.div 
                              key="registered-role"
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                            >
                              <motion.div variants={itemVariants}>
                                <Box 
                                  sx={{ 
                                    mt: 4, 
                                    textAlign: 'center',
                                    p: 3,
                                    borderRadius: '8px',
                                    backgroundColor: theme === 'dark' ? 'rgba(52,211,153,0.1)' : 'rgba(52,211,153,0.05)',
                                    border: '1px solid',
                                    borderColor: theme === 'dark' ? 'rgba(52,211,153,0.2)' : 'rgba(52,211,153,0.15)'
                                  }}
                                >
                                  <Typography sx={{ fontWeight: 500, color: theme === 'dark' ? '#10b981' : '#059669' }}>
                      You are registered as: <strong>{registeredRole === "1" ? "Farmer" : "Buyer"}</strong>
                    </Typography>
                                  <motion.div 
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                  >
                                    <Button
                                      variant="outlined"
                                      color="primary"
                                      sx={{ 
                                        mt: 2, 
                                        textTransform: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 500
                                      }}
                                      onClick={() => navigate(registeredRole === "1" ? "/farmer-dashboard" : "/buyer-dashboard")}
                                    >
                                      Go to Dashboard
                                    </Button>
                                  </motion.div>
                                </Box>
                              </motion.div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="role-selection"
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                            >
                              <motion.div variants={itemVariants}>
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    mt: 4, 
                                    mb: 2, 
                                    fontWeight: 500,
                                    color: theme === 'dark' ? '#ffffff' : '#000000',
                                    fontSize: '1.125rem'
                                  }}
                                >
                        Select your role:
                      </Typography>
                              </motion.div>
                      
                              <motion.div variants={itemVariants}>
                                <FormControl component="fieldset" sx={{ width: '100%' }}>
                        <RadioGroup
                                    aria-label="role"
                                    name="role"
                          value={role}
                                    onChange={(e) => setRole(Number(e.target.value))}
                                    sx={{ gap: 2 }}
                                  >
                                    <motion.div 
                                      variants={buttonVariants}
                                      whileHover="hover"
                                      whileTap="tap"
                                    >
                                      <FormControlLabel
                                        value={1}
                                        control={
                                          <Radio 
                                            sx={{ 
                                              color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)',
                                              '&.Mui-checked': {
                                                color: theme === 'dark' ? '#818cf8' : '#3b82f6',
                                              }
                                            }} 
                                          />
                                        }
                                        label={
                                          <Box 
                                            sx={{ 
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 1.5
                                            }}
                                          >
                                            <Agriculture sx={{ color: theme === 'dark' ? '#818cf8' : '#3b82f6' }} />
                                            <Typography sx={{ fontWeight: 500 }}>Farmer</Typography>
                                          </Box>
                                        }
                                sx={{ 
                                          width: '100%',
                                          mr: 0,
                                          p: 1.5,
                                          border: '1px solid',
                                          borderColor: role === 1 
                                            ? (theme === 'dark' ? 'rgba(129,140,248,0.5)' : 'rgba(59,130,246,0.5)')
                                            : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                                          borderRadius: '8px',
                                          backgroundColor: role === 1
                                            ? (theme === 'dark' ? 'rgba(129,140,248,0.05)' : 'rgba(59,130,246,0.05)')
                                            : 'transparent',
                                          transition: 'all 0.2s ease'
                                        }}
                                      />
                                    </motion.div>
                                    <motion.div 
                                      variants={buttonVariants}
                                      whileHover="hover"
                                      whileTap="tap"
                                    >
                                  <FormControlLabel
                                        value={2}
                                        control={
                                          <Radio 
                                            sx={{ 
                                              color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)',
                                              '&.Mui-checked': {
                                                color: theme === 'dark' ? '#818cf8' : '#3b82f6',
                                              }
                                            }} 
                                          />
                                        }
                                        label={
                                          <Box 
                                sx={{ 
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 1.5
                                            }}
                                          >
                                            <ShoppingCart sx={{ color: theme === 'dark' ? '#818cf8' : '#3b82f6' }} />
                                            <Typography sx={{ fontWeight: 500 }}>Buyer</Typography>
                                          </Box>
                                        }
                                        sx={{ 
                                          width: '100%',
                                          mr: 0,
                                          p: 1.5,
                                          border: '1px solid',
                                          borderColor: role === 2
                                            ? (theme === 'dark' ? 'rgba(129,140,248,0.5)' : 'rgba(59,130,246,0.5)')
                                            : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                                          borderRadius: '8px',
                                          backgroundColor: role === 2
                                            ? (theme === 'dark' ? 'rgba(129,140,248,0.05)' : 'rgba(59,130,246,0.05)')
                                            : 'transparent',
                                          transition: 'all 0.2s ease'
                                        }}
                                      />
                                    </motion.div>
                        </RadioGroup>
                      </FormControl>
                              </motion.div>
                              
                              <motion.div variants={itemVariants}>
                                <Box sx={{ mt: 4, textAlign: 'center' }}>
                                  <motion.div
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                  >
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={registerRole}
                        disabled={role === null || loading}
                                      sx={{ 
                                        py: 1.5, 
                                        px: 4, 
                                        textTransform: 'none',
                                        boxShadow: 'none',
                                        fontWeight: 500,
                                        fontSize: '1rem',
                                        borderRadius: '8px',
                                        '&:hover': {
                                          boxShadow: 'none',
                                          backgroundColor: theme === 'dark' ? '#4338ca' : '#0d47a1',
                                        },
                                        '&.Mui-disabled': {
                                          backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                          color: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                                        }
                                      }}
                                    >
                                      {loading ? (
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.8 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ duration: 0.2 }}
                                        >
                                          <CircularProgress size={24} color="inherit" />
                                        </motion.div>
                                      ) : "Register"}
                      </Button>
                                  </motion.div>
                                </Box>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
            </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default LoginPage;