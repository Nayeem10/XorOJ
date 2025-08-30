// src/pages/ContestMySubmissionsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "../components/Card.jsx";
import { apiFetch } from "../api/client";

export default function ContestMySubmissionsPage() {
  const { id } = useParams(); // contest id
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contest, setContest] = useState(null);

  // Fetch contest info first (to check registration + started)
  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch(`/api/contests/${id}`),
      apiFetch(`/api/contests/${id}/my-submissions`)
    ])
      .then(([contestData, subs]) => {
        setContest(contestData);
        if (!contestData.isRegistered) {
          throw new Error("You must be registered to view submissions.");
        }
        if (new Date(contestData.startTime) > new Date()) {
          throw new Error("Contest has not started yet.");
        }
        if (!Array.isArray(subs)) {
          throw new Error("Expected an array of submissions.");
        }
        setSubmissions(subs);
      })
      .catch((err) => {
        console.error("Failed to fetch contest submissions", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center mt-6">Loading submissions…</p>;
  if (error) return <p className="text-red-500 text-center mt-6">Error: {error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <h1 className="text-2xl font-bold mb-4">My Submissions</h1>

      <Card>
        {submissions.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Problem</th>
                <th className="py-2 px-3">Verdict</th>
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">Memory</th>
                <th className="py-2 px-3">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s, i) => (
                <tr
                  key={s.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2 px-3">{i + 1}</td>
                  <td className="py-2 px-3">
                    <Link
                      to={`/problems/${s.problemId}`}
                      className="text-indigo-600"
                    >
                      {s.problemTitle}
                    </Link>
                  </td>
                  <td
                    className={`py-2 px-3 font-medium ${getVerdictColor(
                      s.verdict
                    )}`}
                  >
                    {s.verdict || "—"}
                  </td>
                  <td className="py-2 px-3">{s.time} ms</td>
                  <td className="py-2 px-3">{s.memory} KB</td>
                  <td className="py-2 px-3">
                    {new Date(s.submittedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 py-4 text-center">
            You have not made any submissions yet.
          </p>
        )}
      </Card>

      <Link to={`/contest/${id}`} className="btn btn-secondary mt-4">
        Back to Contest
      </Link>
    </div>
  );
}

// Helper function to style verdicts
function getVerdictColor(verdict) {
  if (!verdict) return "text-gray-700";
  switch (verdict.toLowerCase()) {
    case "accepted":
      return "text-green-600";
    case "wrong answer":
      return "text-red-600";
    case "runtime error":
      return "text-yellow-700";
    case "time limit exceeded":
      return "text-orange-600";
    default:
      return "text-gray-700";
  }
}
