import React from "react";

const Badge = ({ variant = "success", children }) => {
  const styles = {
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-orange-50 text-orange-700",
    critical: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

export default React.memo(Badge);
