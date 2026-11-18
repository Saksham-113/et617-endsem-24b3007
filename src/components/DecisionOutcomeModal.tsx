import React from "react";
import { DecisionOutcomeType } from "@/lib/curriculum";
import { ArrowRight, Lightbulb, CheckCircle2, HelpCircle } from "lucide-react";

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
}: DecisionOutcomeModalProps) {
  const getBannerStyle = () => {
    switch (outcome) {
      case "HARDER_QUESTION":
        return {
          badge: "Challenge Unlocked",
          bg: "bg-emerald-50 border-emerald-200 text-emerald-900",
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
        };
      case "ALTERNATIVE_EXPLANATION":
        return {
          badge: "Visual Breakdown",
          bg: "bg-amber-50 border-amber-200 text-amber-900",
          icon: <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />,
        };
      case "PREREQUISITE_INSTRUCTION":
        return {
          badge: "Quick Foundation",
          bg: "bg-indigo-50 border-indigo-200 text-indigo-900",
          icon: <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0" />,
        };
    }
  };

  const style = getBannerStyle();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-5 my-5 animate-fade-in text-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          {style.icon}
          <div>
            <span className="font-bold text-sm text-slate-900">{feedbackHeader}</span>
            <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {style.badge}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Metaphor Cards */}
      {metaphor === "STOP_SIGN" && (
        <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500 text-white font-bold flex items-center justify-center shrink-0 text-[10px] shadow-2xs">
            STOP
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs">The Python Stop Sign</h4>
            <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
              In <code className="bg-white px-1 rounded border border-amber-200 text-slate-800">range(start, stop)</code>, Python treats <code className="text-red-600 font-bold">stop</code> as a stop sign. You get off <strong>right before</strong> reaching it. It never visits the stop number itself!
            </p>
          </div>
        </div>
      )}

      {metaphor === "PIGGY_BANK" && (
        <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-2xs">
            🐖
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs">Piggy Bank vs. Whiteboard</h4>
            <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
              <code className="bg-white px-1 rounded border border-indigo-200 text-slate-800">total = total + i</code> adds a new coin into your piggy bank without losing the past. In contrast, <code className="bg-white px-1 rounded border border-indigo-200 text-slate-800">total = i</code> wipes the board completely clean on every iteration!
            </p>
          </div>
        </div>
      )}

      {metaphor === "VARIABLE_BOX" && (
        <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-sm shadow-2xs">
            📦
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs">Sequential Updates</h4>
            <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
              Before looping, let&apos;s trace how memory updates one line at a time: <code className="bg-white px-1 rounded border border-emerald-200 text-slate-800">score = score + 3</code> takes the existing number in the box and adds 3 to it.
            </p>
          </div>
        </div>
      )}

      {/* Main Feedback Text */}
      <p className="text-slate-700 text-xs leading-relaxed">{feedbackBody}</p>

      {/* Action Footer */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onProceed}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>{proceedLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
