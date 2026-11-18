import React from "react";
import { DecisionOutcomeType } from "@/lib/curriculum";
import { Sparkles, ArrowRight, Lightbulb, ShieldAlert, CheckCircle2, Bookmark, HelpCircle } from "lucide-react";

interface DecisionOutcomeModalProps {
  outcome: DecisionOutcomeType;
  rationale: string;
  feedbackHeader: string;
  feedbackBody: string;
  metaphor?: "STOP_SIGN" | "PIGGY_BANK" | "VARIABLE_BOX";
  onProceed: () => void;
  proceedLabel?: string;
  engineUsed?: string;
}

export default function DecisionOutcomeModal({
  outcome,
  rationale,
  feedbackHeader,
  feedbackBody,
  metaphor,
  onProceed,
  proceedLabel = "Continue to Next Step",
  engineUsed,
}: DecisionOutcomeModalProps) {
  const getBadge = () => {
    switch (outcome) {
      case "HARDER_QUESTION":
        return {
          title: "Outcome 1: Advancing to a Harder Challenge",
          bg: "bg-calm-greenBg text-calm-green border-calm-greenBorder",
          icon: <CheckCircle2 className="w-5 h-5 text-calm-green" />,
        };
      case "ALTERNATIVE_EXPLANATION":
        return {
          title: "Outcome 2: Unlocking Alternative Visual Explanation",
          bg: "bg-calm-amberBg text-calm-amber border-calm-amberBorder",
          icon: <Lightbulb className="w-5 h-5 text-calm-amber" />,
        };
      case "PREREQUISITE_INSTRUCTION":
        return {
          title: "Outcome 3: Stepping Down to Prerequisite Foundations",
          bg: "bg-calm-indigoBg text-calm-indigo border-calm-indigoBorder",
          icon: <HelpCircle className="w-5 h-5 text-calm-indigo" />,
        };
    }
  };

  const badge = getBadge();

  return (
    <div className="bg-white rounded-xl border border-stone-border shadow-md p-5 my-4 animate-fade-in text-xs">
      {/* Outcome Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-border">
        <div className="flex items-center gap-2">
          {badge.icon}
          <div>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs border ${badge.bg}`}
            >
              {badge.title}
            </span>
            <span className="text-[11px] text-ink-faint ml-2">(P4 Decision Rule Triggered)</span>
          </div>
        </div>

        {engineUsed && (
          <span className="text-[10px] text-ink-faint bg-paper-50 px-2 py-0.5 rounded border border-stone-border">
            {engineUsed}
          </span>
        )}
      </div>

      {/* Decision Rationale Box */}
      <div className="my-3 p-3 bg-paper-50 rounded-lg border border-stone-border/70 space-y-1">
        <div className="font-semibold text-ink text-[11px] flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5 text-calm-indigo" />
          <span>Pedagogical Decision Engine Rationale:</span>
        </div>
        <p className="text-ink-light text-xs leading-relaxed">{rationale}</p>
      </div>

      {/* Visual Metaphor Card if triggered */}
      {metaphor === "STOP_SIGN" && (
        <div className="p-3 my-3 bg-calm-amberBg/30 rounded-lg border border-calm-amberBorder flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px] shadow-xs">
            STOP
          </div>
          <div>
            <h4 className="font-bold text-ink text-xs">The Python Stop Sign Rule</h4>
            <p className="text-ink-light text-[11px] mt-0.5">
              In `range(start, stop)`, Python treats `stop` like a red traffic light. You get off at the bus station <strong>right before</strong> the light. It NEVER enters the stop number!
            </p>
          </div>
        </div>
      )}

      {metaphor === "PIGGY_BANK" && (
        <div className="p-3 my-3 bg-calm-indigoBg/30 rounded-lg border border-calm-indigoBorder flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-calm-indigo text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-xs">
            🐖
          </div>
          <div>
            <h4 className="font-bold text-ink text-xs">Piggy Bank vs. Whiteboard Metaphor</h4>
            <p className="text-ink-light text-[11px] mt-0.5">
              `total = total + i` is dropping a coin into your piggy bank (previous sum remains safe inside). `total = i` is wiping the whiteboard clean on every single pass!
            </p>
          </div>
        </div>
      )}

      {metaphor === "VARIABLE_BOX" && (
        <div className="p-3 my-3 bg-calm-indigoBg/30 rounded-lg border border-calm-indigoBorder flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-xs">
            📦
          </div>
          <div>
            <h4 className="font-bold text-ink text-xs">Variables are Labeled Boxes</h4>
            <p className="text-ink-light text-[11px] mt-0.5">
              Before running loops, remember that `x = x + 1` takes what is currently in the box, adds 1 to it, and puts the new total back in. Let&apos;s practice this foundation.
            </p>
          </div>
        </div>
      )}

      {/* Feedback Body */}
      <div className="mt-3 text-ink leading-relaxed">
        <h4 className="font-bold text-sm text-ink mb-1">{feedbackHeader}</h4>
        <p className="text-ink-light text-xs">{feedbackBody}</p>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-stone-border flex justify-end">
        <button
          onClick={onProceed}
          className="px-4 py-2 bg-calm-indigo hover:bg-indigo-700 text-white font-medium rounded-lg text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>{proceedLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
