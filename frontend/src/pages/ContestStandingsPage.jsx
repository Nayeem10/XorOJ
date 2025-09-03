import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { apiFetch } from "../api/client";

export default function ContestStandingsPage() {
  const { id } = useParams(); // contestId from URL
  const [standings, setStandings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    apiFetch(`/api/standings/contests/${id}`)
      .then((data) => {
        console.log(data);
        // Validate that we got a proper DTO
        if (!data || !data.rows || !Array.isArray(data.rows)) {
          throw new Error("Expected a StandingsDTO with a rows array");
        }
        setStandings(data); // Store the full DTO
      })
      .catch((err) => {
        console.error("Failed to fetch standings", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-gray-500">Loading standings...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!standings) return <p>No standings available</p>;

  const { problemIds, rows, status, startEpochMs, endEpochMs, nowEpochMs } = standings;

  // convert ms → readable time
  const formatTime = (ms) => new Date(ms).toLocaleString();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Contest Standings</h1>
      <p className="mb-4 text-gray-600">
        Status: <span className="font-semibold">{status}</span> | 
        Start: {formatTime(startEpochMs)} | 
        End: {formatTime(endEpochMs)} | 
        Now: {formatTime(nowEpochMs)}
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Rank</th>
              <th className="border px-3 py-2">User</th>
              <th className="border px-3 py-2">Solved</th>
              <th className="border px-3 py-2">Penalty</th>
              {problemIds.map((pid) => (
                <th key={pid} className="border px-3 py-2">P{pid}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.userId} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{idx + 1}</td>
                <td className="border px-3 py-2">{row.username}</td>
                <td className="border px-3 py-2 text-center">{row.solved}</td>
                <td className="border px-3 py-2 text-center">{row.penaltyMinutes}</td>
                {problemIds.map((pid) => {
                  const cell = row.cells[pid];
                  if (!cell) return <td key={pid} className="border px-3 py-2">-</td>;
                  return (
                    <td key={pid} className="border px-3 py-2 text-center">
                      {cell.timeFromStartMin !== null ? (
                        <span className="text-green-600 font-semibold">
                          ✅ {cell.timeFromStartMin}m
                          {cell.rejections > 0 && (
                            <span className="text-red-500"> (-{cell.rejections})</span>
                          )}
                        </span>
                      ) : (
                        cell.rejections > 0 ? (
                          <span className="text-red-500">❌ {cell.rejections}</span>
                        ) : "-"
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
