// src/pages/contest-editor/ContestGeneral.jsx
import React from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../../components/Button.jsx";
import { apiFetch } from "../../api/client.js";

export default function ContestGeneral() {
  const { contestData, setContestData } = useOutletContext();

  // "YYYY-MM-DDTHH:mm" -> "YYYY-MM-DDTHH:mm:00" (if needed)
  const withSeconds = (s) => (s && s.length === 16 ? `${s}:00` : s || "");

  // For <input type="datetime-local"> we must show "YYYY-MM-DDTHH:mm"
  const toInputValue = (s) => (s ? s.slice(0, 16) : "");

  const handleSave = async () => {
    try {
      const start = withSeconds(contestData.startTime);
      const end = withSeconds(contestData.endTime);

      // Basic validation: both present and end after start
      if (start && end && end <= start) {
        alert("End time must be after start time.");
        return;
      }

      const payload = {
        title: contestData.title || "",
        description: contestData.description || "",
        startTime: start || null, // null if empty
        endTime: end || null,
      };

      const res = await apiFetch(
        `/api/edit/contests/${contestData.id}/generalinfo`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      // If your apiFetch returns a Response, prefer: if (!res.ok) throw ...
      if (!res) throw new Error("Failed to save contest info");

      setContestData({ ...contestData, ...payload });
      alert("Saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save contest info");
    }
  };

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <label className="block font-medium">Title</label>
        <input
          className="w-full border rounded px-2 py-1"
          value={contestData.title || ""}
          onChange={(e) =>
            setContestData({ ...contestData, title: e.target.value })
          }
        />
      </div>

      <div>
        <label className="block font-medium">Description</label>
        <textarea
          className="w-full border rounded px-2 py-1"
          value={contestData.description || ""}
          onChange={(e) =>
            setContestData({ ...contestData, description: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Start Time</label>
          <input
            type="datetime-local"
            step="1" /* allows picking seconds */
            className="w-full border rounded px-2 py-1"
            value={toInputValue(contestData.startTime)}
            onChange={(e) =>
              setContestData({ ...contestData, startTime: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block font-medium">End Time</label>
          <input
            type="datetime-local"
            step="1"
            className="w-full border rounded px-2 py-1"
            value={toInputValue(contestData.endTime)}
            onChange={(e) =>
              setContestData({ ...contestData, endTime: e.target.value })
            }
          />
        </div>
      </div>

      <Button onClick={handleSave}>Save</Button>
    </div>
  );
}
