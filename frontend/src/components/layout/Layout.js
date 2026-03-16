import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function Layout({ children }) {
  const location = useLocation();
  const isLoginRoute = location.pathname === "/login";

  if (isLoginRoute) {
    return <div>{children}</div>;
  }

  return (
    <div>

      {/* Topbar Full Width */}
      <Topbar />

      {/* Sidebar + Content Row */}
      <div className="d-flex">

        <Sidebar />

        <div className="flex-grow-1 p-4 bg-light" style={{ minHeight: "100vh" }}>
          {children}
        </div>

      </div>

    </div>
  );
}

export default Layout;