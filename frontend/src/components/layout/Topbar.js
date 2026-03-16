import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import cgiLogo from "../../images/cgiLogo.png";

function Topbar() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    let parsedUser = null;

    try {
      parsedUser = rawUser ? JSON.parse(rawUser) : null;
    } catch {
      parsedUser = null;
    }

    setCurrentUser(parsedUser);

    const needsProfile = !parsedUser || !parsedUser.firstName || !parsedUser.lastName;
    const token = localStorage.getItem("accessToken");

    if (!needsProfile || !token) {
      return;
    }

    axios.get("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (response.data && response.data.user) {
          setCurrentUser(response.data.user);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
      })
      .catch(() => {
        // keep existing local user fallback
      });
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const displayName = useMemo(() => {
    if (!currentUser) return "User";

    const first = String(currentUser.firstName || "").trim();
    const last = String(currentUser.lastName || "").trim();
    if (first || last) {
      return [first, last].filter(Boolean).join(" ");
    }
    return currentUser.username || "User";
  }, [currentUser]);

  const initials = useMemo(() => {
    const first = String((currentUser && currentUser.firstName) || "").trim();
    const last = String((currentUser && currentUser.lastName) || "").trim();

    if (first || last) {
      const fi = first ? first.charAt(0).toUpperCase() : "";
      const li = last ? last.charAt(0).toUpperCase() : "";
      return `${fi}${li}` || "U";
    }

    return String((currentUser && currentUser.username) || "U").slice(0, 2).toUpperCase();
  }, [currentUser]);

  async function handleLogout() {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      if (accessToken) {
        await axios.post(
          "http://localhost:5000/api/auth/logout",
          { refreshToken },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }
    } catch {
      // ignore errors — still clear client-side state
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setCurrentUser(null);
      setMenuOpen(false);
      navigate("/login");
    }
  }

  return (
    <div className="topbar" style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 30px",
    }}>

      {/* Left side: Logo and title */}
      <div className="topbar-left" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img
          src={cgiLogo}
          alt="CGI Logo"
          style={{ width: "75px", height: "75px", objectFit: "contain" }}
        />
        <span className="topbar-title" style={{ fontWeight: "600", fontSize: "18px" }}>
          Enterprise Scheduling System
        </span>
      </div>

      {/* Right side: User info dropdown */}
      <div
        className="topbar-right"
        style={{ display: "flex", alignItems: "center", gap: "15px", position: "relative" }}
        ref={menuRef}
      >
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "6px 10px",
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "999px",
            cursor: "pointer"
          }}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <span className="topbar-user" style={{ fontWeight: 600 }}>{displayName}</span>
          <div className="topbar-avatar" style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "white",
            color: "#e31837",
            border: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "700"
          }}>
            {initials}
          </div>
          <span style={{ color: "#6b7280", fontSize: "14px" }}>▼</span>
        </button>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "52px",
              right: 0,
              minWidth: "200px",
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              boxShadow: "0 10px 24px rgba(0, 0, 0, 0.1)",
              padding: "6px",
              zIndex: 1000
            }}
            role="menu"
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/change-password");
              }}
              style={{
                width: "100%",
                textAlign: "left",
                border: "none",
                background: "transparent",
                padding: "10px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                color: "#1f2937",
                fontWeight: 500
              }}
              role="menuitem"
            >
              Change Password
            </button>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                textAlign: "left",
                border: "none",
                background: "transparent",
                padding: "10px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                color: "#b91c1c",
                fontWeight: 600
              }}
              role="menuitem"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Topbar;