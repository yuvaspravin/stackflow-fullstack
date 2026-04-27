import React from "react";

const Button = ({ children, onClick, variant = "primary", className = "" }) => {
  const baseStyle =
    "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    outline: "border border-slate-200 text-slate-700 hover:bg-slate-50",
    dangerOutline: "border border-red-200 text-red-600 hover:bg-red-50",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default React.memo(Button);
