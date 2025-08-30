// src/pages/ContestAllSubmissionsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "../components/Card.jsx";
import { apiFetch } from "../api/client";

export default function ContestAllSubmissionsPage() {
  const { id } = useParams(); // contest id
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [problemFilter, setProblemFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  useEffect(() => {
    apiFetch(`/api/contests/${id}/submissions`)
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Expected array of submissions");
        setSubmissions(data);
      })
      .catch((err) => {
        console.error("Failed to fetch submissions", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const filteredSubmissions = submissions.filter(
    (s) =>
      (!problemFilter || s.problemTitle.toLowerCase().includes(problemFilter.toLowerCase())) &&
      (!userFilter || s.username.toLowerCase().includes(userFilter.toLowerCase()))
  );

  if (loading) return <p className="text-center mt-6">Loading submissions…</p>;
  if (error) return <p className="text-red-500 text-center mt-6">Error: {error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-6 px-4">
      <h1 className="text-2xl font-bold mb-4">All Submissions</h1>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Filter by problem"
            value={problemFilter}
            onChange={(e) => setProblemFilter(e.target.value)}
            className="input input-bordered flex-1"
          />
          <input
            type="text"
            placeholder="Filter by user"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="input input-bordered flex-1"
          />
        </div>
      </Card>

      <Card>
        {filteredSubmissions.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Username</th>
                <th className="py-2 px-3">Problem</th>
                <th className="py-2 px-3">Verdict</th>
                <th className="py-2 px-3">Time (ms)</th>
                <th className="py-2 px-3">Memory (KB)</th>
                <th className="py-2 px-3">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((s, i) => (
                <tr key={s.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-3">{i + 1}</td>
                  <td className="py-2 px-3">{s.username}</td>
                  <td className="py-2 px-3">
                    <Link to={`/problems/${s.problemId}`} className="text-indigo-600">
                      {s.problemTitle}
                    </Link>
                  </td>
                  <td className={`py-2 px-3 font-medium ${getVerdictColor(s.verdict)}`}>
                    {s.verdict}
                  </td>
                  <td className="py-2 px-3">{s.time}</td>
                  <td className="py-2 px-3">{s.memory}</td>
                  <td className="py-2 px-3">{new Date(s.submittedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 py-4 text-center">No submissions found.</p>
        )}
      </Card>

      <Link to={`/contests/${id}`} className="btn btn-secondary mt-4">Back to Contest</Link>
    </div>
  );
}

// Helper function to style verdicts
function getVerdictColor(verdict) {
  switch (verdict.toLowerCase()) {
    case "accepted": return "text-green-600";
    case "wrong answer": return "text-red-600";
    case "runtime error": return "text-yellow-700";
    case "time limit exceeded": return "text-orange-600";
    default: return "text-gray-700";
  }
}
