// src/components/Card.jsx
import React from "react";

export default function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white shadow-md rounded-lg p-4 ${className}`}>
      {title && <h2 className="text-lg font-semibold text-gray-800 mb-3">{title}</h2>}
      <div>{children}</div>
    </div>
  );
}
