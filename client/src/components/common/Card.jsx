import React from "react";

const Card = ({ className, children }) => {
  return (
    <div>
      <div
        className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Card;
