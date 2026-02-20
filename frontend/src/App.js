import React from "react";

function App() {
  return (
    <div className="container mt-5">
      <div className="border border-dark rounded p-4">
        <h1 className="text-center mb-4">
          Enterprise Scheduling System
        </h1>

        <div className="mb-3">
          <h4>Project Overview</h4>
          <p>
            Manage multi-layer teams and enterprise scheduling efficiently.
          </p>
        </div>

        <div className="mb-3">
          <h4>Core Features</h4>
          <ul>
            <li>Group Management</li>
            <li>Rotation Scheduling</li>
            <li>Role-Based Access</li>
          </ul>
        </div>

        <button className="btn btn-primary">
          Get Started
        </button>
      </div>
    </div>
  );
}

export default App;