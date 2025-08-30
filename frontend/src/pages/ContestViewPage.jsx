// src/pages/ContestViewPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "../components/Card.jsx";
import { apiFetch } from "../api/client";

export default function ContestViewPage() {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Fetch contest and registration status
    apiFetch(`/api/contests/${id}`)
      .then((data) => { if (!cancelled) setContest(data); })
      .catch((err) => { if (!cancelled) setError(err.message); });

    apiFetch(`/api/contests/${id}/is-registered`)
      .then((res) => { if (!cancelled) setIsRegistered(res.registered); })
      .catch(() => { if (!cancelled) setIsRegistered(false); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <p className="text-center mt-6">Loading contest…</p>;
  if (error || !contest) return <p className="text-red-500 text-center mt-6">Error: {error || "Not found"}</p>;

  if (!isRegistered) return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <p className="text-gray-500">You are not registered for this contest.</p>
      <Link to={`/contest/${id}`} className="btn mt-2">Back</Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4 space-y-6">
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
        <Link to={`/contest/${id}/my-submissions`} className="text-indigo-600 hover:underline">View My Submissions</Link>
      </Card>

      <Card title="All Submissions">
        <Link to={`/contest/${id}/submissions`} className="text-indigo-600 hover:underline">View All Submissions</Link>
      </Card>

      <Card title="Standings">
        <Link to={`/contest/${id}/standings`} className="text-indigo-600 hover:underline">View Standings</Link>
      </Card>

      <Link to={`/contest/${id}`} className="btn btn-secondary mt-4">Back to Contest</Link>
    </div>
  );
}
