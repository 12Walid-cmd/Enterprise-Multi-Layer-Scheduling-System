
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "../styles/login.css";


function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showTempPwd, setShowTempPwd] = useState(false);
  const [tempPwd, setTempPwd] = useState("");
  const [loginError, setLoginError] = useState("");

  // Request a temp password and show popup
  const handleGetTempPassword = async () => {
    if (!email) {
      setLoginError("Please enter your email to reset password.");
      return;
    }
    try {
      const res = await api.post("/login/reset", { email });
      setTempPwd(res.data.tempPassword);
      setShowTempPwd(true);
      setLoginError("");
    } catch (err) {
      setLoginError("Failed to reset password.");
    }
  };

  // Login: if no password, request temp password and show popup; else, validate
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!email) {
      setLoginError("Please enter your email.");
      return;
    }
    if (!password) {
      // Request temp password for first-time login
      try {
        const res = await api.post("/login", { email });
        setTempPwd(res.data.tempPassword);
        setShowTempPwd(true);
      } catch (err) {
        setLoginError("Failed to get temporary password.");
      }
      return;
    }
    // Validate login
    try {
      const res = await api.post("/login/validate", { email, password });
      // Store JWT and refresh token in localStorage (for demo)
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("email", email);
      // Fetch user info (first/last name) after login
      try {
        const userRes = await api.get(`/members?search=${encodeURIComponent(email)}&limit=1`);
        const user = userRes.data.data && userRes.data.data[0];
        if (user) {
          localStorage.setItem("firstName", user.first_name || "");
          localStorage.setItem("lastName", user.last_name || "");
        }
      } catch (e) {
        // fallback: clear names if not found
        localStorage.setItem("firstName", "");
        localStorage.setItem("lastName", "");
      }
      alert("Login successful!");
      navigate("/");
    } catch (err) {
      setLoginError("Invalid email or password.");
    }
  };


  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* Left Side */}
        <div className="login-panel">
          <h2 className="login-title">Enterprise Scheduling</h2>
          <p className="login-subtitle">
            Sign in to access your scheduling dashboard
          </p>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="login-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="login-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Forgot Password */}
            <div className="mb-4" style={{ textAlign: "right" }}>
              <button
                type="button"
                className="forgot-password"
                onClick={handleGetTempPassword}
              >
                Forgot password?
              </button>
            </div>

            {loginError && (
              <div style={{ color: "red", marginBottom: 10 }}>{loginError}</div>
            )}

            <button type="submit" className="login-button">
              Sign In
            </button>
          </form>
        </div>

        {/* Right Side */}
        <div className="info-panel">
          <h3 className="fw-bold mb-3">Optimize Team Scheduling</h3>
          <div className="feature-item">🔄 Automated Rotations</div>
          <div className="feature-item">👥 Multi-Layer Teams</div>
          <div className="feature-item">🏖️ Leave Management</div>
          <div className="feature-item">📊 Conflict Detection</div>
        </div>
      </div>

      {/* Popup for temp password */}
      {showTempPwd && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{ background: "#fff", padding: 30, borderRadius: 8, minWidth: 320, textAlign: "center" }}>
            <h4>Temporary Password</h4>
            <p style={{ wordBreak: "break-all", fontWeight: "bold", fontSize: 18 }}>{tempPwd}</p>
            <button
              style={{ margin: "10px 0", padding: "6px 16px", borderRadius: 4, cursor: "pointer" }}
              onClick={() => {
                navigator.clipboard.writeText(tempPwd);
              }}
            >
              Copy Password
            </button>
            <div>
              <button
                style={{ marginTop: 10, padding: "6px 16px", borderRadius: 4, cursor: "pointer" }}
                onClick={() => setShowTempPwd(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;