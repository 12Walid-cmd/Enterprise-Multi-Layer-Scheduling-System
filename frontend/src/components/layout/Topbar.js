import React from "react";

function Topbar() {
  return (
    <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center">

      <div className="fw-semibold fs-4 text-primary">
        📅 Enterprise Scheduling System
      </div>

      <div className="d-flex align-items-center gap-3">
        <span className="text-muted">Admin User</span>
        <div
          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: "40px", height: "40px" }}
        >
        </div>
      </div>

    </div>
  );
}

export default Topbar;