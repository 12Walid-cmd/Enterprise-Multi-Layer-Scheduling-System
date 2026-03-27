import React from "react";

function Card({ title, value }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body text-center">
        <h6>{title}</h6>
        <h3>{value}</h3>
      </div>
    </div>
  );
}

export default Card;