import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

const API = "http://localhost:5000";
const SESSION_END_REASON_KEY = "sessionEndReason";

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${API}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Refresh failed");

  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  return data.accessToken;
}

export async function authedFetch(url, options = {}) {
  let token = localStorage.getItem("accessToken");

  const doFetch = async (t) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${t}`,
      },
    });

  let res = await doFetch(token);

  if (res.status === 401) {
    token = await refreshAccessToken();
    res = await doFetch(token);
  }

  return res;
}

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const reason = sessionStorage.getItem(SESSION_END_REASON_KEY);
    if (reason === "timeout") {
      setMsg("Your session timed out due to inactivity. Please sign in again.");
      sessionStorage.removeItem(SESSION_END_REASON_KEY);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsLoading(true);

    if (!username || !password) {
      setMsg("Please enter your username and password.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg(data.message || "Login failed.");
        setIsLoading(false);
        return;
      }

      // Store tokens and user info
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMsg("✓ Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error(err);
      setMsg("Cannot reach server. Please try again.");
      setIsLoading(false);
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
              <label className="form-label">Username</label>
              <input
                type="text"
                className="login-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
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
                disabled={isLoading}
                required
              />
            </div>

            {msg && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.875rem 1rem',
                borderRadius: '6px',
                backgroundColor: msg.includes('✓') || msg.includes('successful') ? '#d4edda' : '#f8d7da',
                border: `1px solid ${msg.includes('✓') || msg.includes('successful') ? '#c3e6cb' : '#f5c6cb'}`,
                color: msg.includes('✓') || msg.includes('successful') ? '#155724' : '#721c24',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {msg}
              </div>
            )}

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </button>

            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>
              <p>Contact your administrator if you need account assistance.</p>
            </div>

          </form>
        </div>

        {/* Right Side */}
        <div className="info-panel">
          <h3 className="fw-bold mb-3">
            Streamline Your Workforce Scheduling
          </h3>

          <div className="feature-item">
            🔄 Automated Rotations
          </div>

          <div className="feature-item">
            👥 Multi-Layer Teams
          </div>

          <div className="feature-item">
            🏖️ Leave Management
          </div>

          <div className="feature-item">
            📊 Conflict Detection
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;