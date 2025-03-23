import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import LoginPage from "./pages/LoginPage";
import FarmerDashboard from "./pages/FarmerDashboard"; // ✅ Import FarmerDashboard
import BuyerDashboard from "./pages/BuyerDashboard";   // ✅ Import BuyerDashboard
import ProfilePage from "./pages/ProfilePage";         // ✅ Import ProfilePage

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e', // Deep blue
      light: '#534bae',
      dark: '#000051',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4caf50', // Green
      light: '#80e27e',
      dark: '#087f23',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  const [account, setAccount] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Function to update account and role from LoginPage
  const handleLogin = (accountAddress, role) => {
    setAccount(accountAddress);
    setUserRole(role);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
          <Route 
            path="/farmer-dashboard" 
            element={
              account ? <FarmerDashboard account={account} /> : <Navigate to="/" />
            } 
          />
          <Route 
            path="/buyer-dashboard" 
            element={
              account ? <BuyerDashboard account={account} /> : <Navigate to="/" />
            } 
          />
          <Route 
            path="/profile" 
            element={
              account ? <ProfilePage account={account} /> : <Navigate to="/" />
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
