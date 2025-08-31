// src/pages/ProblemPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Card from "../components/Card";
import { apiFetch } from "../api/client";
import CodeEditorPanel from "../components/CodeEditorPanel";

export default function ProblemPage() {
  const { cid , pid } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // submission UI state (kept here so page can control spinners/messages)
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    apiFetch(`/api/problems/${pid}`)
      .then((data) => {
        setProblem(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch problem", err);
        setError(err.message);
        setLoading(false);
      });
  }, [pid]);

  // Will receive { code, language } from CodeEditorPanel
  const handleSubmit = ({ code, language }) => {
    setSubmitting(true);
    setMessage(null);

    // TODO: replace with your real submit endpoint:
    // await apiFetch('/api/submissions', { method:'POST', body: JSON.stringify({ problemId:id, code, language })})
    setTimeout(() => {
      setMessage("Submission feature coming soon!");
      setSubmitting(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-6 px-4">
        <p className="text-center">Loading problem...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto mt-6 px-4">
        <Card>
          <p className="text-red-500">Error: {error}</p>
        </Card>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-5xl mx-auto mt-6 px-4">
        <Card>
          <p className="text-center">Problem not found.</p>
        </Card>
      </div>
    );
  }

  return (
    <>
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

        {/* Submit Panel (componentized) */}
        <Card title="Submit Solution">
          <CodeEditorPanel
            initialCode={"// Write your code here\n"}
            initialLanguage="cpp"
            submitting={submitting}
            message={message}
            onSubmit={handleSubmit}
          />
        </Card>

        {/* My Submissions - Coming Soon */}
        <Card title="My Submissions">
          <p className="text-gray-500">Submissions feature coming soon!</p>
        </Card>
      </div>
    </>
  );
}
