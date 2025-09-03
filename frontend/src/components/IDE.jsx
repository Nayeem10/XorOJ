import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";
import CodeEditor from "./CodeEditor";

// You can pass initialCode/stdin from parent if you want.
// Also override endpoint if needed.
export default function IDE({
  endpoint = "/api/submissions/test",
  defaultLanguage = "cpp",
  initialCode,
  initialStdin = "5\n90 12 33 33 45\n",
  showLanguageSelector = true,
  onResult, // optional callback(result)
}) {
  const DEFAULT_SNIPPETS = {
    cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n; cin >> n;
    
    return 0;
}
`,
    java: `import java.io.*;
import java.util.*;
public class Main {
    public static void main(String[] args) throws Exception {
        var sc = new Scanner(System.in);
        int n = sc.hasNextInt() ? sc.nextInt() : 0;
    }
}
`,
    python: `import sys
data = sys.stdin.read().strip().split()
if not data:
    print(0)
    sys.exit(0)
n = int(data[0])
`,
  };

  const [language, setLanguage] = useState(defaultLanguage);
  const [code, setCode] = useState(
    initialCode ?? DEFAULT_SNIPPETS[defaultLanguage] ?? ""
  );
  const [stdinText, setStdinText] = useState(initialStdin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { stdout, stderr, time, memory }

  // If user changes language, load that snippet (only if no custom initialCode)
  useEffect(() => {
    if (initialCode == null) {
      setCode(DEFAULT_SNIPPETS[language] || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const canRun = useMemo(
    () => code.trim().length > 0 && !loading,
    [code, loading]
  );

  // Normalize various backend field names so UI always shows results.
  const normalizeResult = (d) => ({
    stdout: d?.stdout ?? d?.out ?? "",
    stderr: d?.stderr ?? d?.error ?? "",
    time: d?.timeused ?? d?.timeUsedMillis ?? d?.time_ms ?? "",
    memory: d?.memoryused ?? d?.memoryUsedKB ?? d?.memory_kb ?? "",
  });

  const runCode = useCallback(async () => {
    if (!canRun) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          stdin: stdinText,
        }),
      });

      const normalized = normalizeResult(data);
      setResult(normalized);
      onResult?.(normalized);
    } catch (e) {
      setError(e?.message || "Run failed");
    } finally {
      setLoading(false);
    }
  }, [canRun, code, language, stdinText, endpoint, onResult]);

  // Ctrl/Cmd + Enter
  useEffect(() => {
    const handler = (e) => {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [runCode]);

  return (
    <div className="w-full h-full flex flex-col p-3 sm:p-4 space-y-4">
      <div className="flex gap-3 align-left sm:justify-between">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border rounded px-2 py-1 w-full xs:w-auto"
          aria-label="Language"
        >
          <option value="cpp">C++17</option>
          <option value="java">Java 17</option>
          <option value="python">Python 3</option>
        </select>

        <button
          onClick={runCode}
          disabled={!canRun}
          className={`px-3 py-1 rounded w-full xs:w-auto ${canRun
            ? "bg-black text-white"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          title="Run (Ctrl/Cmd + Enter)"
        >
          {loading ? "Running…" : "Run"}
        </button>
      </div>

      {/* Main content stacks on mobile; grows on larger screens */}
      <section className="flex-1 flex flex-col gap-4">
        {/* Code editor (Monaco) */}
        <section className="space-y-2 flex flex-col">
          <label className="text-sm font-medium">Code Editor</label>
          {/* Responsive height for editor container */}
          <div className="flex-1 min-h-[10vh] sm:min-h-[35vh] md:min-h-[40vh] lg:min-h-[45vh]">
            <CodeEditor
              language={language}
              value={code}
              onChange={setCode}
              height="100%"
            />
          </div>
        </section>

        {/* Text box for stdin */}
        <section className="space-y-2">
          <label className="text-sm font-medium">Program Input (STDIN)</label>
          <textarea
            value={stdinText}
            onChange={(e) => setStdinText(e.target.value)}
            className="w-full  font-mono text-sm border rounded p-3 resize-y"
            placeholder="Provide input for your program…"
          />
        </section>

        {/* Results */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Output</h2>
              <Metrics result={result} />
            </div>
            <pre className="w-full  border rounded p-3 overflow-auto whitespace-pre-wrap">
              {result
                ? (result.stdout?.length > 0
                  ? String(result.stdout)
                  : <span className="text-gray-400">No output</span>)
                : <span className="text-gray-400">—</span>}
            </pre>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold flex items-center gap-2">
              Errors
              {result?.exitCode !== undefined && (
                <span className="text-xs text-gray-500">
                  (exit code: {result.exitCode})
                </span>
              )}
            </h2>
            <pre
              className={`w-full  border rounded p-3 overflow-auto whitespace-pre-wrap ${result?.stderr?.length > 0
                  ? "bg-red-50 border-red-300 text-red-700"
                  : ""
                }`}
            >
              {result
                ? (result.stderr?.length > 0
                  ? String(result.stderr)
                  : <span className="text-gray-400">No errors</span>)
                : <span className="text-gray-400">—</span>}
            </pre>
          </div>
        </section>
      </section>

      {error && (
        <div className="border border-red-300 bg-red-50 text-red-700 rounded p-3">
          {error}
        </div>
      )}
    </div>
  );
}

function Metrics({ result }) {
  if (!result) {
    return <div className="text-xs text-gray-500">time: — | memory: —</div>;
  }
  return (
    <div className="text-xs text-gray-600">
      time: <span className="font-mono">{String(result.time ?? "—")}</span>
      {"  "} | memory:{" "}
      <span className="font-mono">{String(result.memory ?? "—")}</span>
    </div>
  );
}
