"use client";

import React, { useState } from "react";
import { CheckCircle2, Sparkles, Bug, Play, Terminal } from "lucide-react";
import PythonRunner from "@/components/PythonRunner";

export interface BugFixOption {
  id: string;
  label: string;
  detail?: string;
  isCorrect?: boolean;
}

interface BugFixExplainerProps {
  buggyCode: string;
  options?: BugFixOption[];
  expectedOutputSummary?: string;
  onSubmit: (fixChoice: string, explanation: string) => void;
  isLoading?: boolean;
}

export default function BugFixExplainer({
  buggyCode,
  options,
  expectedOutputSummary = "Test your fix in the live runner before submitting",
  onSubmit,
  isLoading = false,
}: BugFixExplainerProps) {
  const [selectedFix, setSelectedFix] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [activeCode, setActiveCode] = useState<string>(buggyCode);
  const [liveOutput, setLiveOutput] = useState<string>("");

  const fallbackOptions: BugFixOption[] = [
    {
      id: "opt_both",
      label: "Change range(1, 5) to range(1, 6) AND change total = i to total = total + i",
      detail: "Fixes the exclusive stop bound and replaces overwrite with accumulator update.",
      isCorrect: true,
    },
    {
      id: "opt_m1_only",
      label: "Only change range(1, 5) to range(1, 6); leave total = i as is",
      detail: "Addresses the loop bound, but total will still overwrite to 5 at the end.",
      isCorrect: false,
    },
    {
      id: "opt_m2_only",
      label: "Only change total = i to total = total + i; leave range(1, 5) as is",
      detail: "Fixes accumulator update, but loop still stops at 4.",
      isCorrect: false,
    },
  ];

  const fixOptions = options && options.length > 0 ? options : fallbackOptions;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFix) return;
    onSubmit(selectedFix, explanation);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden my-4 text-xs">
      {/* Top Banner */}
      <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-amber-500 shrink-0" />
          <h3 className="font-bold text-slate-800 text-xs">
            Interactive Bug-Fix & Live Code Test Studio
          </h3>
        </div>
        <span className="text-[11px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full font-medium">
          {expectedOutputSummary}
        </span>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* Step 1: Live Interactive Python Runner */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Test & Modify Buggy Code in Live Python 3:</span>
            </label>
            <span className="text-[11px] text-slate-500">
              Click &quot;▶ Run Code&quot; to test your fix live
            </span>
          </div>

          <PythonRunner
            initialCode={buggyCode}
            code={activeCode}
            onChange={(c) => setActiveCode(c)}
            onOutputChange={(out) => setLiveOutput(out)}
            title="Live Python Code Editor (Pyodide WebAssembly)"
            subtitle="Edit and click ▶ Run Code to see output before answering"
            minHeight="110px"
            embeddedMode={true}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
          {/* Step 2: Choose the Correct Repair */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 block">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white inline-flex items-center justify-center text-[10px] mr-1.5">
                2
              </span>
              Which repair correctly fixes the bug?
            </label>
            <div className="space-y-2">
              {fixOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                    selectedFix === opt.id
                      ? "bg-indigo-50/70 border-indigo-400 ring-1 ring-indigo-400 shadow-2xs"
                      : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="fixOption"
                    value={opt.id}
                    checked={selectedFix === opt.id}
                    onChange={() => setSelectedFix(opt.id)}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="font-semibold text-slate-900">{opt.label}</div>
                    {opt.detail && (
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {opt.detail}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Step 3: Mandatory Written Explanation */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 block">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white inline-flex items-center justify-center text-[10px] mr-1.5">
                3
              </span>
              Explain your thinking in 1–2 sentences: why does this loop give your answer?
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="e.g. range(1, 5) stopped before reaching 5, and total = i kept replacing the running sum..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={!selectedFix || isLoading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{isLoading ? "LoopStep AI is Evaluating..." : "Submit Solution & Explanation"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
