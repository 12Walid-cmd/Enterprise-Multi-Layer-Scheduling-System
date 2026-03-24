import React, { useState } from "react";
import axios from "axios";
import "../styles/changePassword.css";

function ChangePassword() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  const passwordChecks = {
    minLength: formData.newPassword.length >= 12,
    upperLower: /[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword),
    number: /[0-9]/.test(formData.newPassword),
    special: /[^A-Za-z0-9]/.test(formData.newPassword),
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!formData.oldPassword || !formData.newPassword || !formData.confirmNewPassword) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setIsSubmitting(true);
    try {
      let accessToken = localStorage.getItem("accessToken");

      const doChangePassword = (token) => axios.post(
        "http://localhost:5000/api/auth/change-password",
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      try {
        await doChangePassword(accessToken);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          const refreshToken = localStorage.getItem("refreshToken");
          const refreshResponse = await axios.post(
            "http://localhost:5000/api/auth/refresh",
            { refreshToken },
            { headers: { "Content-Type": "application/json" } }
          );

          accessToken = refreshResponse.data.accessToken;
          localStorage.setItem("accessToken", accessToken);
          if (refreshResponse.data.refreshToken) {
            localStorage.setItem("refreshToken", refreshResponse.data.refreshToken);
          }

          await doChangePassword(accessToken);
        } else {
          throw error;
        }
      }

      setMessage({ type: "success", text: "Password changed successfully." });
      setFormData({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (error) {
      setMessage({
        type: "error",
        text: (error.response && error.response.data && error.response.data.message) || error.message || "Failed to change password.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="change-password-page">
      <div className="change-password-card">
        <div className="change-password-header">
          <h2>Change Password</h2>
          <p className="subtitle">Update your account password securely.</p>
        </div>

        <div className="security-note">
          For security, you must provide your current password before setting a new one.
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-group">
            <label htmlFor="oldPassword">Current Password</label>
            <input
              id="oldPassword"
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="password-rules">
            <strong>Password requirements</strong>
            <ul>
              <li className={passwordChecks.minLength ? "met" : "unmet"}>
                {passwordChecks.minLength ? "✓" : "○"} Minimum 12 characters
              </li>
              <li className={passwordChecks.upperLower ? "met" : "unmet"}>
                {passwordChecks.upperLower ? "✓" : "○"} At least one uppercase and one lowercase letter
              </li>
              <li className={passwordChecks.number ? "met" : "unmet"}>
                {passwordChecks.number ? "✓" : "○"} At least one number
              </li>
              <li className={passwordChecks.special ? "met" : "unmet"}>
                {passwordChecks.special ? "✓" : "○"} At least one special character
              </li>
            </ul>
          </div>

          <div className="form-group">
            <label htmlFor="confirmNewPassword">Confirm New Password</label>
            <input
              id="confirmNewPassword"
              type="password"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
