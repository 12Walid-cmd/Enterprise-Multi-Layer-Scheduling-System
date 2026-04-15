import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "../styles/login.css";
import { useToastContext } from "../context/ToastContext";

function getLoginErrorMessage(err, fallbackMessage) {
  const responseData = err?.response?.data;
  if (!responseData) return fallbackMessage;

  const backendMessage = typeof responseData.message === "string" ? responseData.message : "";
  const lockoutUntil = responseData.lockoutUntil;

  if (lockoutUntil) {
    const lockoutDate = new Date(lockoutUntil);
    if (!Number.isNaN(lockoutDate.getTime())) {
      return `${backendMessage || "Too many failed login attempts."} Locked until ${lockoutDate.toLocaleString()}.`;
    }
  }

  return backendMessage || fallbackMessage;
}

function Login() {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showTempPwd, setShowTempPwd] = useState(false);
  const [tempPwd, setTempPwd] = useState("");
  const [loginError, setLoginError] = useState("");
  // Change password modal state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  // Store login data while forcing password change
  const [pendingLoginData, setPendingLoginData] = useState(null);

  // Forgot password — must contact administrator
  const handleForgotPassword = () => {
    setLoginError("Please contact your administrator to reset your password.");
  };

  // Complete login: store tokens, fetch user info, navigate
  const completeLogin = async (token, refreshToken, loginIdentifier) => {
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("identifier", loginIdentifier);
    try {
      const userRes = await api.get(`/members?search=${encodeURIComponent(loginIdentifier)}&limit=1`);
      const user = userRes.data.data && userRes.data.data[0];
      if (user) {
        localStorage.setItem("firstName", user.first_name || "");
        localStorage.setItem("lastName", user.last_name || "");
        if (user.id) localStorage.setItem("userId", user.id);
        try {
          const rolesRes = await api.get(`/users/${user.id}/app-roles`);
          const roles = rolesRes.data.roles;
          const roleName = Array.isArray(roles) && roles.length > 0
            ? roles[0].name || roles[0].role_name || roles[0].code
            : "Individual";
          localStorage.setItem("role", roleName);
          window.dispatchEvent(new Event("rolechange"));
        } catch {}
      }
    } catch (e) {
      localStorage.setItem("firstName", "");
      localStorage.setItem("lastName", "");
      localStorage.removeItem("userId");
      localStorage.setItem("role", "Individual");
      window.dispatchEvent(new Event("rolechange"));
    }
    showToast("Login successful!", "success");
    navigate("/");
  };

  // Handle change password submission
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordError("");
    if (!newPassword || !confirmPassword) {
      setChangePasswordError("Please fill in both fields.");
      return;
    }
    if (newPassword.length < 8) {
      setChangePasswordError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setChangePasswordError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setChangePasswordError("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setChangePasswordError("Password must contain at least one number.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePasswordError("Passwords do not match.");
      return;
    }
    try {
      setChangingPassword(true);
      await api.post("/login/change-password", {
        identifier,
        currentPassword: password,
        newPassword,
      });
      showToast("Password changed successfully!", "success");
      setShowChangePassword(false);
      // Complete the login with the stored tokens
      if (pendingLoginData) {
        await completeLogin(pendingLoginData.token, pendingLoginData.refreshToken, identifier);
      }
    } catch (err) {
      setChangePasswordError(
        err?.response?.data?.message || "Failed to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // Login: if no password, request temp password and show popup; else, validate
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!identifier) {
      setLoginError("Please enter your username or email.");
      return;
    }
    if (!password) {
      // Request temp password for first-time login
      try {
        const res = await api.post("/login", { identifier });
        setTempPwd(res.data.tempPassword);
        setShowTempPwd(true);
        setLoginError("Temporary password generated. Paste it into Password and sign in.");
      } catch (err) {
        setLoginError(getLoginErrorMessage(err, "Failed to get temporary password."));
      }
      return;
    }
    // Validate login
    try {
      const res = await api.post("/login/validate", { identifier, password });
      if (res.data.mustChangePassword) {
        // Store tokens temporarily and prompt password change
        setPendingLoginData({ token: res.data.token, refreshToken: res.data.refreshToken });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("refreshToken", res.data.refreshToken);
        localStorage.setItem("identifier", identifier);
        setShowChangePassword(true);
        return;
      }
      await completeLogin(res.data.token, res.data.refreshToken, identifier);
    } catch (err) {
      setLoginError(getLoginErrorMessage(err, "Invalid username/email or password."));
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
              <label className="form-label">Username or Email</label>
              <input
                type="text"
                className="login-input"
                placeholder="Username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
                onClick={handleForgotPassword}
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
          <div style={{ background: "#fff", padding: 30, borderRadius: 12, minWidth: 340, maxWidth: 440, textAlign: "center", boxShadow: "0 18px 40px rgba(0,0,0,0.2)" }}>
            <h4 style={{ margin: "0 0 8px", color: "#111827" }}>Temporary Password</h4>
            <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 16px" }}>
              Copy this password and paste it into the password field to sign in.
            </p>
            <div style={{
              padding: "12px 14px",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              background: "#f9fafb",
              fontFamily: "monospace",
              fontSize: 16,
              fontWeight: 700,
              wordBreak: "break-all",
              color: "#111827",
            }}>
              {tempPwd}
            </div>
            <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 8 }}>
              <button
                style={{
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  color: "#374151",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => navigator.clipboard.writeText(tempPwd)}
              >
                Copy
              </button>
              <button
                style={{
                  border: "none",
                  background: "#e31837",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => setShowTempPwd(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal — shown when mustChangePassword is true */}
      {showChangePassword && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1100
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 12,
            width: "min(440px, 92vw)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
            overflow: "hidden",
          }}>
            <div style={{
              background: "linear-gradient(90deg, #8d0f28 0%, #e31837 100%)",
              padding: "24px 28px",
              color: "#fff",
            }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Change Your Password</h3>
              <p style={{ margin: "6px 0 0", fontSize: 14, opacity: 0.9 }}>
                You must set a new password before continuing.
              </p>
            </div>
            <form onSubmit={handleChangePassword} style={{ padding: "24px 28px" }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 6, color: "#374151" }}>
                  New Password
                </label>
                <input
                  type="password"
                  className="login-input"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 6, color: "#374151" }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="login-input"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {/* Password requirements */}
              <div style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: 14,
                fontSize: 13,
                color: "#6b7280",
              }}>
                <div style={{ fontWeight: 600, color: "#374151", marginBottom: 6, fontSize: 13 }}>Password requirements:</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ color: newPassword.length >= 8 ? "#16a34a" : "#d1d5db", fontSize: 15 }}>
                    {newPassword.length >= 8 ? "✓" : "○"}
                  </span>
                  <span style={{ color: newPassword.length >= 8 ? "#16a34a" : undefined }}>Minimum 8 characters</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ color: /[A-Z]/.test(newPassword) ? "#16a34a" : "#d1d5db", fontSize: 15 }}>
                    {/[A-Z]/.test(newPassword) ? "✓" : "○"}
                  </span>
                  <span style={{ color: /[A-Z]/.test(newPassword) ? "#16a34a" : undefined }}>At least one uppercase letter</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ color: /[a-z]/.test(newPassword) ? "#16a34a" : "#d1d5db", fontSize: 15 }}>
                    {/[a-z]/.test(newPassword) ? "✓" : "○"}
                  </span>
                  <span style={{ color: /[a-z]/.test(newPassword) ? "#16a34a" : undefined }}>At least one lowercase letter</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <span style={{ color: /[0-9]/.test(newPassword) ? "#16a34a" : "#d1d5db", fontSize: 15 }}>
                    {/[0-9]/.test(newPassword) ? "✓" : "○"}
                  </span>
                  <span style={{ color: /[0-9]/.test(newPassword) ? "#16a34a" : undefined }}>At least one number</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: newPassword && confirmPassword && newPassword === confirmPassword ? "#16a34a" : "#d1d5db", fontSize: 15 }}>
                    {newPassword && confirmPassword && newPassword === confirmPassword ? "✓" : "○"}
                  </span>
                  <span style={{ color: newPassword && confirmPassword && newPassword === confirmPassword ? "#16a34a" : undefined }}>Passwords match</span>
                </div>
              </div>
              {changePasswordError && (
                <div style={{ color: "#dc2626", fontSize: 14, marginBottom: 12 }}>{changePasswordError}</div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button
                  type="submit"
                  disabled={changingPassword}
                  style={{
                    border: "none",
                    background: changingPassword ? "#9ca3af" : "#e31837",
                    color: "#fff",
                    borderRadius: 8,
                    padding: "10px 24px",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: changingPassword ? "not-allowed" : "pointer",
                    transition: "background 0.2s",
                    width: "100%",
                  }}
                >
                  {changingPassword ? "Updating..." : "Set New Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;