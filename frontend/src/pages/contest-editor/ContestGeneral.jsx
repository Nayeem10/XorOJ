// src/pages/contest-editor/ContestGeneral.jsx
import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { apiFetch } from "../../api/client";

/** Convert an ISO string to a value acceptable by <input type="datetime-local" /> */
function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // Pad helper
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

/** Convert from <input datetime-local> value back to ISO */
function fromLocalInputValue(s) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export default function ContestGeneral() {
  const { contestData, setContestData } = useOutletContext();

  const [title, setTitle] = useState(contestData.title || "");
  const [description, setDescription] = useState(contestData.description || "");
  const [startLocal, setStartLocal] = useState(toLocalInputValue(contestData.startTime));
  const [endLocal, setEndLocal] = useState(toLocalInputValue(contestData.endTime));

  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  // Derived JS dates
  const startDate = useMemo(
    () => (startLocal ? new Date(startLocal) : null),
    [startLocal]
  );
  const endDate = useMemo(
    () => (endLocal ? new Date(endLocal) : null),
    [endLocal]
  );

  // Validation rules
  const errors = useMemo(() => {
    const e = {};
    if (!title.trim()) e.title = "Title is required.";
    if (!startDate || Number.isNaN(startDate.getTime()))
      e.startTime = "Start time is required.";
    if (!endDate || Number.isNaN(endDate.getTime()))
      e.endTime = "End time is required.";
    if (!e.startTime && !e.endTime && endDate <= startDate)
      e.endTime = "End time must be after start time.";
    return e;
  }, [title, startDate, endDate]);

  const isValid = Object.keys(errors).length === 0;

  // When parent contestData changes (e.g., loaded from server), sync local fields
  useEffect(() => {
    setTitle(contestData.title || "");
    setDescription(contestData.description || "");
    setStartLocal(toLocalInputValue(contestData.startTime));
    setEndLocal(toLocalInputValue(contestData.endTime));
  }, [contestData.id]); // re-sync only when switching contest or initial load

  async function onSave(e) {
    e.preventDefault();
    setSaveErr("");
    if (!isValid) return;

    setSaving(true);
    try {
      const payload = {
        ...contestData,
        title: title.trim(),
        description,
        startTime: fromLocalInputValue(startLocal),
        endTime: fromLocalInputValue(endLocal),
      };

      // PUT update (adjust path/method to your API if needed)
      const updated = await apiFetch(`/api/contests/${contestData.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      // Reflect changes upward
      setContestData(updated || payload);
    } catch (err) {
      setSaveErr(err?.message || "Failed to save contest.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSave} className="space-y-5 max-w-2xl">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          className={`input input-bordered w-full ${errors.title ? "input-error" : ""}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. XorOJ Weekly #1"
        />
        {errors.title && (
          <p className="text-red-600 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="textarea textarea-bordered w-full min-h-[100px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional: short info, rules, editorial links…"
        />
      </div>

      {/* Start time */}
      <div>
        <label className="block text-sm font-medium mb-1">Start time *</label>
        <input
          type="datetime-local"
          className={`input input-bordered w-full ${errors.startTime ? "input-error" : ""}`}
          value={startLocal}
          onChange={(e) => setStartLocal(e.target.value)}
          // UX: don't allow past (optional; comment out if not desired)
          min={toLocalInputValue(new Date().toISOString())}
        />
        {errors.startTime && (
          <p className="text-red-600 text-sm mt-1">{errors.startTime}</p>
        )}
      </div>

      {/* End time */}
      <div>
        <label className="block text-sm font-medium mb-1">End time *</label>
        <input
          type="datetime-local"
          className={`input input-bordered w-full ${errors.endTime ? "input-error" : ""}`}
          value={endLocal}
          onChange={(e) => setEndLocal(e.target.value)}
          // UX: set minimum end >= start (when start chosen)
          min={startLocal || undefined}
        />
        {errors.endTime && (
          <p className="text-red-600 text-sm mt-1">{errors.endTime}</p>
        )}
      </div>

      {/* Save actions */}
      {saveErr && <p className="text-red-600 text-sm">{saveErr}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!isValid || saving}
          title={!isValid ? "Please fix form errors before saving" : "Save"}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
