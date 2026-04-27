import React from "react";

const Logo = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#1d4ed8", stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>

      {/* Box Base */}
      <rect
        x="15"
        y="40"
        width="70"
        height="45"
        rx="10"
        fill="url(#logoGrad)"
      />

      {/* Box Lid */}
      <path d="M15 40 L35 25 L65 25 L85 40 Z" fill="#60a5fa" opacity="0.9" />

      {/* Upward Arrow */}
      <path d="M50 12 L32 35 H68 Z" fill="white" />
      <rect x="41" y="30" width="18" height="25" fill="white" />
    </svg>
  );
};

export default Logo;
