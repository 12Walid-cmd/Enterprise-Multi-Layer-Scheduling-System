import React, { useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AppRoutes from "./routes/AppRoutes";
import { ToastProvider } from "./context/ToastContext";


function AppContent() {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  return (
    <ToastProvider>
      {isLogin ? <AppRoutes /> : <Layout><AppRoutes /></Layout>}
    </ToastProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;