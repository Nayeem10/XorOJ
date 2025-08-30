// src/pages/ProblemPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";

export default function ProblemPage() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("// Write your code here\n");
  const [language, setLanguage] = useState("cpp");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  // Fetch problem details
  useEffect(() => {
    fetch(`/api/problems/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProblem(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch problem", err);
        setLoading(false);
      });
  }, [id]);

  // Fetch submissions
  useEffect(() => {
    fetch(`/api/problems/${id}/submissions`)
      .then((res) => res.json())
      .then((data) => setSubmissions(data))
      .catch((err) => console.error("Failed to fetch submissions", err));
  }, [id]);

  // Submit code
  const handleSubmit = () => {
    setSubmitting(true);
    setMessage(null);

    fetch(`/api/problems/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, source: code }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(`Submission queued! ID: ${data.submissionId}`);
        setSubmitting(false);
        // Optionally, refresh submissions list
        setSubmissions((prev) => [
          { id: data.submissionId, status: "Queued", language, time: new Date().toISOString() },
          ...prev,
        ]);
      })
      .catch((err) => {
        setMessage("Submission failed");
        setSubmitting(false);
      });
  };

  if (loading) return <p className="text-center mt-6">Loading problem...</p>;
  if (!problem) return <p className="text-center mt-6">Problem not found.</p>;

  return (
    <div className="max-w-5xl mx-auto mt-6 px-4 space-y-6">
      {/* Problem Header */}
      <Card>
        <h1 className="text-2xl font-bold text-gray-800">{problem.title}</h1>
        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
          <span>Author: {problem.author}</span>
          <span>Time Limit: {problem.timeLimit} sec</span>
          <span>Memory Limit: {problem.memoryLimit} MB</span>
        </div>
      </Card>

      {/* Problem Statement */}
      <Card title="Problem Statement">
        <div
          className="prose max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: problem.statement }}
        />
      </Card>

      {/* Submit Panel */}
      <Card title="Submit Solution">
        <div className="flex flex-col space-y-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-32 rounded-md border px-2 py-1"
          >
            <option value="cpp">C++</option>
            <option value="py">Python</option>
            <option value="java">Java</option>
          </select>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={10}
            className="w-full border rounded-lg p-2 font-mono text-sm"
          />

          <div className="flex items-center gap-3">
            <Button onClick={handleSubmit} loading={submitting}>
              Submit
            </Button>
            {message && <span className="text-gray-600">{message}</span>}
          </div>
        </div>
      </Card>

      {/* My Submissions */}
      <Card title="My Submissions">
        {submissions.length === 0 ? (
          <p className="text-gray-500">No submissions yet.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">Language</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-3">{s.id}</td>
                  <td className="py-2 px-3">{s.language}</td>
                  <td className="py-2 px-3">{s.status}</td>
                  <td className="py-2 px-3">{new Date(s.time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
