import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, MessageSquare, Lightbulb, Sparkles } from "lucide-react";

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
      detail: "Fixes both the exclusive stop-bound off-by-one AND the accumulator overwrite.",
      correct: true,
      misconception: "NONE",
    },
    {
      id: "opt_m1_only",
      label: "Only change range(1, 5) to range(1, 6); leave total = i as is",
      detail: "Addresses the stop boundary, but total will still overwrite to 5 at the end.",
      correct: false,
      misconception: "M2",
    },
    {
      id: "opt_m2_only",
      label: "Only change total = i to total = total + i; leave range(1, 5) as is",
      detail: "Addresses the accumulator, but loop stops at 4 (sum becomes 10 instead of 15).",
      correct: false,
      misconception: "M1",
    },
    {
      id: "opt_reset_inside",
      label: "Add total = 0 inside the loop body before total = total + i",
      detail: "Resets the running total back to zero on every iteration pass.",
      correct: false,
      misconception: "M2",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFix) return;
    onSubmit(selectedFix, explanation);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-border shadow-xs overflow-hidden my-4">
      <div className="bg-[#F5F2EB] px-4 py-3 border-b border-stone-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-calm-indigo" />
          <h3 className="font-semibold text-sm text-ink">
            Bug-Fix & Plain-English Explanation (Format C)
          </h3>
        </div>
        <span className="text-xs text-ink-faint">Evaluate mental models beyond MCQ</span>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
        {/* Buggy Snippet Inspection */}
        <div>
          <label className="font-medium text-ink block mb-1.5">Buggy Python Code:</label>
          <div className="p-3 bg-paper-50 rounded-lg border border-stone-border font-mono text-xs text-ink overflow-x-auto">
            <pre>{buggyCode}</pre>
          </div>
          <p className="text-[11px] text-ink-light mt-1">
            Goal: Sum numbers 1 through 5 (expected output: <code className="text-calm-green">15</code>).
            Current output: <code className="text-calm-amber">4</code>.
          </p>
        </div>

        {/* Fix Selector */}
        <div>
          <label className="font-medium text-ink block mb-2">Step 1: Choose the correct repair:</label>
          <div className="space-y-2">
            {fixOptions.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition ${
                  selectedFix === opt.id
                    ? "bg-calm-indigoBg/40 border-calm-indigo ring-1 ring-calm-indigo"
                    : "bg-white border-stone-border hover:bg-paper-50"
                }`}
              >
                <input
                  type="radio"
                  name="fixOption"
                  value={opt.id}
                  checked={selectedFix === opt.id}
                  onChange={() => setSelectedFix(opt.id)}
                  className="mt-0.5 text-calm-indigo focus:ring-calm-indigo"
                />
                <div>
                  <div className="font-semibold text-ink">{opt.label}</div>
                  <div className="text-[11px] text-ink-light mt-0.5">{opt.detail}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Free-Text Explanation */}
        <div>
          <label className="font-medium text-ink block mb-1">
            Step 2: Explain in your own words (1–2 sentences):
          </label>
          <p className="text-[11px] text-ink-faint mb-2">
            Why did the original code print 4? What was happening inside the loop and at the stop boundary?
          </p>
          <textarea
            rows={3}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="e.g. The loop stopped before 5 because range stops early, and total = i kept overwriting the previous numbers instead of adding them..."
            className="w-full p-2.5 rounded-lg border border-stone-border bg-white text-xs text-ink focus:border-calm-indigo focus:ring-1 focus:ring-calm-indigo"
          />
          <div className="flex justify-between items-center text-[10px] text-ink-faint mt-1">
            <span>Our AI tutor evaluates your reasoning, not just your code!</span>
            <span>{explanation.length} characters</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={!selectedFix || isLoading}
            className="px-5 py-2.5 bg-calm-indigo hover:bg-indigo-700 text-white font-medium rounded-lg text-xs transition shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>{isLoading ? "AI Evaluating Reason..." : "Submit Fix & Explanation"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
