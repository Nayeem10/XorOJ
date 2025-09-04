import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useNavigate } from "react-router-dom";

import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";

export default function MyProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Load existing problems
  useEffect(() => {
    async function loadProblems() {
      try {
        const data = await apiFetch("/api/author/problems/my");
        console.log("Loaded problems:", data);
        setProblems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load problems", err);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    }
    loadProblems();
  }, []);

  // Handle create new problem
  const handleCreate = async () => {
    if (!newTitle.trim()) {
      setError("Title cannot be empty");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const data = await apiFetch("/api/author/problems/init", {
        method: "POST",
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      // const data = {
      //   title: newTitle,
      //   id: 123,          // dummy problem id
      //   inputFile: "stdin",
      //   outputFile: "stdout",
      //   timeLimit: 1000,
      //   memoryLimit: 256 * 1024, // KB
      //   interactive: false,
      //   tags: [],
      //   contestId: null,
      // };

      if (!data || !data.id) {
        setError("Failed to create problem. Please try again.");
        return;
      }

      // Redirect to ProblemEditor page for the new problem
      navigate(`/author/problems/${data.id}/edit`, { state: { problemData: data } });
    } catch (err) {
      // console.error(err);
      setError("Failed to create problem. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="p-6">Loading problems...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My Problems</h1>
        <Button onClick={() => setShowModal(true)}>+ Create Problem</Button>
      </div>

      {/* No problems message */}
      {problems.length === 0 ? (
        <Card>
          <p className="text-gray-600">No problems yet. Create your first problem 🚀</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {problems.map((p) => (
            <Card key={p.id} title={`${p.title} (ID: ${p.problemNum})`}>
              <p className="text-sm text-gray-700 line-clamp-3">{p.statement}</p>

              <div className="mt-3 grid grid-cols-2 gap-y-1 text-sm text-gray-600">
                <span>Difficulty: <b>{p.difficultyRating}</b></span>
                <span>Accepted: <b>{p.solveCount}</b></span>
                <span>Time Limit: <b>{p.timeLimit} ms</b></span>
                <span>Memory: <b>{Math.floor(p.memoryLimit / 1000)} MB</b></span>
              </div>

              {/* {p.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs bg-gray-200 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )} */}

              <div className="mt-4 flex gap-2">
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate(`/author/problems/${p.id}/edit`, { state: { problemData: p } })}
                >
                  Edit
                </Button>
                <Button
                  className="bg-gray-600 hover:bg-gray-700"
                  onClick={() => console.log("Preview problem", p.id)}
                >
                  Preview
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Problem Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Create New Problem</h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}

            <input
              type="text"
              placeholder="Problem Title"
              className="w-full border rounded px-2 py-1 mb-4"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <Button
                className="bg-gray-400 hover:bg-gray-500"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} loading={creating}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
