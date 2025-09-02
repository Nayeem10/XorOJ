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
    int n; 
    if(!(cin >> n)) return 0;
    long long sum = 0;
    for(int i=0;i<n;i++){
        long long x; cin >> x;
        sum += x;
    }
    cout << sum << "\\n";
    return 0;
}
`,
    java: `import java.io.*;
import java.util.*;
public class Main {
    public static void main(String[] args) throws Exception {
        var sc = new Scanner(System.in);
        int n = sc.hasNextInt() ? sc.nextInt() : 0;
        long sum = 0;
        for(int i=0;i<n;i++){
            if(sc.hasNextLong()) sum += sc.nextLong();
        }
        System.out.println(sum);
    }
}
`,
    python: `import sys
data = sys.stdin.read().strip().split()
if not data:
    print(0)
    sys.exit(0)
n = int(data[0])
nums = list(map(int, data[1:1+n]))
print(sum(nums))
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
      // IMPORTANT: send "stdin" (most judge APIs expect this key)
      const data = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,     // keep if your backend uses it
          stdin: stdinText,
        }),
      });

      const normalized = normalizeResult(data);
      setResult(normalized);
      onResult?.(normalized);

      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.log("judge response:", data);
      }
    } catch (e) {
      setError(e?.message || "Run failed");
    } finally {
      setLoading(false);
    }
  }, [canRun, code, language, stdinText, endpoint, onResult]);

  // Ctrl/Cmd + Enter
  useEffect(() => {
    const handler = (e) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [runCode]);

  return (
    <div className="w-full h-full flex flex-col min-h-0 p-4 space-y-4">
      <header className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {showLanguageSelector && (
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border rounded px-2 py-1"
              aria-label="Language"
            >
              <option value="cpp">C++17</option>
              <option value="java">Java 17</option>
              <option value="python">Python 3</option>
            </select>
          )}

          <button
            onClick={runCode}
            disabled={!canRun}
            className={`px-3 py-1 rounded ${canRun
              ? "bg-black text-white"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            title="Run (Ctrl/Cmd + Enter)"
          >
            {loading ? "Running…" : "Run"}
          </button>
        </div>
      </header>

      <section className="grid grid-rows-5 h-full">
        {/* Code editor (Monaco) */}

        <section className="space-y-2 row-span-3 min-h-40 flex flex-col">
          <label className="text-sm font-medium">Code Editor</label>
          <div className="flex-1 min-h-0">
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
            className="w-full min-h-20 font-mono text-sm border rounded p-3 resize-y"
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
            <pre className="w-full h-20 border rounded p-3 overflow-auto whitespace-pre-wrap">
              {result
                ? (result.stdout?.length > 0
                  ? String(result.stdout)
                  : <span className="text-gray-400">No output</span>)
                : <span className="text-gray-400">—</span>}
            </pre>
          </div>

          <div className="space-y-2">
            <h2 className="font-semibold flex items-center gap-2">Errors
              {result?.exitCode !== undefined && (
                <span className="text-xs text-gray-500">(exit code: {result.exitCode})</span>
              )}
            </h2>
            <pre className={`w-full h-20 border rounded p-3 overflow-auto whitespace-pre-wrap ${result?.stderr?.length > 0 ? 'bg-red-50 border-red-300 text-red-700' : ''}`}>
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
  if (!result) return (
    <div className="text-xs text-gray-500">time: — | memory: —</div>
  );
  return (
    <div className="text-xs text-gray-600">
      time: <span className="font-mono">{String(result.time ?? "—")}</span>
      {"  "} | memory:{" "}
      <span className="font-mono">{String(result.memory ?? "—")}</span>
    </div>
  );
}
