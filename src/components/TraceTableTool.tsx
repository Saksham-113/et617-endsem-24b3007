import React, { useState, useEffect } from "react";
import {
  simulatePythonLoop,
  findDivergenceStep,
  TraceFrame,
  LearnerTraceRow,
  DivergenceResult,
} from "@/lib/loopTracer";
import { LoopProgramConfig } from "@/lib/loopTracer";
import { Play, RotateCcw, ArrowRight, CheckCircle2, AlertTriangle, Eye, HelpCircle } from "lucide-react";

interface TraceTableToolProps {
  loopConfig: LoopProgramConfig;
  expectedPassCount: number;
  initialLearnerRows?: LearnerTraceRow[];
  onSubmitTrace?: (rows: LearnerTraceRow[], divergence: DivergenceResult) => void;
  readOnly?: boolean;
  highlightDivergencePass?: number;
}

export default function TraceTableTool({
  loopConfig,
  expectedPassCount,
  initialLearnerRows,
  onSubmitTrace,
  readOnly = false,
  highlightDivergencePass,
}: TraceTableToolProps) {
  // Generate actual ground-truth frames from Python tracer engine
  const [actualFrames, setActualFrames] = useState<TraceFrame[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showLiveVisualizer, setShowLiveVisualizer] = useState<boolean>(false);

  // Learner input rows
  const [rows, setRows] = useState<LearnerTraceRow[]>(
    initialLearnerRows || [
      { passNumber: 1, loopVarValue: "", accumulatorValue: "" },
      { passNumber: 2, loopVarValue: "", accumulatorValue: "" },
      { passNumber: 3, loopVarValue: "", accumulatorValue: "" },
    ]
  );

  const [divergence, setDivergence] = useState<DivergenceResult | null>(null);
  const [hasChecked, setHasChecked] = useState<boolean>(false);

  useEffect(() => {
    const frames = simulatePythonLoop(loopConfig);
    setActualFrames(frames);
    setCurrentStep(0);
  }, [loopConfig]);

  const activeFrame = actualFrames[currentStep] || actualFrames[0];

  const handleRowChange = (passNum: number, field: "loopVarValue" | "accumulatorValue", value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.passNumber === passNum ? { ...r, [field]: value } : r))
    );
    setHasChecked(false);
  };

  const handleAddRow = () => {
    const nextPass = rows.length + 1;
    setRows([...rows, { passNumber: nextPass, loopVarValue: "", accumulatorValue: "" }]);
    setHasChecked(false);
  };

  const handleRemoveRow = () => {
    if (rows.length <= 1) return;
    setRows(rows.slice(0, rows.length - 1));
    setHasChecked(false);
  };

  const handleCheck = () => {
    const res = findDivergenceStep(rows, actualFrames, loopConfig.rangeStop);
    setDivergence(res);
    setHasChecked(true);
    if (onSubmitTrace) {
      onSubmitTrace(rows, res);
    }
  };

  const handleStepNext = () => {
    if (currentStep < actualFrames.length - 1) {
      setCurrentStep((c) => c + 1);
    }
  };

  const handleStepPrev = () => {
    if (currentStep > 0) {
      setCurrentStep((c) => c - 1);
    }
  };

  const handleStepReset = () => {
    setCurrentStep(0);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-border shadow-xs overflow-hidden my-4">
      {/* Header bar */}
      <div className="bg-[#F5F2EB] px-4 py-3 border-b border-stone-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-calm-indigo"></div>
          <h3 className="font-semibold text-sm text-ink">
            Interactive Variable Trace Bench
          </h3>
          <span className="text-xs text-ink-faint">(Dry-run inspection tool)</span>
        </div>

        <button
          onClick={() => setShowLiveVisualizer(!showLiveVisualizer)}
          className="text-xs text-calm-indigo hover:text-indigo-800 font-medium flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-stone-border shadow-2xs cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          {showLiveVisualizer ? "Hide Python Stepper" : "Open Step-by-Step Stepper"}
        </button>
      </div>

      {/* Optional Python Tutor Stepper View */}
      {showLiveVisualizer && activeFrame && (
        <div className="p-4 bg-calm-indigoBg/40 border-b border-calm-indigoBorder text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-calm-indigo">
              Python Execution Frame: Step {currentStep + 1} of {actualFrames.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleStepPrev}
                disabled={currentStep === 0}
                className="px-2 py-0.5 bg-white border border-stone-border rounded text-ink disabled:opacity-40 cursor-pointer"
              >
                &larr; Prev
              </button>
              <button
                onClick={handleStepNext}
                disabled={currentStep === actualFrames.length - 1}
                className="px-2 py-0.5 bg-white border border-stone-border rounded text-ink disabled:opacity-40 cursor-pointer font-medium"
              >
                Next &rarr;
              </button>
              <button
                onClick={handleStepReset}
                className="px-2 py-0.5 bg-white border border-stone-border rounded text-ink-light hover:text-ink cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Stepper Memory Box & Code Pointer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div className="bg-white p-3 rounded-lg border border-calm-indigoBorder font-mono text-xs">
              <div className="text-[11px] font-sans text-ink-faint mb-1">Active Python Line:</div>
              <div className="p-2 bg-paper-50 rounded border border-stone-border text-ink font-semibold flex items-center gap-2">
                <span className="text-calm-indigo font-bold">&rarr;</span>
                <code>{activeFrame.codeLine}</code>
              </div>
              <p className="mt-2 text-[11px] font-sans text-ink-light">
                {activeFrame.explanationNote}
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-calm-indigoBorder">
              <div className="text-[11px] text-ink-faint mb-1">Memory Frames:</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-paper-50 rounded border border-stone-border text-center">
                  <div className="text-[10px] text-ink-faint uppercase font-mono">{activeFrame.loopVarName}</div>
                  <div className="text-lg font-bold font-mono text-calm-indigo">{activeFrame.loopVarValue}</div>
                </div>
                <div className="p-2 bg-paper-50 rounded border border-stone-border text-center">
                  <div className="text-[10px] text-ink-faint uppercase font-mono">{activeFrame.accumulatorName}</div>
                  <div className="text-lg font-bold font-mono text-calm-green">{activeFrame.accumulatorValue}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trace Table Input Section */}
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-border text-ink-light font-medium">
                <th className="py-2 px-3 w-16">Pass #</th>
                <th className="py-2 px-3">
                  Loop Variable <code className="text-calm-indigo">({loopConfig.loopVar})</code>
                </th>
                <th className="py-2 px-3">
                  Accumulator <code className="text-calm-green">({loopConfig.initialAccumulatorName || "total"})</code>
                </th>
                <th className="py-2 px-3 w-28 text-center">Iteration State</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, index) => {
                const isDivergent =
                  divergence?.hasDiverged &&
                  (divergence.divergencePass === r.passNumber ||
                    highlightDivergencePass === r.passNumber);

                return (
                  <tr
                    key={r.passNumber}
                    className={`border-b border-stone-border/60 transition ${
                      isDivergent ? "bg-calm-amberBg/30" : index % 2 === 0 ? "bg-white" : "bg-paper-50/50"
                    }`}
                  >
                    <td className="py-2 px-3 font-mono font-bold text-ink">
                      Pass {r.passNumber}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        disabled={readOnly}
                        value={r.loopVarValue}
                        onChange={(e) => handleRowChange(r.passNumber, "loopVarValue", e.target.value)}
                        placeholder={`e.g. ${r.passNumber}`}
                        className={`w-28 px-2.5 py-1 font-mono rounded border text-xs ${
                          isDivergent && divergence?.field === "loopVar"
                            ? "border-calm-amber bg-white text-calm-amber font-bold ring-1 ring-calm-amber"
                            : "border-stone-border bg-white text-ink focus:border-calm-indigo focus:ring-1 focus:ring-calm-indigo"
                        }`}
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        disabled={readOnly}
                        value={r.accumulatorValue}
                        onChange={(e) => handleRowChange(r.passNumber, "accumulatorValue", e.target.value)}
                        placeholder={`e.g. ${r.passNumber}`}
                        className={`w-28 px-2.5 py-1 font-mono rounded border text-xs ${
                          isDivergent && divergence?.field === "accumulator"
                            ? "border-calm-amber bg-white text-calm-amber font-bold ring-1 ring-calm-amber"
                            : "border-stone-border bg-white text-ink focus:border-calm-green focus:ring-1 focus:ring-calm-green"
                        }`}
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      {hasChecked ? (
                        isDivergent ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-calm-amber font-semibold">
                            <AlertTriangle className="w-3 h-3" /> Check here
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-calm-green font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Clean
                          </span>
                        )
                      ) : (
                        <span className="text-[11px] text-ink-faint">Pending check</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Dynamic Row Controls & Check Button */}
        {!readOnly && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-border/60">
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handleAddRow}
                className="px-2.5 py-1 bg-white hover:bg-stone-subtle text-ink font-medium rounded border border-stone-border shadow-2xs cursor-pointer"
              >
                + Add Pass
              </button>
              <button
                onClick={handleRemoveRow}
                className="px-2.5 py-1 bg-white hover:bg-stone-subtle text-ink-light rounded border border-stone-border shadow-2xs cursor-pointer"
              >
                - Remove Pass
              </button>
              <span className="text-[11px] text-ink-faint">
                (Add passes only if the loop keeps running)
              </span>
            </div>

            <button
              onClick={handleCheck}
              className="px-4 py-1.5 bg-calm-indigo hover:bg-indigo-700 text-white font-medium rounded-lg text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verify Trace Predictions</span>
            </button>
          </div>
        )}

        {/* Feedback Banner if Checked */}
        {hasChecked && divergence && (
          <div
            className={`mt-3 p-3 rounded-lg border text-xs flex items-start gap-2 ${
              divergence.hasDiverged
                ? "bg-calm-amberBg/40 border-calm-amberBorder text-ink"
                : "bg-calm-greenBg/40 border-calm-greenBorder text-ink"
            }`}
          >
            {divergence.hasDiverged ? (
              <AlertTriangle className="w-4 h-4 text-calm-amber shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-calm-green shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold mb-0.5">
                {divergence.hasDiverged
                  ? "Divergence Detected (Let's look at why)"
                  : "Excellent Job!"}
              </div>
              <p className="text-ink-light">{divergence.explanationMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
