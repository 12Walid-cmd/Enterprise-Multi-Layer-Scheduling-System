import React, { useState } from "react";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Mock login:", email, password);
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
                onClick={() => alert("Forgot password clicked!")}
                >
                Forgot password?
                </button>
        </div>

            <button type="submit" className="login-button">
              Sign In
            </button>

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