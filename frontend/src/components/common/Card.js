import React from "react";

function Card({ children, className = "", title, value }) {
  // Support both old usage (title/value) and new usage (children/className)
  if (title && value) {
    return (
      <div className={`card shadow-sm ${className}`}>
        <div className="card-body text-center">
          <h6>{title}</h6>
          <h3>{value}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

export default Card;