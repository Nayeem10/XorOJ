// src/pages/ProblemEditor.jsx
import React, { useState } from "react";
import { NavLink, Outlet, useParams, useLocation } from "react-router-dom";

const tabs = [
  { name: "General Info", path: "general" },
  { name: "Statement", path: "statement" },
  { name: "Validator", path: "validator" },
  { name: "Generator", path: "generator" },
  { name: "Checker", path: "checker" },
  { name: "Tests", path: "tests" },
  { name: "Solution Files", path: "solutions" },
  { name: "Invocations", path: "invocations" },
  { name: "Manage Access", path: "access" },
];

export default function ProblemEditor() {
  const { problemId } = useParams();
  const location = useLocation();

  // Get the initial problem data from router state (passed from MyProblems)
  const initialData = location.state?.problemData || null;

  // Shared problem state
  const [problemData, setProblemData] = useState(initialData);

  if (!problemData) {
    return <p className="p-6">Loading problem data...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {`Problem Title: ${problemData.title}`}
      </h1>

      {/* Navigation Tabs */}
      <nav className="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `px-3 py-2 -mb-px border-b-2 text-sm font-medium ${
                isActive
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`
            }
          >
            {tab.name}
          </NavLink>
        ))}
      </nav>

      {/* Render the active tab and pass shared problem data */}
      <Outlet context={{ problemData, setProblemData }} />
    </div>
  );
}
