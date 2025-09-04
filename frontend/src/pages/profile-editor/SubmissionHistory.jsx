import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { apiFetch } from "../../api/client.js";

export default function Submissions() {
  const { profile } = useOutletContext();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    apiFetch(`/api/profile/${profile.username}/submissions`)
      .then((data) => {
        if (!cancelled) setSubmissions(data || []);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [profile.username]);

  if (loading) return <p className="p-4">Loading submissions…</p>;
  if (submissions.length === 0) return <p className="p-4">No submissions yet.</p>;

  return (
    <div className="mt-4 space-y-2">
      {submissions.map((s) => (
        <div key={s.id} className="p-3 border rounded hover:bg-gray-50">
          <div className="flex justify-between">
            <span>{s.problemTitle}</span>
            <span className="text-gray-500">{new Date(s.timestamp).toLocaleString()}</span>
          </div>
          <div className="text-sm text-gray-600">
            Verdict: {s.verdict}, Language: {s.language}, Score: {s.score}
          </div>
        </div>
      ))}
    </div>
  );
}
