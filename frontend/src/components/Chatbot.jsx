import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Typography, TextField, Paper, Avatar, Fab, useTheme } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';
import ChatbotLogo from './ChatbotLogo';

// Farm Assure platform-specific FAQs
const faqData = [
  {
    question: "How do I create an account?",
    answer: "To create an account on Farm Assure, connect your wallet by clicking the 'Connect Wallet' button on the login page. Then select your role as either a Farmer or Buyer and register. Your blockchain wallet serves as your account identity."
  },
  {
    question: "What is Farm Assure?",
    answer: "Farm Assure is a blockchain-powered agricultural marketplace that connects farmers directly with buyers, ensuring transparency, fair prices, and secure transactions through smart contracts."
  },
  {
    question: "How do I sell crops as a farmer?",
    answer: "After registering as a farmer, you can list your crops by clicking the 'Add New Crop' button on your dashboard. Fill in details like crop name, quantity, price, description, and upload an image. Your listing will appear in the marketplace for buyers to purchase."
  },
  {
    question: "How do I buy crops?",
    answer: "As a registered buyer, you can browse available crops on your dashboard. When you find a crop you want to purchase, click on it and select 'Buy' or 'Place Bid'. You can then specify the quantity and complete the purchase using your connected wallet."
  },
  {
    question: "How does the bidding system work?",
    answer: "Buyers can place custom bids on crops within the bidding window (crops that were recently added). Farmers can view and accept bids from their dashboard. Once a bid is accepted, the buyer can complete the purchase at their offered price."
  },
  {
    question: "How are deliveries confirmed?",
    answer: "When a farmer delivers the crops, they mark the order as 'Delivered' in their dashboard. The buyer then confirms receipt by clicking 'Confirm Delivery' in their orders section. This releases the payment to the farmer through the smart contract."
  },
  {
    question: "What payment methods are accepted?",
    answer: "Farm Assure operates on blockchain technology, so payments are made using cryptocurrency (ETH) through your connected wallet. The platform ensures secure and transparent transactions."
  },
  {
    question: "How do I track my orders?",
    answer: "Both farmers and buyers can track orders through their respective dashboards. Buyers can view their purchase history in the 'My Orders' tab, while farmers can manage incoming orders in the 'Orders' section."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, Farm Assure uses blockchain technology to secure transactions and data. Your personal information is protected, while transaction details are recorded on the blockchain for transparency and security."
  },
  {
    question: "Can I cancel an order?",
    answer: "Buyers can cancel purchase requests that haven't been accepted yet. Once a purchase is confirmed and payment is made, the transaction is recorded on the blockchain and cannot be reversed automatically."
  }
];

// Detailed website information about Farm Assure
const websiteInfo = {
  about: "Farm Assure is a blockchain-powered agricultural marketplace that connects farmers directly with buyers. Our platform eliminates middlemen, ensures fair prices for agricultural products, and provides transparency through blockchain technology.",
  mission: "Our mission is to empower farmers with direct market access while enabling buyers to purchase quality agricultural products with confidence. We aim to revolutionize agricultural commerce through blockchain technology.",
  features: "Farm Assure offers secure cryptocurrency payments, transparent pricing, direct farmer-buyer communication, bidding system for price negotiation, and blockchain-verified transactions.",
  technology: "Our platform uses blockchain technology through Ethereum smart contracts to ensure transparent, secure, and tamper-proof transactions between farmers and buyers."
};

// Farm Assure platform functions
const websiteFunctionsData = [
  {
    function: "Wallet Connection",
    help: "Connect your cryptocurrency wallet by clicking the 'Connect Wallet' button on the login page. We support Ethereum-compatible wallets like MetaMask."
  },
  {
    function: "Registration",
    help: "After connecting your wallet, select your role (Farmer or Buyer) and register. This creates your profile on the blockchain."
  },
  {
    function: "Farmer Dashboard",
    help: "Farmers can add crop listings, view and respond to purchase requests, track orders, and confirm deliveries from their dashboard."
  },
  {
    function: "Buyer Dashboard",
    help: "Buyers can browse available crops, place bids, make purchases, view order history, and confirm deliveries when received."
  },
  {
    function: "Adding Crops",
    help: "Farmers can list new crops by clicking 'Add New Crop', entering details like name, quantity, price, and uploading an image."
  },
  {
    function: "Bidding System",
    help: "Buyers can place custom bids on eligible crops. Farmers can view and accept bids from their dashboard."
  },
  {
    function: "Purchase Process",
    help: "To buy crops, select the desired item, specify quantity, and click 'Buy'. You'll need to confirm the transaction in your wallet."
  },
  {
    function: "Order Tracking",
    help: "Track your orders in the 'My Orders' section of your dashboard. You can see order status including pending, accepted, paid, delivered, and completed stages."
  },
  {
    function: "Delivery Confirmation",
    help: "Farmers mark orders as delivered when shipped. Buyers confirm receipt by clicking 'Confirm Delivery', which releases payment to the farmer."
  },
  {
    function: "Profile Management",
    help: "Access your profile by clicking the profile icon. You can update your information and manage account settings."
  }
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hi there! I'm your Farm Assure assistant. How can I help you today? You can ask me about our platform, features, or how to buy and sell agricultural products.", 
      sender: 'bot' 
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user'
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    
    // Process query and generate response
    setTimeout(() => {
      const response = generateResponse(input);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: response,
        sender: 'bot'
      }]);
    }, 600);
  };

  const generateResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Check FAQs first - using more flexible matching
    for (const faq of faqData) {
      const questionWords = faq.question.toLowerCase().split(' ');
      const queryWords = lowerQuery.split(' ');
      
      // Check if key words from the question appear in the query
      const keyWordsMatch = questionWords.some(word => 
        word.length > 3 && queryWords.includes(word)
      );
      
      // Check if the query contains substantial parts of the question
      const questionContains = queryWords.filter(word => 
        word.length > 3 && faq.question.toLowerCase().includes(word)
      ).length >= 2;
      
      if (keyWordsMatch || questionContains || 
          lowerQuery.includes(faq.question.toLowerCase().substring(0, 10))) {
        return faq.answer;
      }
    }
    
    // Check website functions - more flexible matching
    for (const func of websiteFunctionsData) {
      if (lowerQuery.includes(func.function.toLowerCase()) || 
          (func.function.toLowerCase() === "wallet connection" && 
           (lowerQuery.includes("connect") && lowerQuery.includes("wallet")))) {
        return func.help;
      }
    }
    
    // Check for website info inquiries
    if (lowerQuery.includes("about") || 
        lowerQuery.includes("what is farm assure") || 
        lowerQuery.includes("what is this platform") || 
        lowerQuery.includes("tell me about")) {
      return websiteInfo.about;
    }
    
    if (lowerQuery.includes("mission") || 
        lowerQuery.includes("purpose") || 
        lowerQuery.includes("goal") || 
        lowerQuery.includes("aim")) {
      return websiteInfo.mission;
    }
    
    if (lowerQuery.includes("features") || 
        lowerQuery.includes("what can i do") || 
        lowerQuery.includes("functionality") || 
        lowerQuery.includes("capabilities")) {
      return websiteInfo.features;
    }
    
    if (lowerQuery.includes("technology") || 
        lowerQuery.includes("blockchain") || 
        lowerQuery.includes("how does it work") || 
        lowerQuery.includes("tech")) {
      return websiteInfo.technology;
    }
    
    // Specific platform functionality queries
    if (lowerQuery.includes("farmer") && lowerQuery.includes("sell")) {
      return "As a farmer on Farm Assure, you can list your agricultural products by clicking the 'Add New Crop' button on your dashboard. Fill in details like crop name, quantity, price, and upload an image. Buyers can then browse and purchase your products directly, with payments secured by blockchain technology.";
    }
    
    if (lowerQuery.includes("buy") || lowerQuery.includes("purchase")) {
      return "To buy agricultural products on Farm Assure, browse the available listings on your buyer dashboard. When you find a product you want, click on it and select 'Buy' or 'Place Bid'. You can specify the quantity and complete the purchase using your connected cryptocurrency wallet.";
    }
    
    if (lowerQuery.includes("bid") || lowerQuery.includes("offer")) {
      return "Farm Assure features a bidding system where buyers can place custom bids on eligible crops. Farmers can review bids and accept the most favorable ones. This allows for price negotiation while maintaining transparency through the blockchain.";
    }
    
    if (lowerQuery.includes("payment") || lowerQuery.includes("pay")) {
      return "Farm Assure uses cryptocurrency (ETH) for payments. When you make a purchase, you'll confirm the transaction through your connected wallet. Payments are held in escrow by the smart contract until delivery is confirmed, ensuring security for both parties.";
    }
    
    if (lowerQuery.includes("delivery") || lowerQuery.includes("receive")) {
      return "After a purchase is made, the farmer will arrange delivery of the products. Once delivered, the farmer marks the order as 'Delivered' in their dashboard. The buyer then confirms receipt by clicking 'Confirm Delivery', which releases the payment to the farmer through the smart contract.";
    }
    
    if (lowerQuery.includes("wallet") || lowerQuery.includes("metamask") || lowerQuery.includes("connect")) {
      return "To use Farm Assure, you need an Ethereum-compatible wallet like MetaMask. Click 'Connect Wallet' on the login page to connect your wallet, then select your role (Farmer or Buyer) to register. Your wallet address serves as your unique identity on the platform.";
    }
    
    if (lowerQuery.includes("profile") || lowerQuery.includes("account")) {
      return "Your Farm Assure profile is tied to your blockchain wallet address. You can view and manage your profile by clicking the profile icon. Your transaction history, listings (for farmers), and purchases (for buyers) are securely recorded on the blockchain.";
    }
    
    // New login helper
    if (lowerQuery.includes("login") || lowerQuery.includes("sign in") || (lowerQuery.includes("how") && lowerQuery.includes("login")) || (lowerQuery.includes("how") && lowerQuery.includes("sign in"))) {
      return "To login to Farm Assure, you need to install MetaWallet:\n\n" + 
             "1. Download the MetaWallet extension from the official website or Chrome Web Store.\n\n" +
             "2. Open the Extension by clicking on the MetaWallet icon in your browser toolbar.\n\n" +
             "3. Create a new wallet or import an existing one with your seed phrase.\n\n" +
             "4. Visit our website, click 'Connect Wallet' and select MetaWallet.\n\n" +
             "5. Approve the connection in your wallet when prompted.\n\n" +
             "Once connected, you'll be automatically logged in to access all Farm Assure features.";
    }
    
    if (lowerQuery.includes("crops") || lowerQuery.includes("products")) {
      return "Farmers can list various agricultural products on Farm Assure, including fruits, vegetables, grains, and more. Each listing includes details like name, quantity, price, description, and images. Buyers can browse these listings and make purchases directly from farmers.";
    }
    
    if (lowerQuery.includes("smart contract") || lowerQuery.includes("blockchain")) {
      return "Farm Assure uses Ethereum smart contracts to facilitate secure and transparent transactions between farmers and buyers. The smart contract handles payment escrow, ensures proper delivery confirmation, and maintains a tamper-proof record of all transactions.";
    }

    if (lowerQuery.includes("windows") || lowerQuery.includes("install") || lowerQuery.includes("setup")) {
      return "To use Farm Assure on Windows, you'll need to: 1) Install MetaMask extension on your Chrome or Firefox browser, 2) Create or import a wallet in MetaMask, 3) Fund your wallet with some ETH for transactions, and 4) Connect your wallet to Farm Assure by clicking 'Connect Wallet' on our login page.";
    }
    
    // Common greeting queries
    if (lowerQuery.includes("hello") || lowerQuery.includes("hi") || lowerQuery.includes("hey")) {
      return "Hello! Welcome to Farm Assure, your blockchain-powered agricultural marketplace. How can I assist you today? You can ask about buying/selling crops, connecting your wallet, or how our platform works.";
    }
    
    if (lowerQuery.includes("thank")) {
      return "You're welcome! I'm glad I could help. If you have any other questions about Farm Assure, feel free to ask. Happy farming and trading!";
    }
    
    if (lowerQuery.includes("help") || lowerQuery.includes("assist")) {
      return "I can help you understand how Farm Assure works, including how to connect your wallet, register as a farmer or buyer, list crops, make purchases, place bids, confirm deliveries, and more. What specific aspect would you like to know about?";
    }
    
    // Default response showing understanding
    return "I understand you're asking about " + query + ". While I don't have specific information on that exact query, Farm Assure is a blockchain-based platform connecting farmers directly with buyers. Would you like to know more about how to buy/sell crops, connect your wallet, or use specific features like bidding or delivery confirmation?";
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 260, damping: 20 }}
          >
            <Paper 
              elevation={4}
              sx={{
                position: 'absolute',
                bottom: 70,
                right: 0,
                width: 320,
                height: 450,
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}
            >
              {/* Chat Header */}
              <Box sx={{ 
                p: 2, 
                bgcolor: 'primary.main', 
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ChatbotLogo size={28} color="white" />
                  <Typography variant="h6" sx={{ ml: 1 }}>Farm Assure Help</Typography>
                </Box>
                <IconButton size="small" onClick={toggleChat} sx={{ color: 'white' }}>
                  <CloseIcon />
                </IconButton>
              </Box>
              
              {/* Chat Messages */}
              <Box sx={{ 
                p: 2, 
                flexGrow: 1, 
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                bgcolor: isDarkMode ? 'background.paper' : '#ffffff'
              }}>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 % 0.5 }}
                  >
                    <Box 
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                        mb: 1
                      }}
                    >
                      {message.sender === 'bot' && (
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, mr: 1 }}>
                          <ChatbotLogo size={18} color="white" />
                        </Avatar>
                      )}
                      <Paper
                        elevation={1}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          maxWidth: '75%',
                          bgcolor: message.sender === 'user' ? 'primary.main' : isDarkMode ? 'grey.800' : 'white',
                          color: message.sender === 'user' ? 'white' : isDarkMode ? 'grey.100' : 'text.primary',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}
                      >
                        <Typography variant="body2">{message.text}</Typography>
                      </Paper>
                      <div ref={messagesEndRef} />
                    </Box>
                  </motion.div>
                ))}
              </Box>
              
              {/* Chat Input */}
              <Box sx={{ 
                p: 2, 
                borderTop: '1px solid', 
                borderColor: 'divider',
                bgcolor: isDarkMode ? 'background.paper' : 'white'
              }}>
                <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Ask a question..."
                      value={input}
                      onChange={handleInputChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: isDarkMode ? 'background.paper' : '#ffffff',
                          color: isDarkMode ? 'white' : 'text.primary'
                        }
                      }}
                    />
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <IconButton type="submit" color="primary">
                        <SendIcon />
                      </IconButton>
                    </motion.div>
                  </Box>
                </form>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Chat Button */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Fab
          color="primary"
          onClick={toggleChat}
          sx={{ 
            boxShadow: 3,
            transition: 'transform 0.2s'
          }}
        >
          <ChatbotLogo size={24} color="white" />
        </Fab>
      </motion.div>
    </Box>
  );
};

export default Chatbot; 