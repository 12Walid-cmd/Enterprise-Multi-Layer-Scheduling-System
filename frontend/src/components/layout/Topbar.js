import React from "react";
import { Link } from "react-router-dom"; // for login redirect
import cgiLogo from "../../images/cgiLogo.png"; // make sure the path is correct

function Topbar() {
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

      {/* Right side: User info + Login button */}
      <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        {/* Keep Admin User info */}
        <span className="topbar-user">Admin User</span>
        <div className="topbar-avatar" style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "white",
          color: "#e31837",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "600"
        }}>
          AU
        </div>

        {/* Login Button */}
        <Link
          to="/login"
          style={{
            padding: "8px 16px",
            backgroundColor: "white",
            color: "#e31837",
            borderRadius: "6px",
            fontWeight: "600",
            textDecoration: "none"
          }}
        >
          Login
        </Link>
      </div>
    </div>
  );
}

export default Topbar;