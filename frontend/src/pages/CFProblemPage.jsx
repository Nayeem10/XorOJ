import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

function parseCfId(id) {
  // Supports "1234A", "1234a", "1234/A", "1234/A1" (edu sometimes)
  // Extract leading digits as contestId, rest (letters+digits) as index
  // Also supports "1234- A" or "1234_A" with separators.
  const cleaned = String(id).trim().replace(/[-_\s]/g, "/");
  const m1 = cleaned.match(/^(\d+)\/?([A-Za-z0-9]+)?$/);
  if (m1) {
    const contestId = Number(m1[1]);
    let index = (m1[2] || "").toUpperCase();
    if (!index) {
      // If given like "1234A" without slash, try to split trailing letters+digits
      const raw = String(id).trim();
      const m2 = raw.match(/^(\d+)([A-Za-z][A-Za-z0-9]*)$/);
      if (m2) {
        return { contestId: Number(m2[1]), index: m2[2].toUpperCase() };
      }
    }
    return { contestId, index };
  }
  // Fallback: try "1234A" shape
  const m2 = String(id).trim().match(/^(\d+)([A-Za-z][A-Za-z0-9]*)$/);
  if (m2) return { contestId: Number(m2[1]), index: m2[2].toUpperCase() };
  return { contestId: NaN, index: "" };
}

export default function CFProblemPage() {
  const { id } = useParams(); // e.g., "1729A" or "1729/A"
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [problem, setProblem] = useState(null);
  const [stats, setStats] = useState(null);

  const { contestId, index } = useMemo(() => parseCfId(id), [id]);

  useEffect(() => {
    if (!contestId || !index) {
      setErr("Invalid Codeforces ID. Use forms like 1729A or 1729/A.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErr(null);

    // CF API endpoint returns all problems + stats; we'll filter client-side.
    // https://codeforces.com/api/problemset.problems
    fetch("https://codeforces.com/api/problemset.problems")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to reach Codeforces API");
        return r.json();
      })
      .then((json) => {
        if (json.status !== "OK") throw new Error("Codeforces API error");
        const allProblems = json.result.problems || [];
        const allStats = json.result.problemStatistics || [];

        const p = allProblems.find(
          (x) => x.contestId === contestId && String(x.index).toUpperCase() === index
        );
        const s = allStats.find(
          (x) => x.contestId === contestId && String(x.index).toUpperCase() === index
        );

        if (!p) throw new Error("Problem not found in Codeforces problemset.");
        setProblem(p);
        setStats(s || null);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [contestId, index]);

  const title = problem ? `${problem.index}. ${problem.name}` : `Codeforces ${id}`;
  const tags = problem?.tags || [];
  const rating = problem?.rating;
  const solvedCount = stats?.solvedCount;

  // Build useful links
  const problemUrl = problem
    ? `https://codeforces.com/contest/${contestId}/problem/${index}`
    : "#";
  const submitUrl = problem
    ? `https://codeforces.com/contest/${contestId}/submit/${index}`
    : "#";

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1 p-4">
        <div className="max-w-5xl mx-auto">
          {/* Loading / Error */}
          {loading && (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          )}

          {err && (
            <div className="alert alert-error shadow mb-4">
              <span>{err}</span>
            </div>
          )}

          {!loading && !err && problem && (
            <>
              {/* Header */}
              <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
                  <p className="text-gray-500">
                    Codeforces • Contest {contestId} • Problem {index}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={problemUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn"
                    title="Open full problem statement on Codeforces"
                  >
                    View Statement
                  </a>
                  <a
                    href={submitUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    title="Submit your solution on Codeforces"
                  >
                    Submit
                  </a>
                </div>
              </section>

              {/* Meta */}
              <section className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-base-300 p-4">
                  <div className="text-sm text-gray-500">Difficulty</div>
                  <div className="text-lg font-semibold">
                    {rating ? rating : "—"}
                  </div>
                </div>
                <div className="rounded-xl border border-base-300 p-4">
                  <div className="text-sm text-gray-500">Solved Count</div>
                  <div className="text-lg font-semibold">
                    {typeof solvedCount === "number" ? solvedCount : "—"}
                  </div>
                </div>
                <div className="rounded-xl border border-base-300 p-4">
                  <div className="text-sm text-gray-500">Tags</div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {tags.length ? (
                      tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-1 rounded-full text-xs bg-base-200"
                        >
                          {t}
                        </span>
                      ))
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </div>
              </section>

              {/* Statement placeholder & notes */}
              <section className="mt-6 rounded-xl border border-base-300 p-4">
                <h2 className="text-xl font-semibold mb-2">Problem Statement</h2>
                <p className="text-gray-600">
                  The full statement, time/memory limits, and sample tests are not
                  provided by the public Codeforces API. Use{" "}
                  <a
                    href={problemUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="link link-primary"
                  >
                    the official problem page
                  </a>{" "}
                  to read the statement and examples.
                </p>
              </section>

              {/* Helpful links */}
              <section className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`https://codeforces.com/contest/${contestId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost"
                >
                  Contest Page
                </a>
                <a
                  href={`https://codeforces.com/problemset/problem/${contestId}/${index}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost"
                >
                  Problem (Problemset URL)
                </a>
                <a
                  href={`https://codeforces.com/contest/${contestId}/status/${index}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost"
                >
                  Submissions
                </a>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
