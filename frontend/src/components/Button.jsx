// src/components/Button.jsx
import React from "react";

export default function Button({ children, className = "", loading = false, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        bg-indigo-600 text-white hover:bg-indigo-700
        focus:outline-none focus:ring-2 focus:ring-indigo-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition ${className}`}
    >
      {loading && (
        <svg
          className="w-4 h-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path
            d="M22 12a10 10 0 00-10-10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      <span>{children}</span>
    </button>
  );
}
