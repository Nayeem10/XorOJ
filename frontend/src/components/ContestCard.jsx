// src/components/ContestCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import CountdownTimer from "./CountdownTimer.jsx";

export default function ContestCard({ contest }) {
  const now = new Date();
  const hasStarted = now >= new Date(contest.startTime);

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold">{contest.title}</h2>
        <span className="text-gray-500 text-sm">{contest.status}</span>
      </div>

      {contest.description && (
        <p className="text-gray-600 mt-2">{contest.description.slice(0, 120)}...</p>
      )}

      <div className="text-sm text-gray-500 mt-2">
        <p>
          Starts: {new Date(contest.startTime).toLocaleString()} &nbsp;|&nbsp;
          <CountdownTimer startTime={contest.startTime} />
        </p>
        <p>Ends: {new Date(contest.endTime).toLocaleString()}</p>
        <p>Duration: {contest.duration} minutes</p>
      </div>

      <div className="mt-3 flex gap-3 flex-wrap">
        <Link
          to={`/contest/${contest.id}`}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Enter
        </Link>
        {hasStarted && (
          <Link
            to={`/contest/${contest.id}/view`}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            View
          </Link>
        )}
      </div>
    </div>
  );
}
