// src/App.jsx
import React from "react";
import AppRouter from "./routes/AppRouter";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div>
      <AppRouter />;
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
