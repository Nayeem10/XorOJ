// src/pages/Tests.jsx
import React, { useState, useEffect } from "react";
import Button from "../../components/Button.jsx";
import { useOutletContext } from "react-router-dom";

export default function Tests() {
  const { problemData, setProblemData } = useOutletContext();
  const [tests, setTests] = useState(problemData?.tests || []);

  const [showManualForm, setShowManualForm] = useState(false);
  const [showGeneratedForm, setShowGeneratedForm] = useState(false);

  const [manualId, setManualId] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [manualOutput, setManualOutput] = useState("");

  const [generatedId, setGeneratedId] = useState("");
  const [selectedGenerator, setSelectedGenerator] = useState("");
  const [command, setCommand] = useState("");

  const problemId = problemData.id;

  useEffect(() => {
    if (problemData?.tests) setTests(problemData.tests);
  }, [problemData]);

  // Save or update a test
  const saveTest = async (newTest) => {
    if (!newTest.id.trim()) {
      alert("Test ID cannot be empty");
      return;
    }

    try {
      const res = await apiFetch(`/api/problems/${problemId}/tests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTest),
      });

      if (!res.ok) throw new Error("Failed to save test");

      const savedTest = await res.json();

      // Update tests array: replace if ID exists, otherwise append
      const updatedTests = tests.filter((t) => t.id !== savedTest.id);
      updatedTests.push(savedTest);

      setTests(updatedTests);
      setProblemData((prev) => ({ ...prev, tests: updatedTests }));

      // reset form fields
      setManualId("");
      setManualInput("");
      setManualOutput("");
      setGeneratedId("");
      setSelectedGenerator("");
      setCommand("");
      setShowManualForm(false);
      setShowGeneratedForm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save test");
    }
  };

  const removeTest = async (id) => {
    try {
      const res = await apiFetch(`/api/problems/${problemId}/tests/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete test");

      const updatedTests = tests.filter((t) => t.id !== id);
      setTests(updatedTests);
      setProblemData((prev) => ({ ...prev, tests: updatedTests }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete test");
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Tests</h1>

      <div className="flex gap-4 mb-6">
        <Button
          onClick={() => {
            setShowManualForm(!showManualForm);
            setShowGeneratedForm(false);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          + Add Manual Test
        </Button>
        <Button
          onClick={() => {
            setShowGeneratedForm(!showGeneratedForm);
            setShowManualForm(false);
          }}
          className="bg-green-600 hover:bg-green-700"
        >
          + Add Generated Test
        </Button>
      </div>

      {/* Manual Test Form */}
      {showManualForm && (
        <div className="p-4 mb-6 border rounded-md bg-gray-50">
          <h2 className="font-semibold mb-3">New Manual Test</h2>
          <input
            placeholder="Test ID"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
          <textarea
            placeholder="Input"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
            rows={3}
          />
          <textarea
            placeholder="Output"
            value={manualOutput}
            onChange={(e) => setManualOutput(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
            rows={3}
          />
          <Button
            onClick={() =>
              saveTest({
                id: manualId,
                type: "manual",
                input: manualInput,
                output: manualOutput,
              })
            }
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Save
          </Button>
        </div>
      )}

      {/* Generated Test Form */}
      {showGeneratedForm && (
        <div className="p-4 mb-6 border rounded-md bg-gray-50">
          <h2 className="font-semibold mb-3">New Generated Test</h2>
          <input
            placeholder="Test ID"
            value={generatedId}
            onChange={(e) => setGeneratedId(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
          <select
            value={selectedGenerator}
            onChange={(e) => setSelectedGenerator(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          >
            <option value="">Select Generator File</option>
            {problemData.generators?.map((gen) => (
              <option key={gen} value={gen}>
                {gen}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Command"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
          <Button
            onClick={() =>
              saveTest({
                id: generatedId,
                type: "generated",
                generator: selectedGenerator,
                command,
              })
            }
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Save
          </Button>
        </div>
      )}

      {/* Tests Table */}
      <h2 className="text-lg font-semibold mb-3">All Tests</h2>
      <table className="w-full border text-left">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Content</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {tests.length === 0 ? (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">
                No tests yet
              </td>
            </tr>
          ) : (
            tests.map((t) => (
              <tr key={t.id}>
                <td className="p-2 border">{t.id}</td>
                <td className="p-2 border">{t.type}</td>
                <td className="p-2 border">
                  {t.type === "manual" ? (
                    <>
                      <div>
                        <strong>Input:</strong> {t.input}
                      </div>
                      <div>
                        <strong>Output:</strong> {t.output}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <strong>Generator:</strong> {t.generator}
                      </div>
                      <div>
                        <strong>Command:</strong> {t.command}
                      </div>
                    </>
                  )}
                </td>
                <td className="p-2 border">
                  <Button
                    onClick={() => removeTest(t.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
