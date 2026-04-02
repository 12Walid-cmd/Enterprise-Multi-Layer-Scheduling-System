
import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AppRoutes from "./routes/AppRoutes";
import { ToastProvider } from "./context/ToastContext";


function App() {
  useEffect(() => {
    // Always clear auth data on app load
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("email");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
  }, []);
  return (
    <BrowserRouter>
      <ToastProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;