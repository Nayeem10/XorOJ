// src/pages/Generator.jsx
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../../components/Button.jsx";

export default function Generator() {
  const { problemData, setProblemData } = useOutletContext();
  const [generatorFiles, setGeneratorFiles] = useState(problemData?.generatorFiles || []);
  const [loading, setLoading] = useState(false);

  const problemId = problemData.id;

  // Add new empty file slot
  const addFileInput = () => {
    setGeneratorFiles([...generatorFiles, null]);
  };

  // Handle file selection
  const handleFileChange = (index, file) => {
    if (!file) return;

    if (!file.name.endsWith(".cpp")) {
      alert("Please upload a .cpp file only!");
      return;
    }

    const updatedFiles = [...generatorFiles];
    updatedFiles[index] = file;
    setGeneratorFiles(updatedFiles);
  };

  // Remove a file
  const handleRemoveFile = (index) => {
    const updatedFiles = [...generatorFiles];
    updatedFiles.splice(index, 1);
    setGeneratorFiles(updatedFiles);
  };

  // Save all generator files
  const handleSave = async () => {
    if (generatorFiles.length === 0 || generatorFiles.every(f => !f)) {
      alert("Please select at least one generator file!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      generatorFiles.forEach((file, idx) => {
        if (file) formData.append(`generatorFiles`, file);
      });

      const res = await fetch(`/api/problems/${problemId}/generator`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to save generator files");

      // Update context
      setProblemData(prev => ({ ...prev, generatorFiles }));

      alert("Generator files saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save generator files");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl">
      <h2 className="text-xl font-bold mb-4">Generators</h2>

      {generatorFiles.map((file, idx) => (
        <div key={idx} className="mb-2 flex items-center gap-2">
          <input
            type="file"
            accept=".cpp"
            onChange={e => handleFileChange(idx, e.target.files[0])}
          />
          {file && <p className="text-sm">{file.name}</p>}
          <button
            type="button"
            onClick={() => handleRemoveFile(idx)}
            className="text-red-600 font-bold px-2"
          >
            Remove
          </button>
        </div>
      ))}

      <div className="mb-4">
        <Button onClick={addFileInput} className="bg-blue-600 hover:bg-blue-700">
          + Add More
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Generators"}
        </Button>
      </div>
    </div>
  );
}
