import React, { useEffect } from "react";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import AppRoutes from "./routes/AppRoutes";

const LAST_ACTIVITY_KEY = "lastActivityAt";
const IDLE_TIMEOUT_MS = Number(process.env.REACT_APP_IDLE_TIMEOUT_MS || 30 * 60 * 1000);
const SESSION_END_REASON_KEY = "sessionEndReason";

function SessionTimeoutManager() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const now = Date.now();
    const last = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || now);
    if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    }

    const doLogout = () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      sessionStorage.setItem(SESSION_END_REASON_KEY, "timeout");
      navigate("/login", { replace: true });
    };

    if (now - last > IDLE_TIMEOUT_MS && location.pathname !== "/login") {
      doLogout();
      return;
    }

    const updateActivity = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    };

    const checkIdle = () => {
      const latest = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || Date.now());
      if (Date.now() - latest > IDLE_TIMEOUT_MS && location.pathname !== "/login") {
        doLogout();
      }
    };

    const events = ["click", "keydown", "mousemove", "scroll", "touchstart"];
    events.forEach((eventName) => window.addEventListener(eventName, updateActivity, { passive: true }));
    const intervalId = window.setInterval(checkIdle, 60 * 1000);

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, updateActivity));
      window.clearInterval(intervalId);
    };
  }, [location.pathname, navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <SessionTimeoutManager />
      <Layout>
        <AppRoutes />
      </Layout>
    </BrowserRouter>
  );
}

export default App;