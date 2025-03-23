import React from 'react';

const ChatbotLogo = ({ size = 24, color = 'currentColor' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <circle cx="8" cy="10" r="1.5" fill={color} />
      <circle cx="16" cy="10" r="1.5" fill={color} />
      <path 
        d="M8 15C8 15 10 17 12 17C14 17 16 15 16 15" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
      <path 
        d="M4 8L6 6" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
      <path 
        d="M20 8L18 6" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
    </svg>
  );
};

export default ChatbotLogo; 