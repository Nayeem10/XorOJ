// src/pages/ProblemPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Card from "../components/Card";
import { apiFetch } from "../api/client";
import CodeEditorPanel from "../components/CodeEditorPanel";
import "../styles.css";

export default function ProblemPage() {
  const { pid } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleSubmit = ({ code, language }) => {
    setSubmitting(true);
    setMessage(null);
    setTimeout(() => {
      setMessage("Submission feature coming soon!");
      setSubmitting(false);
    }, 1000);
  };

  if (loading) return <p className="text-center mt-6">Loading problem...</p>;
  if (error) return <p className="text-red-500 mt-6 text-center">Error: {error}</p>;
  if (!problem) return <p className="text-center mt-6">Problem not found.</p>;

  return (
    <div className="h-[calc(100vh-4rem)] px-2 py-4">
      <PanelGroup direction="horizontal">
        {/* LEFT SIDE - Problem Details */}
        <Panel defaultSize={50} minSize={30}>
          <div className="space-y-6 pr-3 h-full overflow-auto">
            <Card className="problem-header">
              <div className="text-center">
                <h1 className="text-3xl font-bold">{problem.title}</h1>
                <div className="flex justify-center gap-6 mt-2 text-sm details">
                  <span>Author: {problem.author}</span>
                  <span>Time Limit: {problem.timeLimit} sec</span>
                  <span>Memory Limit: {problem.memoryLimit} MB</span>
                </div>
              </div>
            </Card>

          <Card className="problem-statement-card" title="Problem Statement">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: problem.statement }}
            />
          </Card>

          <Card title="Tutorial / Notes">
            <p className="text-gray-500">Tutorial feature coming soon!</p>
          </Card>
        </div>
        </Panel>

        <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 transition-colors" />

        {/* RIGHT SIDE - Code Editor */}
        <Panel defaultSize={50} minSize={30}>
          <div className="h-full pl-3 overflow-auto">
            <Card title="Submit Solution" className="h-full flex flex-col">
              <div className="flex-1">
                <CodeEditorPanel
                  initialCode={"// Write your code here\n"}
                  initialLanguage="cpp"
                  submitting={submitting}
                  message={message}
                  onSubmit={handleSubmit}
                />
              </div>
            </Card>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
