// src/pages/ContestPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "../components/Card.jsx";
import CountdownTimer from "../components/CountdownTimer.jsx";
import ContestRegisterButton from "../components/ContestRegisterButton.jsx";
import { apiFetch } from "../api/client";

export default function ContestPage() {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Fetch contest details
    apiFetch(`/api/contests/${id}`)
      .then((data) => {
        if (!cancelled) setContest(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    // Check registration
    apiFetch(`/api/contests/${id}/is-registered`)
      .then((res) => {
        if (!cancelled) setIsRegistered(res.registered);
      })
      .catch(() => {
        if (!cancelled) setIsRegistered(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <p className="text-center mt-6">Loading contest…</p>;
  if (error || !contest)
    return (
      <div className="max-w-6xl mx-auto mt-6 px-4">
        <p className="text-red-500">Error loading contest: {error || "Not found"}</p>
        <Link to="/contest" className="btn mt-4">Back to Contest List</Link>
      </div>
    );

  const now = new Date();
  const hasStarted = now >= new Date(contest.startTime);

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4 space-y-6">
      <Card>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{contest.title}</h1>
          <div className="text-gray-500">{contest.format} | {contest.visibility}</div>
        </div>
        <p className="mt-2">
          <strong>Start:</strong> {new Date(contest.startTime).toLocaleString()} &nbsp;
          <CountdownTimer startTime={contest.startTime} />
        </p>
        {contest.description && <p className="mt-2">{contest.description}</p>}
      </Card>

      {hasStarted && (
        <div className="flex gap-2 flex-wrap">
          <Link to={`/contest/${id}/standings`} className="btn btn-outline">Standings</Link>
          {isRegistered && <Link to={`/contest/${id}/view`} className="btn btn-primary">View Contest</Link>}
        </div>
      )}

      {!isRegistered && contest.allowRegistration && (
        <div className="mt-2">
          <ContestRegisterButton contestId={id} initialStatus={false} />
        </div>
      )}

      <Link to="/contest" className="btn btn-secondary mt-4">Back to Contest List</Link>
    </div>
  );
}
