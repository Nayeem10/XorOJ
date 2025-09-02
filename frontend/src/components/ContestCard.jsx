import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiFetch } from "../api/client";

import CountdownTimer from "./CountdownTimer.jsx";

export default function ContestCard({ contest }) {
  const [isRegistered, setIsRegistered] = useState(!!contest.registered);
  const [tick, setTick] = useState(0); // dummy state to force a re-render at boundaries

  const startMs = useMemo(() => new Date(contest.startTime).getTime(), [contest.startTime]);
  const endMs   = useMemo(() => new Date(contest.endTime).getTime(),   [contest.endTime]);
  const nowMs   = Date.now();

  const hasStarted = nowMs >= startMs;
  const hasEnded   = nowMs >= endMs;

  // Wake up exactly when we need to flip UI (start or end), not every second
  useEffect(() => {
    // choose the next boundary ahead of "now"
    const nextBoundary = !hasStarted ? startMs : !hasEnded ? endMs : null;
    if (nextBoundary === null) return; // nothing else to do

    const delay = Math.max(0, nextBoundary - Date.now()) + 20; // tiny buffer
    const id = setTimeout(() => setTick(t => t + 1), delay);
    return () => clearTimeout(id);
  }, [startMs, endMs, hasStarted, hasEnded]);

  const handleRegister = async () => {
    if (isRegistered || hasEnded) return;
    try {
      const res = await apiFetch(`/api/contests/${contest.id}/register`, { method: "POST" });
      if (res) setIsRegistered(true);
    } catch (err) {
      console.error("Registration failed", err);
    }
  };

  return (
    <div className="border rounded-lg shadow p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{contest.title}</h2>
        <span className="text-gray-500">{contest.visibility}</span>
      </div>

      <p>{contest.description}</p>

      <div>
        <strong>Start:</strong> {new Date(startMs).toLocaleString()} <br />
        <strong>End:</strong> {new Date(endMs).toLocaleString()} <br />
        <CountdownTimer startTime={hasEnded ? new Date(endMs) : new Date(startMs)} />
      </div>

      <div className="flex gap-2 flex-wrap mt-2">
        {!hasEnded && !isRegistered && (
          <button onClick={handleRegister} className="btn btn-primary btn-sm">
            Register
          </button>
        )}
        {hasStarted && (
          <Link to={`/contests/${contest.id}/standings`} className="btn btn-outline btn-sm">
            Standings
          </Link>
        )}
        {isRegistered && hasStarted && (
          <Link to={`/contests/${contest.id}/view`} className="btn btn-primary btn-sm">
            Enter
          </Link>
        )}
      </div>
    </div>
  );
}
