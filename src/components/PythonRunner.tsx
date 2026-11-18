"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  RotateCcw,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  Code,
  Lightbulb,
} from "lucide-react";

// Singleton Pyodide loader across the client session
let pyodidePromise: Promise<any> | null = null;

export function loadPyodideClient(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Pyodide only runs in the browser"));
  }
  if ((window as any).__pyodideInstance) {
    return Promise.resolve((window as any).__pyodideInstance);
  }
  if (pyodidePromise) {
    return pyodidePromise;
  }

  pyodidePromise = new Promise((resolve, reject) => {
    const initInstance = async () => {
      try {
        const loadPyodideFn = (window as any).loadPyodide;
        if (!loadPyodideFn) {
          throw new Error("window.loadPyodide is not defined");
        }
        const pyodide = await loadPyodideFn({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
        });
        (window as any).__pyodideInstance = pyodide;
        resolve(pyodide);
      } catch (err) {
        pyodidePromise = null;
        reject(err);
      }
    };

    if ((window as any).loadPyodide) {
      initInstance();
      return;
    }

    const existingScript = document.getElementById("pyodide-cdn-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "pyodide-cdn-script";
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
      script.async = true;
      script.onload = () => {
        initInstance();
      };
      script.onerror = () => {
        pyodidePromise = null;
        reject(new Error("Unable to download Pyodide WebAssembly runtime from CDN"));
      };
      document.body.appendChild(script);
    } else {
      existingScript.addEventListener("load", () => initInstance());
    }
  });

  return pyodidePromise;
}

// L5 Empathetic Error Translator for Class 10 CBSE Learners
function translatePythonError(errStr: string): { type: string; message: string; tip: string } {
  if (errStr.includes("IndentationError")) {
    return {
      type: "Indentation Error",
      message: errStr.split("IndentationError:")[1]?.trim() || "Unexpected or unaligned indentation",
      tip: "Lines inside a for loop or if statement must be indented by 4 spaces. Make sure all body lines line up evenly!",
    };
  }
  if (errStr.includes("SyntaxError")) {
    const isColon = errStr.includes("expected ':'") || errStr.includes("invalid syntax");
    return {
      type: "Syntax Error",
      message: errStr.split("SyntaxError:")[1]?.trim() || "Python could not read this line",
      tip: isColon
        ? "Did you forget a colon ':' at the end of your for loop or if statement? Every loop header must end with ':'."
        : "Check your punctuation, quotes, or matching parentheses around this line.",
    };
  }
  if (errStr.includes("NameError")) {
    return {
      type: "Name Error",
      message: errStr.split("NameError:")[1]?.trim() || "Variable is not defined",
      tip: "Python encountered a variable it hasn't seen yet. Check for spelling typos, or make sure you initialized it (e.g. total = 0) before the loop!",
    };
  }
  if (errStr.includes("ZeroDivisionError")) {
    return {
      type: "Zero Division Error",
      message: errStr.split("ZeroDivisionError:")[1]?.trim() || "Division or modulo by zero",
      tip: "You cannot divide or modulo by 0. Check your range start or divisor values.",
    };
  }
  if (errStr.includes("TypeError")) {
    return {
      type: "Type Error",
      message: errStr.split("TypeError:")[1]?.trim() || "Incompatible data types",
      tip: "Check the values you are combining. Remember that range() requires integer numbers, not strings or floats.",
    };
  }
  return {
    type: "Python Execution Notice",
    message: errStr.replace(/^Traceback[\s\S]*?\n/, "").trim() || "Execution interrupted",
    tip: "Take a calm breath! Review each line from top to bottom. Every error gives us a clue.",
  };
}

// Safety check to prevent browser hangs on infinite while loops
function detectUnboundedLoop(code: string): string | null {
  const lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (
      (trimmed.startsWith("while True:") || trimmed.startsWith("while 1:")) &&
      !code.includes("break")
    ) {
      return "Infinite Loop Guard: 'while True:' detected without a 'break' statement. Add a break condition so your browser tab does not freeze.";
    }
  }
  return null;
}

export interface PythonRunnerProps {
  initialCode?: string;
  code?: string;
  onChange?: (code: string) => void;
  onOutputChange?: (output: string) => void;
  title?: string;
  subtitle?: string;
  minHeight?: string;
  showReset?: boolean;
  embeddedMode?: boolean;
  className?: string;
}

export default function PythonRunner({
  initialCode = 'for i in range(1, 6):\n    print("*" * i)',
  code: controlledCode,
  onChange,
  onOutputChange,
  title = "Interactive Python Terminal & Runner",
  subtitle = "Run live Python 3 in your browser (Pyodide WebAssembly)",
  minHeight = "160px",
  showReset = true,
  embeddedMode = false,
  className = "",
}: PythonRunnerProps) {
  const [internalCode, setInternalCode] = useState<string>(controlledCode ?? initialCode);
  const activeCode = controlledCode !== undefined ? controlledCode : internalCode;

  const [pyodideReady, setPyodideReady] = useState<boolean>(false);
  const [isLoadingPyodide, setIsLoadingPyodide] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [output, setOutput] = useState<string>("");
  const [errorInfo, setErrorInfo] = useState<{ type: string; message: string; tip: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Sync internal state when initialCode or controlledCode changes
  useEffect(() => {
    if (controlledCode !== undefined) {
      setInternalCode(controlledCode);
    }
  }, [controlledCode]);

  // Pre-load Pyodide on component mount
  useEffect(() => {
    let isMounted = true;
    setIsLoadingPyodide(true);

    loadPyodideClient()
      .then(() => {
        if (isMounted) {
          setPyodideReady(true);
          setIsLoadingPyodide(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setIsLoadingPyodide(false);
          console.warn("Pyodide pre-load note:", err?.message);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCodeChange = (newVal: string) => {
    setInternalCode(newVal);
    if (onChange) {
      onChange(newVal);
    }
    setErrorInfo(null);
  };

  // Ergonomic Tab & Enter key handling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to Run
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRunCode();
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    // Handle Tab key -> Insert 4 spaces
    if (e.key === "Tab") {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentVal = activeCode;

      if (e.shiftKey) {
        // Shift+Tab: Unindent current line
        const before = currentVal.substring(0, start);
        const lastNewLine = before.lastIndexOf("\n");
        const lineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;
        const lineText = currentVal.substring(lineStart);

        if (lineText.startsWith("    ")) {
          const nextVal = currentVal.substring(0, lineStart) + currentVal.substring(lineStart + 4);
          handleCodeChange(nextVal);
          setTimeout(() => {
            textarea.selectionStart = Math.max(lineStart, start - 4);
            textarea.selectionEnd = Math.max(lineStart, end - 4);
          }, 0);
        }
      } else {
        // Tab: Insert 4 spaces
        const nextVal = currentVal.substring(0, start) + "    " + currentVal.substring(end);
        handleCodeChange(nextVal);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }, 0);
      }
      return;
    }

    // Handle Enter key -> Preserve indentation + 4 extra spaces after ':'
    if (e.key === "Enter") {
      const start = textarea.selectionStart;
      const currentVal = activeCode;
      const beforeCursor = currentVal.substring(0, start);
      const lastNewLine = beforeCursor.lastIndexOf("\n");
      const currentLine = beforeCursor.substring(lastNewLine === -1 ? 0 : lastNewLine + 1);

      // Find current indentation
      const matchIndent = currentLine.match(/^(\s*)/);
      let indent = matchIndent ? matchIndent[1] : "";

      // If line ends with ':', add 4 more spaces
      if (currentLine.trim().endsWith(":")) {
        indent += "    ";
      }

      e.preventDefault();
      const afterCursor = currentVal.substring(start);
      const nextVal = beforeCursor + "\n" + indent + afterCursor;
      handleCodeChange(nextVal);

      setTimeout(() => {
        const newCursorPos = start + 1 + indent.length;
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      }, 0);
    }
  };

  // Keep line numbers scrolled in sync with the textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Real execution in Pyodide
  const handleRunCode = async () => {
    setErrorInfo(null);
    setOutput("");

    // 1. Safety check
    const safetyWarning = detectUnboundedLoop(activeCode);
    if (safetyWarning) {
      setErrorInfo({
        type: "Safety Guard Triggered",
        message: safetyWarning,
        tip: "Loops must have a clear ending condition. Use 'for i in range(...):' or add a 'break' statement.",
      });
      return;
    }

    setIsRunning(true);

    try {
      const pyodide = await loadPyodideClient();
      setPyodideReady(true);

      // Redirect stdout and stderr using Python's io.StringIO
      await pyodide.runPythonAsync(`
import sys
import io
_py_stdout_buffer = io.StringIO()
_py_stderr_buffer = io.StringIO()
sys.stdout = _py_stdout_buffer
sys.stderr = _py_stderr_buffer
`);

      // Run user's Python code
      await pyodide.runPythonAsync(activeCode);

      // Collect stdout & stderr
      const stdout = await pyodide.runPythonAsync(`_py_stdout_buffer.getvalue()`);
      const stderr = await pyodide.runPythonAsync(`_py_stderr_buffer.getvalue()`);

      const cleanOut = (stdout || "").replace(/\r\n/g, "\n");
      const cleanErr = (stderr || "").replace(/\r\n/g, "\n");

      if (cleanErr && !cleanOut) {
        const translated = translatePythonError(cleanErr);
        setErrorInfo(translated);
      } else {
        const finalOutput = cleanOut || (cleanErr ? cleanErr : "# (Code executed successfully with no print output)");
        setOutput(finalOutput);
        if (onOutputChange) {
          onOutputChange(finalOutput);
        }
      }
    } catch (err: any) {
      const errStr = err?.message || String(err);
      const translated = translatePythonError(errStr);
      setErrorInfo(translated);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    handleCodeChange(initialCode);
    setOutput("");
    setErrorInfo(null);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate line numbers
  const lineCount = Math.max(activeCode.split("\n").length, 3);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden text-xs ${className}`}
    >
      {/* Top Header Bar */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-600 shrink-0" />
          <div>
            <span className="font-bold text-slate-800 text-xs">{title}</span>
            {!embeddedMode && (
              <span className="hidden sm:inline text-[11px] text-slate-500 ml-2">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Runtime Status Pill */}
        <div className="flex items-center gap-2">
          {isLoadingPyodide ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono font-medium animate-pulse">
              <Sparkles className="w-3 h-3 text-amber-600 animate-spin" />
              Loading Python 3...
            </span>
          ) : pyodideReady ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Python 3 Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono">
              Ready on First Run
            </span>
          )}

          {showReset && (
            <button
              type="button"
              onClick={handleReset}
              className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200 transition cursor-pointer"
              title="Reset Code to Original"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200 transition cursor-pointer"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Code Editor Window */}
      <div className="relative bg-[#181825] flex divide-x divide-slate-800 font-mono text-xs">
        {/* Line Numbers Column */}
        <div
          ref={lineNumbersRef}
          className="select-none py-3 px-2 text-right text-slate-600 bg-[#11111b] overflow-hidden shrink-0 text-[11px] leading-5 min-w-[38px]"
        >
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={activeCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            style={{ minHeight }}
            placeholder="# Write your Python code here..."
            className="w-full h-full p-3 bg-transparent text-[#CDD6F4] font-mono text-xs leading-5 resize-y focus:outline-none focus:ring-0 selection:bg-indigo-900 selection:text-white"
          />
        </div>
      </div>

      {/* Editor Action Controls */}
      <div className="bg-slate-50/90 border-t border-slate-200/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500 font-sans">
          Shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono text-[10px]">Tab</kbd> indents 4 spaces · <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono text-[10px]">Ctrl+Enter</kbd> runs
        </span>

        <button
          type="button"
          onClick={handleRunCode}
          disabled={isRunning}
          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Running Python...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>▶ Run Code</span>
            </>
          )}
        </button>
      </div>

      {/* L5 Empathetic Error Display */}
      {errorInfo && (
        <div className="p-3.5 bg-amber-50/80 border-t border-amber-200 text-xs text-amber-950 space-y-2 animate-fade-in font-sans">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-900 flex items-center gap-2">
                <span>{errorInfo.type}</span>
                <span className="text-[10px] font-mono font-normal bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                  No stress — easily fixed!
                </span>
              </div>
              <p className="font-mono text-[11px] text-amber-800">{errorInfo.message}</p>
            </div>
          </div>

          <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/80 flex items-start gap-2 text-slate-700 text-[11px]">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p>{errorInfo.tip}</p>
          </div>
        </div>
      )}

      {/* Terminal Output Display */}
      {output && !errorInfo && (
        <div className="border-t border-slate-200 animate-fade-in">
          <div className="bg-[#11111b] px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Console Output (sys.stdout):
            </span>
            <span className="text-[10px] text-slate-500 font-sans">Preserves spacing & star alignment</span>
          </div>
          <div className="bg-[#181825] p-3.5 overflow-x-auto text-xs font-mono text-emerald-400 max-h-48 leading-relaxed whitespace-pre selection:bg-emerald-900 selection:text-white">
            {output}
          </div>
        </div>
      )}
    </div>
  );
}
