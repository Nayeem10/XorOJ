import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { apiFetch } from "../api/client";
import Card from "../components/Card";
import IDE from "../components/IDE.jsx";
import MathRenderer from "../components/MathRenderer.jsx"; 

import "../styles/styles.css";

export default function ProblemPage() {
  const { pid } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lifted code/language from IDE for submission
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

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

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const data = await apiFetch(`/api/submissions/problems/${pid}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      setSubmitResult(data); // optionally show result
      alert("Submission successful!");
    } catch (err) {
      alert("Submission failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-6">Loading problem...</p>;
  if (error) return <p className="text-red-500 mt-6 text-center">Error: {error}</p>;
  if (!problem) return <p className="text-center mt-6">Problem not found.</p>;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* SUBMIT BUTTON */}
      <div className="p-3 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitting || !code.trim()}
          className={`px-4 py-2 rounded ${submitting ? "bg-gray-300" : "bg-green-600 hover:bg-green-700 text-white"}`}
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </div>

      {/* MOBILE / SMALL SCREENS */}
      <div className="flex-1 md:hidden flex flex-col min-h-0">
        <PanelGroup direction="vertical" className="flex-1 min-h-0">
          <Panel defaultSize={55} minSize={30} className="h-full overflow-auto p-3 space-y-4">
            <Card className="text-center bg-gray-50 p-4 rounded-lg shadow">
              <h1 className="text-2xl font-bold">{problem.title}</h1>
              <div className="flex justify-center gap-6 mt-2 text-sm text-gray-700">
                <span>Time Limit: {problem.timeLimit} ms</span>
                <span>Memory Limit: {problem.memoryLimit / 1000} MB</span>
              </div>
            </Card>

            <Card title="Description"><MathRenderer content={problem.description} /></Card>
            <Card title="Input Format"><MathRenderer content={problem.inputFormat} /></Card>
            {problem.outputFormat && <Card title="Output Format"><MathRenderer content={problem.outputFormat} /></Card>}
            <Card title="Sample Input"><pre>{problem.sampleInput}</pre></Card>
            <Card title="Sample Output"><pre>{problem.sampleOutput}</pre></Card>
            <Card title="Difficulty & Tags">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="font-medium">Rating: {problem.difficultyRating}</span>
                {problem.tags?.map((tag) => (
                  <span key={tag} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm">{tag}</span>
                ))}
              </div>
            </Card>
            {problem.notes && <Card title="Notes"><MathRenderer content={problem.notes} /></Card>}
          </Panel>

          <PanelResizeHandle className="h-2 bg-gray-200 hover:bg-gray-300 transition-colors" />

          {/* BOTTOM - IDE */}
          <Panel defaultSize={45} minSize={30} className="h-full flex flex-col">
            <IDE
              code={code}
              setCode={setCode}
              language={language}
              setLanguage={setLanguage}
              initialStdin={problem.sampleInput || ""}
            />
          </Panel>
        </PanelGroup>
      </div>

      {/* DESKTOP / MD+ SCREENS */}
      <div className="hidden md:flex flex-1 min-h-0">
        <PanelGroup direction="horizontal" className="flex-1 h-auto">
          <Panel defaultSize={50} minSize={25} className="overflow-auto p-4 space-y-4">
            <Card className="text-center bg-gray-50 p-4 rounded-lg shadow">
              <h1 className="text-3xl font-bold">{problem.title}</h1>
              <div className="flex justify-center gap-6 mt-2 text-sm text-gray-700">
                <span>Time Limit: {problem.timeLimit} ms</span>
                <span>Memory Limit: {problem.memoryLimit / 1000} MB</span>
              </div>
            </Card>

            <Card title="Description"><MathRenderer content={problem.description} /></Card>
            <Card title="Input Format"><MathRenderer content={problem.inputFormat} /></Card>
            <Card title="Output Format"><MathRenderer content={problem.outputFormat} /></Card>
            <Card title="Sample Input"><pre>{problem.sampleInput}</pre></Card>
            <Card title="Sample Output"><pre>{problem.sampleOutput}</pre></Card>
            <Card title="Difficulty & Tags">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="font-medium">Rating: {problem.difficultyRating}</span>
                {problem.tags?.map((tag) => (
                  <span key={tag} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm">{tag}</span>
                ))}
              </div>
            </Card>
            {problem.notes && <Card title="Notes"><MathRenderer content={problem.notes} /></Card>}
          </Panel>

          <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 transition-colors" />

          <Panel defaultSize={50} minSize={25} className="flex flex-col h-full">
            <IDE
              code={code}
              setCode={setCode}
              language={language}
              setLanguage={setLanguage}
              initialStdin={problem.sampleInput || ""}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
