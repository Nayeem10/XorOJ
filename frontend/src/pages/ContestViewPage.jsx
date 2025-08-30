// src/pages/ContestViewPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "../components/Card.jsx";
import { apiFetch } from "../api/client";
import CountdownTimer from "../components/CountdownTimer.jsx";

export default function ContestViewPage() {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Fetch contest and registration status
    apiFetch(`/api/contests/${id}/details`)
      .then((data) => {
        if (!cancelled) setContest(data);
      })
      .catch((err) => { if (!cancelled) setError(err.message); });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <p className="text-center mt-6">Loading contest…</p>;
  if (error || !contest) return <p className="text-red-500 text-center mt-6">Error: {error || "Not found"}</p>;

  const now = new Date();
  const endTime = new Date(contest.endTime);

  // Access control
  if (!isRegistered) return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <p className="text-gray-500">You are not registered for this contest.</p>
      <Link to={`/contests`} className="btn mt-2">Back</Link>
    </div>
  );
  if (now < new Date(contest.startTime)) return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <p className="text-gray-500">Contest has not started yet.</p>
      <Link to={`/contests`} className="btn mt-2">Back</Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4 space-y-6">
      <Card>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{contest.title}</h1>
          <CountdownTimer startTime={endTime} />
        </div>
        {contest.description && <p className="mt-2">{contest.description}</p>}
      </Card>

      {contest.problems && contest.problems.length > 0 && (
        <Card title="Problems">
          <ul className="list-decimal pl-5">
            {contest.problems.map((p) => (
              <li key={p.id}>
                <Link to={`/problems/${p.id}`} className="text-indigo-600">{p.title}</Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="My Submissions">
        <Link to={`/contests/${id}/my-submissions`} className="text-indigo-600 hover:underline">View My Submissions</Link>
      </Card>

      <Card title="All Submissions">
        <Link to={`/contests/${id}/submissions`} className="text-indigo-600 hover:underline">View All Submissions</Link>
      </Card>

      <Card title="Standings">
        <Link to={`/contests/${id}/standings`} className="text-indigo-600 hover:underline">View Standings</Link>
      </Card>

      <Link to={`/contest`} className="btn btn-secondary mt-4">Back to Contests</Link>
    </div>
  );
}
