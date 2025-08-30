// src/components/CodeEditorPanel.jsx
import React, { useMemo } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import Button from "./Button";

const LANG_MAP = {
  cpp: "cpp",
  py: "python",
  java: "java",
};

export default function CodeEditorPanel({
  initialCode = "// Write your code here\n",
  initialLanguage = "cpp",
  languages = [
    { value: "cpp", label: "C++" },
    { value: "py", label: "Python" },
    { value: "java", label: "Java" },
  ],
  height = "420px",
  submitting = false,
  message = null,
  onSubmit = () => {},
  onChange, // optional: ({ code, language }) => void
}) {
  const [language, setLanguage] = React.useState(initialLanguage);
  const [code, setCode] = React.useState(initialCode);
  const monaco = useMonaco();

  // Register custom completions and keybindings once Monaco is ready
  React.useEffect(() => {
    if (!monaco) return;

    // Prevent duplicate registrations across hot reloads
    if (!window.__xorojProviders) window.__xorojProviders = {};

    // --- Custom completion providers (simple snippets) ---
    const registerSnippets = (langId, suggestions) => {
      const key = `provider:${langId}`;
      if (window.__xorojProviders[key]) return; // already registered
      const disposable = monaco.languages.registerCompletionItemProvider(langId, {
        triggerCharacters: [".", ">"],
        provideCompletionItems: (model, position) => {
          return { suggestions };
        },
      });
      window.__xorojProviders[key] = disposable;
    };

    // C++ snippets (fast I/O, loop macro, vector)
    registerSnippets("cpp", [
      {
        label: "fastio",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: [
          "ios::sync_with_stdio(false);",
          "cin.tie(nullptr);",
        ].join("\n"),
        detail: "Fast I/O (C++)",
      },
      {
        label: "fori",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "for (int i = 0; i < ${1:n}; ++i) {${2:// ...}}",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: "for loop (C++)",
      },
      {
        label: "vector<int>",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "std::vector<int> v(${1:n});",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: "std::vector snippet",
      },
    ]);

    // Python snippets
    registerSnippets("python", [
      {
        label: "main",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText:
          "def main():\n    ${1:pass}\n\nif __name__ == \"__main__\":\n    main()\n",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: "main guard (Python)",
      },
      {
        label: "fastio",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText:
          "import sys\ninput = sys.stdin.readline\n",
        detail: "Fast I/O (Python)",
      },
    ]);

    // Java snippets
    registerSnippets("java", [
      {
        label: "MainFastIO",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: [
          "import java.io.*;",
          "import java.util.*;",
          "public class Main {",
          "  public static void main(String[] args) throws Exception {",
          "    FastScanner fs = new FastScanner(System.in);",
          "    PrintWriter out = new PrintWriter(new BufferedWriter(new OutputStreamWriter(System.out)));",
          "    ${1:// ...}",
          "    out.flush();",
          "  }",
          "  static class FastScanner {",
          "    private final InputStream in; private final byte[] buffer = new byte[1<<16]; private int ptr=0, len=0;",
          "    FastScanner(InputStream is){in=is;}",
          "    private int read() throws IOException {",
          "      if (ptr>=len){ len=in.read(buffer); ptr=0; if (len<=0) return -1; }",
          "      return buffer[ptr++];",
          "    }",
          "    String next() throws IOException {",
          "      StringBuilder sb=new StringBuilder(); int c; while((c=read())!=-1 && c<=32);",
          "      if (c==-1) return null; do{ sb.append((char)c); } while((c=read())!=-1 && c>32);",
          "      return sb.toString();",
          "    }",
          "    int nextInt() throws IOException { return Integer.parseInt(next()); }",
          "    long nextLong() throws IOException { return Long.parseLong(next()); }",
          "  }",
          "}",
        ].join("\n"),
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        detail: "Java template with FastScanner",
      },
    ]);

    // --- Example: simple diagnostics/markers (toy rule) ---
    // Warn if file is empty or too short for the chosen language
    const model = monaco.editor.getModels()[0];
    const setMarkers = () => {
      if (!model) return;
      const text = model.getValue();
      const markers = [];
      if (text.trim().length === 0) {
        markers.push({
          severity: monaco.MarkerSeverity.Warning,
          message: "Source is empty.",
          startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1,
        });
      }
      monaco.editor.setModelMarkers(model, "xoroj-checks", markers);
    };
    setMarkers();

    // Re-check on edits
    const sub = monaco.editor.onDidChangeMarkers(() => {});
    return () => {
      sub.dispose();
      // disposables in window.__xorojProviders kept for hot-reload session; let them live
    };
  }, [monaco]);

  const monacoLang = useMemo(() => LANG_MAP[language] ?? "cpp", [language]);

  function handleSubmitClick() {
    onSubmit({ code, language });
  }

  return (
    <div className="flex flex-col space-y-3">
      {/* Language Picker */}
      <select
        value={language}
        onChange={(e) => {
          const next = e.target.value;
          setLanguage(next);
          onChange?.({ code, language: next });
        }}
        className="w-40 rounded-md border px-2 py-1"
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>

      {/* Monaco Editor */}
      <Editor
        height={height}
        defaultLanguage={monacoLang}
        defaultValue={initialCode}
        theme={matchMedia("(prefers-color-scheme: dark)").matches ? "vs-dark" : "light"}
        onChange={(value) => {
          setCode(value ?? "");
          onChange?.({ code: value ?? "", language });
        }}
        onMount={(editor, monaco) => {
          // change language dynamically as state changes
          editor.updateOptions({
            // Editor feel
            fontSize: 14,
            fontLigatures: true,
            minimap: { enabled: false },
            automaticLayout: true,
            wordWrap: "on",
            tabSize: 4,
            insertSpaces: true,
            renderWhitespace: "selection",
            quickSuggestions: { other: true, comments: false, strings: true },
            parameterHints: { enabled: true },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            autoClosingBrackets: "languageDefined",
            autoClosingQuotes: "languageDefined",
            formatOnPaste: false, // formatters not bundled for cpp/java/py
            smoothScrolling: true,
            scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
          });

          // Keybinding: Ctrl/Cmd + Enter -> submit
          editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
            () => onSubmit({ code: editor.getValue(), language })
          );

          // Keep model language in sync when user changes dropdown
          // (onMount runs once; we’ll watch language changes below)
        }}
      />

      {/* When language changes, switch Monaco model language */}
      <LanguageSync language={monacoLang} />

      <div className="flex items-center gap-3">
        <Button onClick={handleSubmitClick} loading={submitting}>
          Submit
        </Button>
        {message && <span className="text-gray-600">{message}</span>}
      </div>
    </div>
  );
}

/** Keeps the current editor model's language in sync with prop changes. */
function LanguageSync({ language }) {
  const monaco = useMonaco();
  React.useEffect(() => {
    if (!monaco) return;
    const model = monaco.editor.getModels()[0];
    if (model) monaco.editor.setModelLanguage(model, language);
  }, [language, monaco]);
  return null;
}
