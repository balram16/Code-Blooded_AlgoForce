import React from 'react';
import { motion } from 'framer-motion';
import { Button, Card, Box, Typography, useTheme } from '@mui/material';

// Animated button that scales on hover and tap
export const AnimatedButton = ({ children, ...props }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button 
        {...props}
        sx={{ 
          backgroundColor: props.variant === 'contained' && !props.color ? 
            (isDarkMode ? 'primary.main' : 'primary.main') : undefined,
          color: props.variant === 'contained' && !props.color ? 
            (isDarkMode ? 'primary.contrastText' : 'white') : undefined,
          ...props.sx 
        }}
      >
        {children}
      </Button>
    </motion.div>
  );
};

// Animated card with hover effects
export const AnimatedCard = ({ children, ...props }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <motion.div
      whileHover={{ 
        y: -5,
        boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" 
      }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card 
        {...props} 
        sx={{
          backgroundColor: isDarkMode ? 'background.paper' : '#ffffff',
          ...props.sx
        }}
      >
        {children}
      </Card>
    </motion.div>
  );
};

// Fade in animation for elements
export const FadeIn = ({ children, delay = 0, duration = 0.5, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: duration,
        delay: delay,
        ease: "easeOut" 
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Staggered list animation
export const StaggeredList = ({ children }) => {
  return (
    <>
      {React.Children.map(children, (child, i) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: i * 0.1,
            ease: "easeOut"
          }}
        >
          {child}
        </motion.div>
      ))}
    </>
  );
};

// Animated text that can be revealed character by character
export const AnimatedText = ({ text, type = "words", ...props }) => {
  const variants = {
    hidden: { opacity: 0 },
    visible: (i) => ({
      opacity: 1,
      transition: {
        delay: i * 0.1,
      },
    }),
  };

  const splitText = () => {
    if (type === "chars") {
      return text.split("").map((char, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={variants}
          initial="hidden"
          animate="visible"
          style={{ display: "inline-block" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ));
    } 
    
    // Default to words
    return text.split(" ").map((word, i) => (
      <motion.span
        key={i}
        custom={i}
        variants={variants}
        initial="hidden"
        animate="visible"
        style={{ display: "inline-block", marginRight: "0.25em" }}
      >
        {word}
      </motion.span>
    ));
  };

  return (
    <Typography {...props}>
      {splitText()}
    </Typography>
  );
};

// Container that reveals children when they come into view
export const RevealOnScroll = ({ children, threshold = 0.1 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, threshold: threshold }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

// Pulse animation (useful for notifications or highlighting elements)
export const PulseAnimation = ({ children, ...props }) => {
  return (
    <motion.div
      animate={{ 
        scale: [1, 1.05, 1],
        boxShadow: [
          "0px 0px 0px rgba(0,0,0,0.1)",
          "0px 0px 10px rgba(0,0,0,0.2)",
          "0px 0px 0px rgba(0,0,0,0.1)"
        ]
      }}
      transition={{ 
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse"
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated counter (for numbers or statistics)
export const AnimatedCounter = ({ from = 0, to, duration = 2, ...props }) => {
  return (
    <motion.div
      initial={{ count: from }}
      animate={{ count: to }}
      transition={{ duration: duration, type: "spring", stiffness: 100 }}
      {...props}
    >
      {({ count }) => <Typography {...props}>{Math.round(count)}</Typography>}
    </motion.div>
  );
};

export default {
  AnimatedButton,
  AnimatedCard,
  FadeIn,
  StaggeredList,
  AnimatedText,
  RevealOnScroll,
  PulseAnimation,
  AnimatedCounter
}; 