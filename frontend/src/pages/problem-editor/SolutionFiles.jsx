import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../../components/Button.jsx";

export default function SolutionFiles() {
  const { problemData, setProblemData } = useOutletContext();

  const [solutions, setSolutions] = useState(problemData?.solutionFiles || []);
  const [showModal, setShowModal] = useState(false);
  const [newSolution, setNewSolution] = useState({ id: "", file: null });
  const [loading, setLoading] = useState(false);

  const problemId = problemData.id;

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".cpp")) {
      alert("Please upload a .cpp file only!");
      e.target.value = null;
      return;
    }

    setNewSolution((prev) => ({ ...prev, file }));
  };

  // Create a solution file
  const createSolutionFile = async (newFile) => {
    try {
      const res = await apiFetch(`/api/problems/${problemId}/solutions`, {
        method: "POST",
        body: newFile, // FormData with unique ID + .cpp file
      });

      if (!res.ok) throw new Error("Failed to upload solution file");

      const savedFile = await res.json();

      // update local state
      setSolutions((prev) => [...prev, savedFile]);

      // update shared problemData
      setProblemData((prev) => ({
        ...prev,
        solutionFiles: [...(prev.solutionFiles || []), savedFile],
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to create solution file");
    }
  };

  // Wrapper for modal button
  const handleCreateSolution = async () => {
    if (!newSolution.id || !newSolution.file) {
      alert("Please provide both ID and a .cpp file");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("id", newSolution.id);
    formData.append("file", newSolution.file);

    await createSolutionFile(formData);

    setNewSolution({ id: "", file: null });
    setShowModal(false);
    setLoading(false);
  };

  // Delete a solution file
  const deleteSolutionFile = async (id) => {
    try {
      const res = await apiFetch(`/api/problems/${problemId}/solutions/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete solution file");

      // update local state
      setSolutions((prev) => prev.filter((f) => f.id !== id));

      // update shared problemData
      setProblemData((prev) => ({
        ...prev,
        solutionFiles: (prev.solutionFiles || []).filter((f) => f.id !== id),
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete solution file");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Solution Files</h2>

      {/* Add Solution Button */}
      <div className="mb-4">
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Solution
        </Button>
      </div>

      {/* Solutions Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">File</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {solutions.map((s) => (
            <tr key={s.id}>
              <td className="border p-2 text-center">{s.id}</td>
              <td className="border p-2">{s.fileName}</td>
              <td className="border p-2 text-center">
                <Button
                  onClick={() => deleteSolutionFile(s.id)}
                  className="bg-red-600 hover:bg-red-700 px-2 py-1 text-sm"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Add Solution */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Add Solution</h3>
            <label className="block mb-2">Solution ID</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-3"
              value={newSolution.id}
              onChange={(e) =>
                setNewSolution({ ...newSolution, id: e.target.value })
              }
            />
            <label className="block mb-2">Upload File (.cpp)</label>
            <input
              type="file"
              accept=".cpp"
              className="w-full mb-3"
              onChange={handleFileUpload}
            />
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 hover:bg-gray-500"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSolution}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
