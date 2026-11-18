"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  simulatePythonLoop,
  findDivergenceStep,
  TraceFrame,
  LearnerTraceRow,
  DivergenceResult,
  LoopProgramConfig,
} from "@/lib/loopTracer";
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Terminal,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";

interface TraceTableToolProps {
  loopConfig: LoopProgramConfig;
  expectedPassCount: number;
  initialLearnerRows?: LearnerTraceRow[];
  onSubmitTrace?: (rows: LearnerTraceRow[], divergence: DivergenceResult) => void;
  readOnly?: boolean;
}

export default function TraceTableTool({
  loopConfig,
  expectedPassCount,
  initialLearnerRows,
  onSubmitTrace,
  readOnly = false,
}: TraceTableToolProps) {
  // Stable simulation frames calculated via useMemo
  const actualFrames = useMemo<TraceFrame[]>(() => {
    return simulatePythonLoop(loopConfig);
  }, [
    loopConfig.rangeStart,
    loopConfig.rangeStop,
    loopConfig.rangeStep,
    loopConfig.loopVar,
    loopConfig.initialAccumulatorName,
    loopConfig.initialAccumulatorValue,
    loopConfig.accumulatorOperation,
    JSON.stringify(loopConfig.listItems),
    loopConfig.isWhileLoop,
  ]);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"step" | "predict">("step");

  // Reset current step only when config changes structurally
  const configSignature = `${loopConfig.rangeStart}-${loopConfig.rangeStop}-${loopConfig.rangeStep}-${loopConfig.loopVar}-${loopConfig.accumulatorOperation}-${(loopConfig.listItems || []).join(",")}-${loopConfig.isWhileLoop}`;
  useEffect(() => {
    setCurrentStep(0);
  }, [configSignature]);

  // Learner input rows for Trace Table mode
  const [rows, setRows] = useState<LearnerTraceRow[]>(
    initialLearnerRows || [
      { passNumber: 1, loopVarValue: "", accumulatorValue: "" },
      { passNumber: 2, loopVarValue: "", accumulatorValue: "" },
      { passNumber: 3, loopVarValue: "", accumulatorValue: "" },
    ]
  );

  const [divergence, setDivergence] = useState<DivergenceResult | null>(null);
  const [hasChecked, setHasChecked] = useState<boolean>(false);

  const activeFrame = actualFrames[currentStep] || actualFrames[0];

  const handleRowChange = (
    passNum: number,
    field: "loopVarValue" | "accumulatorValue",
    value: string
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.passNumber === passNum ? { ...r, [field]: value } : r))
    );
    setHasChecked(false);
  };

  const handleAddPass = () => {
    const nextPass = rows.length + 1;
    setRows([...rows, { passNumber: nextPass, loopVarValue: "", accumulatorValue: "" }]);
    setHasChecked(false);
  };

  const handleRemovePass = () => {
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

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(actualFrames.length - 1, prev + 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleResetStep = () => {
    setCurrentStep(0);
  };

  // Render python code lines
  const renderCodeSnippet = () => {
    const accName = loopConfig.initialAccumulatorName || "total";
    const accVal = loopConfig.initialAccumulatorValue || 0;
    const lVar = loopConfig.loopVar || "i";

    if (loopConfig.listItems && loopConfig.listItems.length > 0) {
      return (
        <div className="space-y-1.5 font-mono text-xs">
          <div
            className={`flex items-center px-2 py-1 rounded transition ${
              viewMode === "step" && activeFrame?.lineNumber === 1
                ? "bg-indigo-950 text-white border-l-2 border-indigo-400 font-semibold"
                : "text-slate-300"
            }`}
          >
            <span className="text-slate-600 w-5 select-none text-[11px]">1</span>
            <span>
              <span className="text-[#89DCEB]">{accName}</span> ={" "}
              <span className="text-[#FAB387]">{accVal}</span>
            </span>
          </div>

          <div
            className={`flex items-center px-2 py-1 rounded transition ${
              viewMode === "step" && activeFrame?.lineNumber === 2
                ? "bg-indigo-950 text-white border-l-2 border-indigo-400 font-semibold"
                : "text-slate-300"
            }`}
          >
            <span className="text-slate-600 w-5 select-none text-[11px]">2</span>
            <span>
              <span className="text-[#CBA6F7]">for </span>
              <span className="text-[#CDD6F4]">{lVar}</span>
              <span className="text-[#CBA6F7]"> in </span>
              <span className="text-[#A6E3A1]">items</span>
              <span className="text-slate-400">:</span>
            </span>
          </div>

          <div
            className={`flex items-center px-2 py-1 rounded transition ${
              viewMode === "step" && activeFrame?.lineNumber === 3
                ? "bg-indigo-950 text-white border-l-2 border-indigo-400 font-semibold"
                : "text-slate-300"
            }`}
          >
            <span className="text-slate-600 w-5 select-none text-[11px]">3</span>
            <span className="pl-4">
              <span className="text-[#89DCEB]">{accName}</span> ={" "}
              <span className="text-[#89DCEB]">{accName}</span> + 1
            </span>
          </div>

          <div
            className={`flex items-center px-2 py-1 rounded transition ${
              viewMode === "step" && activeFrame?.lineNumber === 4
                ? "bg-indigo-950 text-white border-l-2 border-indigo-400 font-semibold"
                : "text-slate-300"
            }`}
          >
            <span className="text-slate-600 w-5 select-none text-[11px]">4</span>
            <span>
              <span className="text-[#89B4FA]">print</span>
              <span className="text-slate-400">(</span>
              <span className="text-[#89DCEB]">{accName}</span>
              <span className="text-slate-400">)</span>
            </span>
          </div>
        </div>
      );
    }

    if (loopConfig.isWhileLoop) {
      return (
        <div className="space-y-1.5 font-mono text-xs">
          <div
            className={`flex items-center px-2 py-1 rounded transition ${
              viewMode === "step" && activeFrame?.lineNumber === 1
                ? "bg-indigo-950 text-white border-l-2 border-indigo-400 font-semibold"
                : "text-slate-300"
            }`}
          >
            <span className="text-slate-600 w-5 select-none text-[11px]">1</span>
            <span>
              <span className="text-[#89DCEB]">{lVar}</span> ={" "}
              <span className="text-[#FAB387]">{loopConfig.rangeStart}</span>
              <span className="text-slate-500">; </span>
              <span className="text-[#89DCEB]">{accName}</span> ={" "}
              <span className="text-[#FAB387]">{accVal}</span>
            </span>
          </div>

          <div
            className={`flex items-center px-2 py-1 rounded transition ${
              viewMode === "step" && activeFrame?.lineNumber === 2
                ? "bg-indigo-950 text-white border-l-2 border-indigo-400 font-semibold"
                : "text-slate-300"
            }`}
          >
            <span className="text-slate-600 w-5 select-none text-[11px]">2</span>
            <span>
              <span className="text-[#CBA6F7]">while </span>
              <span className="text-[#CDD6F4]">{lVar}</span> &lt;={" "}
              <span className="text-[#FAB387]">{loopConfig.rangeStop}</span>
              <span className="text-slate-400">:</span>
            </span>
          </div>

          <div
            className={`flex items-center px-2 py-1 rounded transition ${
              viewMode === "step" && activeFrame?.lineNumber === 3
                ? "bg-indigo-950 text-white border-l-2 border-indigo-400 font-semibold"
                : "text-slate-300"
            }`}
          >
            <span className="text-slate-600 w-5 select-none text-[11px]">3</span>
            <span className="pl-4">
              <span className="text-[#89DCEB]">{accName}</span> ={" "}
              <span className="text-[#89DCEB]">{accName}</span> +{" "}
              <span className="text-[#CDD6F4]">{lVar}</span>
            </span>
          </div>

          <div
            className={`flex items-center px-2 py-1 rounded transition ${
              viewMode === "step" && activeFrame?.lineNumber === 4
                ? "bg-indigo-950 text-white border-l-2 border-indigo-400 font-semibold"
                : "text-slate-300"
            }`}
          >
            <span className="text-slate-600 w-5 select-none text-[11px]">4</span>
            <span className="pl-4">
              <span className="text-[#89DCEB]">{lVar}</span> ={" "}
              <span className="text-[#89DCEB]">{lVar}</span> + 1
            </span>
          </div>

          <div
            className={`flex items-center px-2 py-1 rounded transition ${
              viewMode === "step" && activeFrame?.lineNumber === 5
                ? "bg-indigo-950 text-white border-l-2 border-indigo-400 font-semibold"
                : "text-slate-300"
            }`}
          >
            <span className="text-slate-600 w-5 select-none text-[11px]">5</span>
            <span>
              <span className="text-[#89B4FA]">print</span>
              <span className="text-slate-400">(</span>
              <span className="text-[#89DCEB]">{accName}</span>
              <span className="text-slate-400">)</span>
            </span>
          </div>
        </div>
      );
    }

    // Standard for ... in range(...)
    return (
      <div className="space-y-1.5 font-mono text-xs">
        <div
          className={`flex items-center px-2 py-1 rounded transition ${
            viewMode === "step" && activeFrame?.lineNumber === 1
              ? "bg-indigo-950 text-white border-l-2 border-indigo-400 font-semibold"
              : "text-slate-300"
          }`}
        >
          <span className="text-slate-600 w-5 select-none text-[11px]">1</span>
          <span>
            <span className="text-[#89DCEB]">{accName}</span> ={" "}
            <span className="text-[#FAB387]">{accVal}</span>
          </span>
        </div>

        <div
          className={`flex items-center px-2 py-1 rounded transition ${
            viewMode === "step" && activeFrame?.lineNumber === 2
              ? "bg-indigo-950 text-white border-l-2 border-indigo-400 font-semibold"
              : "text-slate-300"
          }`}
        >
          <span className="text-slate-600 w-5 select-none text-[11px]">2</span>
          <span>
            <span className="text-[#CBA6F7]">for </span>
            <span className="text-[#CDD6F4]">{lVar}</span>
            <span className="text-[#CBA6F7]"> in </span>
            <span className="text-[#89B4FA]">range</span>
            <span className="text-slate-400">(</span>
            <span className="text-[#FAB387]">{loopConfig.rangeStart}</span>
            <span className="text-slate-400">, </span>
            <span className="text-[#FAB387]">{loopConfig.rangeStop}</span>
            {loopConfig.rangeStep !== undefined && (
              <>
                <span className="text-slate-400">, </span>
                <span className="text-[#FAB387]">{loopConfig.rangeStep}</span>
              </>
            )}
            <span className="text-slate-400">):</span>
          </span>
        </div>

        <div
          className={`flex items-center px-2 py-1 rounded transition ${
            viewMode === "step" && activeFrame?.lineNumber === 3
              ? "bg-indigo-950 text-white border-l-2 border-indigo-400 font-semibold"
              : "text-slate-300"
          }`}
        >
          <span className="text-slate-600 w-5 select-none text-[11px]">3</span>
          <span className="pl-4">
            <span className="text-[#89DCEB]">{accName}</span> ={" "}
            {loopConfig.accumulatorOperation === "overwrite" ? (
              <span className="text-[#CDD6F4]">{lVar}</span>
            ) : (
              <>
                <span className="text-[#89DCEB]">{accName}</span> +{" "}
                <span className="text-[#CDD6F4]">{lVar}</span>
              </>
            )}
          </span>
        </div>

        <div
          className={`flex items-center px-2 py-1 rounded transition ${
            viewMode === "step" && activeFrame?.lineNumber === 4
              ? "bg-indigo-950 text-white border-l-2 border-indigo-400 font-semibold"
              : "text-slate-300"
          }`}
        >
          <span className="text-slate-600 w-5 select-none text-[11px]">4</span>
          <span>
            <span className="text-[#89B4FA]">print</span>
            <span className="text-slate-400">(</span>
            <span className="text-[#89DCEB]">{accName}</span>
            <span className="text-slate-400">)</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden my-4">
      {/* Header Bar & Tab Switcher */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-xs text-slate-800">
            Interactive Code & Execution Studio
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setViewMode("step")}
            className={`px-3 py-1 rounded-md transition cursor-pointer ${
              viewMode === "step"
                ? "bg-white text-indigo-600 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Step-by-Step Stepper
          </button>
          <button
            type="button"
            onClick={() => setViewMode("predict")}
            className={`px-3 py-1 rounded-md transition cursor-pointer ${
              viewMode === "predict"
                ? "bg-white text-indigo-600 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Trace Table
          </button>
        </div>
      </div>

      {/* Editor & Execution Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80">
        {/* Left: Code Display */}
        <div className="lg:col-span-5 bg-[#181825] p-4 text-xs font-mono text-slate-300 flex flex-col justify-between min-h-[260px]">
          <div>
            {/* Window Dots */}
            <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-800 mb-3 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] inline-block"></span>
              <span className="ml-2 text-[10px] text-slate-400 font-sans">solution.py</span>
            </div>

            {/* Code Lines with Syntax Colors */}
            {renderCodeSnippet()}
          </div>

          {/* Bottom Execution Note */}
          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-sans">
            {viewMode === "step" && activeFrame ? (
              <span className="text-indigo-300">{activeFrame.explanationNote}</span>
            ) : loopConfig.listItems ? (
              <span>Iterates through {loopConfig.listItems.length} items</span>
            ) : loopConfig.isWhileLoop ? (
              <span>Counts while {loopConfig.loopVar} &le; {loopConfig.rangeStop}</span>
            ) : (
              <span>Range: [{loopConfig.rangeStart} &rarr; stops before {loopConfig.rangeStop}]</span>
            )}
          </div>
        </div>

        {/* Right: Stepper OR Trace Table */}
        <div className="lg:col-span-7 p-4 flex flex-col justify-between bg-white min-h-[260px]">
          {viewMode === "step" ? (
            /* ================= STEPPER VIEW ================= */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                <span className="font-semibold text-slate-800">
                  Execution Step {currentStep + 1} of {actualFrames.length}
                </span>
                <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono font-medium">
                  {activeFrame?.passNumber === 0 ? "Initialization" : `Iteration Pass ${activeFrame?.passNumber}`}
                </span>
              </div>

              {/* Memory Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center shadow-2xs">
                  <div className="text-[11px] font-mono text-slate-500 font-medium">
                    Variable `{activeFrame?.loopVarName || loopConfig.loopVar}`
                  </div>
                  <div className="text-2xl font-bold font-mono text-indigo-600 mt-1">
                    {activeFrame ? String(activeFrame.loopVarValue) : "-"}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center shadow-2xs">
                  <div className="text-[11px] font-mono text-slate-500 font-medium">
                    Accumulator `{activeFrame?.accumulatorName || "total"}`
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
                    {activeFrame ? String(activeFrame.accumulatorValue) : "-"}
                  </div>
                </div>
              </div>

              {/* Explanation Banner */}
              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-indigo-950 leading-relaxed">
                {activeFrame?.explanationNote}
              </div>

              {/* Stepper Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetStep}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart Stepper</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={currentStep === 0}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium disabled:opacity-40 cursor-pointer flex items-center gap-1 transition shadow-2xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={currentStep === actualFrames.length - 1}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold disabled:opacity-40 cursor-pointer flex items-center gap-1 transition shadow-xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ================= TRACE TABLE VIEW ================= */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 pb-1.5 border-b border-slate-100">
                <span className="font-semibold text-slate-800">
                  Fill in values for each pass:
                </span>
                <span className="text-[11px] text-slate-500">
                  {loopConfig.rangeStop ? `Stops before ${loopConfig.rangeStop}` : "Trace each pass"}
                </span>
              </div>

              {/* Passes List */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {rows.map((row) => {
                  const isDivergent =
                    divergence?.hasDiverged &&
                    divergence.divergencePass === row.passNumber;

                  return (
                    <div
                      key={row.passNumber}
                      className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-3 ${
                        isDivergent
                          ? "bg-amber-50/80 border-amber-300 ring-1 ring-amber-300"
                          : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-700 shadow-2xs">
                          {row.passNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          Pass {row.passNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <label className="text-[11px] text-slate-500 font-mono font-medium">
                            {loopConfig.loopVar} =
                          </label>
                          <input
                            type="text"
                            value={row.loopVarValue}
                            onChange={(e) =>
                              handleRowChange(row.passNumber, "loopVarValue", e.target.value)
                            }
                            placeholder="?"
                            className="w-14 px-2 py-1 text-center font-mono text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <label className="text-[11px] text-slate-500 font-mono font-medium">
                            {loopConfig.initialAccumulatorName || "total"} =
                          </label>
                          <input
                            type="text"
                            value={row.accumulatorValue}
                            onChange={(e) =>
                              handleRowChange(row.passNumber, "accumulatorValue", e.target.value)
                            }
                            placeholder="?"
                            className="w-14 px-2 py-1 text-center font-mono text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pass Adder & Remover */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleAddPass}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Pass</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePass}
                    disabled={rows.length <= 1}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium disabled:opacity-40 cursor-pointer transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Remove Pass</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCheck}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify My Trace</span>
                </button>
              </div>

              {/* Feedback Alert */}
              {hasChecked && divergence && (
                <div
                  className={`mt-2 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                    divergence.hasDiverged
                      ? "bg-amber-50 border-amber-200 text-amber-900"
                      : "bg-emerald-50 border-emerald-200 text-emerald-900"
                  }`}
                >
                  {divergence.hasDiverged ? (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold">
                      {divergence.hasDiverged ? "Almost there!" : "Perfect Trace!"}
                    </div>
                    <div className="text-xs opacity-90 mt-0.5">
                      {divergence.explanationMessage}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
