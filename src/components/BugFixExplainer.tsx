import React, { useState } from "react";
import { CheckCircle2, Sparkles, Bug, ArrowRight } from "lucide-react";

interface BugFixExplainerProps {
  buggyCode: string;
  onSubmit: (fixChoice: string, explanation: string) => void;
  isLoading?: boolean;
}

export default function BugFixExplainer({
  buggyCode,
  onSubmit,
  isLoading = false,
}: BugFixExplainerProps) {
  const [selectedFix, setSelectedFix] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");

  const fixOptions = [
    {
      id: "opt_both",
      label: "Change range(1, 5) to range(1, 6) AND change total = i to total = total + i",
      detail: "Fixes the exclusive stop bound and replaces overwrite with accumulator update.",
    },
    {
      id: "opt_m1_only",
      label: "Only change range(1, 5) to range(1, 6); leave total = i as is",
      detail: "Addresses the loop bound, but total will still overwrite to 5 at the end.",
    },
    {
      id: "opt_m2_only",
      label: "Only change total = i to total = total + i; leave range(1, 5) as is",
      detail: "Fixes accumulator update, but loop still stops at 4 (sum becomes 10 instead of 15).",
    },
    {
      id: "opt_reset_inside",
      label: "Add total = 0 inside the loop body before total = total + i",
      detail: "Resets the total back to 0 on every single iteration pass.",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFix) return;
    onSubmit(selectedFix, explanation);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden my-5">
      <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-xs text-slate-800">
            Debug & Explain Challenge
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Expected output: 15 · Actual: 4
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
        {/* Code Diff Display */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1.5">
            Buggy Code:
          </label>
          <div className="p-3 bg-[#181825] rounded-xl font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto">
            <pre className="text-slate-200">{buggyCode}</pre>
          </div>
        </div>

        {/* Fix Selection */}
        <div>
          <label className="font-semibold text-slate-700 block mb-2">
            1. Which repair fixes both bugs?
          </label>
          <div className="space-y-2">
            {fixOptions.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                  selectedFix === opt.id
                    ? "bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-300"
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
                  <div className="font-semibold text-slate-800">{opt.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{opt.detail}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Mandatory Explanation Input */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            2. Explain your thinking in 1–2 sentences: why does this loop give your answer?
          </label>
          <textarea
            rows={2}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="e.g. range(1, 5) stopped before reaching 5, and total = i kept replacing the running sum..."
            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Submit */}
        <div className="pt-1 flex justify-end">
          <button
            type="submit"
            disabled={!selectedFix || isLoading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? "Evaluating..." : "Submit Solution"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
