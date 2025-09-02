import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { apiFetch } from "../api/client";

import Card from "../components/Card";
import IDE from "../components/IDE.jsx";

import "../styles/styles.css"

export default function ProblemPage() {
  const { pid } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch(`/api/problems/${pid}`)
      .then((data) => {
        setProblem(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [pid]);

  if (loading) return <p className="text-center mt-6">Loading problem...</p>;
  if (error) return <p className="text-red-500 mt-6 text-center">Error: {error}</p>;
  if (!problem) return <p className="text-center mt-6">Problem not found.</p>;

  return (
    <div className="h-[calc(100vh-4rem)] px-0 py-0 flex flex-col">
      <PanelGroup direction="horizontal" className="flex-1 min-h-0">
        {/* LEFT SIDE - Problem Details */}
        <Panel defaultSize={50} minSize={0} className="h-full">
          <div className="space-y-6 pr-3 h-full overflow-auto">
            <Card className="text-center">
              <h1 className="text-3xl font-bold">{problem.title}</h1>
              <div className="flex justify-center gap-6 mt-2 text-sm details">
                <span>Time Limit: {problem.timeLimit} ms</span>
                <span>Memory Limit: {problem.memoryLimit} KB</span>
              </div>
            </Card>

            <Card title="Problem Statement">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: problem.statement }}
              />
            </Card>

            <Card title="Tutorial / Notes">
              <p className="">Tutorial feature coming soon!</p>
            </Card>
          </div>
        </Panel>

        <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 transition-colors Resizer" />

        {/* RIGHT SIDE - Code Editor */}
        <Panel defaultSize={50} minSize={0} className="h-full flex flex-1">
          <IDE initialStdin={problem.sampleInput || ""} />
        </Panel>
      </PanelGroup>
    </div>
  );
}
