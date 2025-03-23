import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeProvider from "./components/theme-provider";
import Chatbot from "./components/Chatbot";
import LoginPage from "./pages/LoginPage.jsx";
import FarmerDashboard from "./pages/FarmerDashboard.jsx"; // ✅ Import FarmerDashboard
import BuyerDashboard from "./pages/BuyerDashboard.jsx";   // ✅ Import BuyerDashboard
import ProfilePage from "./pages/ProfilePage.jsx";         // ✅ Import ProfilePage

// Animation variants for page transitions
const pageVariants = {
  initial: {
    opacity: 0,
    x: -20
  },
  in: {
    opacity: 1,
    x: 0
  },
  out: {
    opacity: 0,
    x: 20
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

// AnimatedRoutes component to handle page transitions
const AnimatedRoutes = ({ account }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <motion.div
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <LoginPage onLogin={(accountAddress, role) => {
                // This function will be passed down from the parent App component
                window.handleLogin(accountAddress, role);
              }} />
            </motion.div>
          } 
        />
        <Route 
          path="/farmer-dashboard" 
          element={
            account ? (
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <FarmerDashboard account={account} />
              </motion.div>
            ) : <Navigate to="/" />
          } 
        />
        <Route 
          path="/buyer-dashboard" 
          element={
            account ? (
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <BuyerDashboard account={account} />
              </motion.div>
            ) : <Navigate to="/" />
          } 
        />
        <Route 
          path="/profile" 
          element={
            account ? (
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <ProfilePage account={account} />
              </motion.div>
            ) : <Navigate to="/" />
          } 
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [account, setAccount] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light');

  // Create a responsive theme that changes with the mode
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#6366f1' : '#4f46e5', // Indigo shade
            light: mode === 'dark' ? '#818cf8' : '#6366f1',
            dark: mode === 'dark' ? '#4f46e5' : '#3730a3',
            contrastText: '#ffffff',
          },
          secondary: {
            main: mode === 'dark' ? '#10b981' : '#059669', // Emerald shade
            light: mode === 'dark' ? '#34d399' : '#10b981',
            dark: mode === 'dark' ? '#059669' : '#047857',
            contrastText: '#ffffff',
          },
          background: {
            default: mode === 'dark' ? '#09090b' : '#ffffff',
            paper: mode === 'dark' ? '#18181b' : '#ffffff',
          },
          text: {
            primary: mode === 'dark' ? '#ffffff' : '#09090b',
            secondary: mode === 'dark' ? '#a1a1aa' : '#71717a',
          },
          error: {
            main: mode === 'dark' ? '#ef4444' : '#dc2626', // Red shade
          },
          warning: {
            main: mode === 'dark' ? '#f59e0b' : '#d97706', // Amber shade
          },
          info: {
            main: mode === 'dark' ? '#0ea5e9' : '#0284c7', // Sky shade
          },
          success: {
            main: mode === 'dark' ? '#10b981' : '#059669', // Emerald shade
          },
          divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
        },
        typography: {
          fontFamily: '"Inter", "SF Pro Display", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
            fontSize: '3.5rem',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          },
          h2: {
            fontWeight: 700,
            fontSize: '2.75rem',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          },
          h3: {
            fontWeight: 600,
            fontSize: '2.25rem',
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
          },
          h4: {
            fontWeight: 600,
            fontSize: '1.75rem',
            lineHeight: 1.4,
            letterSpacing: '-0.01em',
          },
          h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
            lineHeight: 1.5,
            letterSpacing: '-0.01em',
          },
          h6: {
            fontWeight: 600,
            fontSize: '1rem',
            lineHeight: 1.5,
            letterSpacing: '-0.01em',
          },
          body1: {
            fontWeight: 400,
            fontSize: '1rem',
            lineHeight: 1.5,
          },
          body2: {
            fontWeight: 400,
            fontSize: '0.875rem',
            lineHeight: 1.5,
          },
          button: {
            fontWeight: 500,
            fontSize: '0.875rem',
            textTransform: 'none',
          },
          caption: {
            fontWeight: 400,
            fontSize: '0.75rem',
            lineHeight: 1.5,
          },
        },
        shape: {
          borderRadius: 10,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              },
              containedPrimary: {
                backgroundColor: mode === 'dark' ? '#6366f1' : '#4f46e5',
                '&:hover': {
                  backgroundColor: mode === 'dark' ? '#4f46e5' : '#3730a3',
                },
              },
              outlinedPrimary: {
                borderColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(79, 70, 229, 0.5)',
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                },
              },
              textPrimary: {
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: mode === 'dark' 
                  ? '0 4px 12px rgba(0,0,0,0.25)' 
                  : '0 4px 12px rgba(0,0,0,0.05)',
                border: mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                backgroundColor: mode === 'dark' ? '#18181b' : '#ffffff',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                backgroundColor: mode === 'dark' ? '#18181b' : '#ffffff',
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 8,
                  '& fieldset': {
                    borderColor: mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: mode === 'dark' ? '#6366f1' : '#4f46e5',
                  },
                },
              },
            },
          },
          MuiSelect: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 6,
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 12,
              },
            },
          },
          MuiDivider: {
            styleOverrides: {
              root: {
                borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
              },
            },
          },
          MuiTab: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 500,
              },
            },
          },
        },
      }),
    [mode],
  );

  // Function to update account and role from LoginPage
  const handleLogin = (accountAddress, role) => {
    setAccount(accountAddress);
    setUserRole(role);
  };

  // Make handleLogin available globally for child components
  window.handleLogin = handleLogin;

  // Listen for theme changes from our ThemeProvider
  const handleThemeChange = (newTheme) => {
    setMode(newTheme);
  };

  return (
    <ThemeProvider defaultTheme="light" onThemeChange={handleThemeChange}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AnimatedRoutes account={account} />
          <Chatbot />
        </Router>
      </MuiThemeProvider>
    </ThemeProvider>
  );
}

export default App;
