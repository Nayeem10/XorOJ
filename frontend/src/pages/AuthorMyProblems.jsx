// src/pages/MyProblems.jsx
import React, { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";

export default function MyProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProblems() {
      try {
        const data = await apiFetch("/api/author/problems/my");
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

  if (loading) return <div className="p-6">Loading problems...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My Problems</h1>
        <Button onClick={() => navigate("/author/problems/create")}>
          + Create Problem
        </Button>
      </div>

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

              {p.tags.length > 0 && (
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
              )}

              <div className="mt-4 flex gap-2">
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate(`/author/problems/${p.id}/edit`)}
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
    </div>
  );
}
