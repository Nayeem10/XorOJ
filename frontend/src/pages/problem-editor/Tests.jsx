// src/pages/Tests.jsx
import React, { useState, useEffect } from "react";
import Button from "../../components/Button.jsx";
import { useOutletContext } from "react-router-dom";
import { apiFetch } from "../../api/client.js";

export default function Tests() {
  const { problemData, setProblemData } = useOutletContext();
  const [tests, setTests] = useState(problemData?.testFiles || []);
  const [showModal, setShowModal] = useState(false);
  const [newTest, setNewTest] = useState({ id: "", file: null });
  const [loading, setLoading] = useState(false);

  const problemId = problemData.id;

  useEffect(() => {
    if (problemData?.testFiles) setTests(problemData.testFiles);
  }, [problemData]);

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      alert("Please upload .txt file only!");
      e.target.value = null;
      return;
    }

    setNewTest((prev) => ({ ...prev, file }));
  };

  // Create test file
  const createTestFile = async () => {
    if (!newTest.id.trim() || !newTest.file) {
      alert("Please provide both an ID and a .txt file!");
      return;
    }

    if (tests.some((t) => t.id === parseInt(newTest.id))) {
      alert("This ID already exists. Please choose another one.");
      return;
    }

    const formData = new FormData();
    formData.append("id", newTest.id);
    formData.append("file", newTest.file);

    try {
      setLoading(true);
      const res = await apiFetch(`/api/edit/problems/${problemId}/testfile`, {
        method: "POST",
        body: formData,
        headers: {}, // Let browser set content type
      });

      if (!res) {
        throw new Error("Failed to create test file");
      }

      // Construct test object ourselves
      const testObj = {
        id: parseInt(newTest.id),
        fileName: newTest.file.name,
      };

      // Update context state
      setProblemData((prev) => ({
        ...prev,
        testFiles: [...(prev.testFiles || []), testObj],
      }));

      setShowModal(false);
      setNewTest({ id: "", file: null });
      setTests((prev) => [...prev, testObj]);
    } catch (err) {
      alert("Failed to create test file");
    } finally {
      setLoading(false);
    }
  };

  // Delete test file
  const deleteTestFile = async (id) => {
    try {
      const res = await apiFetch(`/api/edit/problems/${problemId}/testfile/${id}`, {
        method: "DELETE",
      });

      if (!res) throw new Error("Failed to delete test file");

      const updatedTests = tests.filter((t) => t.id !== id);
      setTests(updatedTests);
      setProblemData((prev) => ({ ...prev, testFiles: updatedTests }));
    } catch (err) {
      alert("Failed to delete test file");
    }
  };

  // View test file
  const viewTestFile = (id) => {
    const url = `/api/edit/problems/${problemId}/testfile/${id}/view`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Tests</h1>

      <div className="mb-4">
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Add Test File
        </Button>
      </div>

      {/* Tests Table */}
      {tests.length > 0 ? (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID</th>
              <th className="border p-2">File</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t) => (
              <tr key={t.id}>
                <td className="border p-2 text-center">{t.id}</td>
                <td className="border p-2">{t.fileName}</td>
                <td className="border p-2 text-center space-x-2">
                  <Button
                    onClick={() => viewTestFile(t.id)}
                    className="bg-green-600 hover:bg-green-700 px-2 py-1 text-sm"
                  >
                    View
                  </Button>
                  <Button
                    onClick={() => deleteTestFile(t.id)}
                    className="bg-red-600 hover:bg-red-700 px-2 py-1 text-sm"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">No test files added yet.</p>
      )}

      {/* Modal for Add Test File */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Add Test File</h3>

            <label className="block mb-2">Test ID (number)</label>
            <input
              type="number"
              min="1"
              className="w-full border rounded px-2 py-1 mb-3"
              value={newTest.id}
              onChange={(e) =>
                setNewTest({
                  ...newTest,
                  id: e.target.value.replace(/\D/g, ""), // only digits
                })
              }
            />

            <label className="block mb-2">Upload File (.txt)</label>
            <input
              type="file"
              accept=".txt"
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
                onClick={createTestFile}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
