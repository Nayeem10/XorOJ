// src/pages/ContestListPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card.jsx";
import CountdownTimer from "../components/CountdownTimer.jsx";
import { apiFetch } from "../api/client";
import ContestRegisterButton from "../components/ContestRegisterButton.jsx";

export default function ContestListPage() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch("/api/contests")
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Expected array of contests");
        setContests(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-6">Loading contests…</p>;
  if (error) return <p className="text-red-500 text-center mt-6">Error: {error}</p>;

  const now = new Date();

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Contests</h1>

      {contests.length === 0 ? (
        <p className="text-gray-500">No contests available.</p>
      ) : (
        contests.map((c) => {
          const contestStart = new Date(c.startTime);
          const hasStarted = now >= contestStart;

          return (
            <Card key={c.id} className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{c.title}</h2>
                <div className="text-gray-500 text-sm">{c.format} | {c.visibility}</div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div>
                  <strong>Start:</strong> {contestStart.toLocaleString()} &nbsp;
                  <CountdownTimer startTime={c.startTime} />
                </div>

                {hasStarted && (
                  <div className="flex gap-2 flex-wrap mt-2 sm:mt-0">
                    <Link to={`/contest/${c.id}/standings`} className="btn btn-outline btn-sm">Standings</Link>
                    {c.isRegistered && (
                      <Link to={`/contest/${c.id}/view`} className="btn btn-primary btn-sm">View Contest</Link>
                    )}
                  </div>
                )}
              </div>

              {!c.isRegistered && c.allowRegistration && (
                <div className="mt-2">
                  <ContestRegisterButton contestId={c.id} initialStatus={false} />
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
