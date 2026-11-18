import React, { useState } from "react";
import { Sparkles, CheckCircle2, AlertTriangle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface VivaScenarioSwitcherProps {
  onSelectScenario: (scenarioType: "CORRECT_PATH" | "M1_PATH" | "M2_PATH" | "PREREQ_PATH") => void;
}

export default function VivaScenarioSwitcher({ onSelectScenario }: VivaScenarioSwitcherProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="fixed bottom-14 right-4 z-40 max-w-sm">
      <div className="bg-white rounded-xl border-2 border-calm-indigo shadow-xl overflow-hidden transition-all text-xs">
        {/* Toggle Bar */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-calm-indigo text-white px-3 py-2 flex items-center justify-between font-semibold cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Viva Examiner Quick-Paths (D5)</span>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {/* Collapsible Content */}
        {isOpen && (
          <div className="p-3 bg-paper-50 space-y-2 border-t border-stone-border">
            <p className="text-[11px] text-ink-light">
              One-click demonstration of all 3 mandatory decision rule outcomes for examiners:
            </p>

            <button
              onClick={() => onSelectScenario("CORRECT_PATH")}
              className="w-full text-left p-2 rounded-lg bg-white border border-calm-greenBorder hover:bg-calm-greenBg/30 flex items-center gap-2 cursor-pointer transition"
            >
              <CheckCircle2 className="w-4 h-4 text-calm-green shrink-0" />
              <div>
                <div className="font-bold text-ink">Path A: High-Achieving / Correct</div>
                <div className="text-[10px] text-ink-light">&rarr; Triggers Outcome 1 (Harder Question)</div>
              </div>
            </button>

            <button
              onClick={() => onSelectScenario("M1_PATH")}
              className="w-full text-left p-2 rounded-lg bg-white border border-calm-amberBorder hover:bg-calm-amberBg/30 flex items-center gap-2 cursor-pointer transition"
            >
              <AlertTriangle className="w-4 h-4 text-calm-amber shrink-0" />
              <div>
                <div className="font-bold text-ink">Path B: Misconception M1 (Inclusive Stop)</div>
                <div className="text-[10px] text-ink-light">&rarr; Triggers Outcome 2 (Stop Sign Metaphor)</div>
              </div>
            </button>

            <button
              onClick={() => onSelectScenario("M2_PATH")}
              className="w-full text-left p-2 rounded-lg bg-white border border-calm-amberBorder hover:bg-calm-amberBg/30 flex items-center gap-2 cursor-pointer transition"
            >
              <AlertTriangle className="w-4 h-4 text-calm-amber shrink-0" />
              <div>
                <div className="font-bold text-ink">Path C: Misconception M2 (Accumulator Wipe)</div>
                <div className="text-[10px] text-ink-light">&rarr; Triggers Outcome 2 (Piggy Bank Metaphor)</div>
              </div>
            </button>

            <button
              onClick={() => onSelectScenario("PREREQ_PATH")}
              className="w-full text-left p-2 rounded-lg bg-white border border-calm-indigoBorder hover:bg-calm-indigoBg/30 flex items-center gap-2 cursor-pointer transition"
            >
              <HelpCircle className="w-4 h-4 text-calm-indigo shrink-0" />
              <div>
                <div className="font-bold text-ink">Path D: High Anxiety / Repeated Failure</div>
                <div className="text-[10px] text-ink-light">&rarr; Triggers Outcome 3 (Prerequisite Step Back)</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
