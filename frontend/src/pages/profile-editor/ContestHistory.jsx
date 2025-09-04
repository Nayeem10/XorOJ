import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { apiFetch } from "../../api/client.js";

export default function ContestHistory() {
  const { profile } = useOutletContext();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    apiFetch(`/api/profile/${profile.username}/contests`)
      .then((data) => {
        if (!cancelled) setContests(data || []);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [profile.username]);

  if (loading) return <p className="p-4">Loading contest history…</p>;
  if (contests.length === 0) return <p className="p-4">No contests participated yet.</p>;

  return (
    <div className="mt-4 space-y-2">
      {contests.map((c) => (
        <div key={c.id} className="p-3 border rounded hover:bg-gray-50">
          <div className="flex justify-between">
            <span>{c.name}</span>
            <span className="text-gray-500">{new Date(c.date).toLocaleDateString()}</span>
          </div>
          <div className="text-sm text-gray-600">
            Rank: {c.rank}, Score: {c.score}
          </div>
        </div>
      ))}
    </div>
  );
}
