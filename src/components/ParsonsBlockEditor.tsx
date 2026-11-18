import React, { useState } from "react";
import { ParsonsBlock } from "@/lib/curriculum";
import { ArrowUp, ArrowDown, CheckCircle2, AlertCircle, Play, Sparkles } from "lucide-react";

interface ParsonsBlockEditorProps {
  initialBlocks: ParsonsBlock[];
  onCheck: (isCorrect: boolean, feedback: string, diagnosedM2: boolean) => void;
  readOnly?: boolean;
}

export default function ParsonsBlockEditor({
  initialBlocks,
  onCheck,
  readOnly = false,
}: ParsonsBlockEditorProps) {
  const [blocks, setBlocks] = useState<ParsonsBlock[]>(initialBlocks);
  const [checkedResult, setCheckedResult] = useState<{
    checked: boolean;
    isCorrect: boolean;
    feedback: string;
  } | null>(null);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...blocks];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setBlocks(next);
    setCheckedResult(null);
  };

  const moveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const next = [...blocks];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setBlocks(next);
    setCheckedResult(null);
  };

  const toggleIndent = (index: number) => {
    const next = [...blocks];
    next[index] = {
      ...next[index],
      currentIndent: next[index].currentIndent === 0 ? 1 : 0,
    };
    setBlocks(next);
    setCheckedResult(null);
  };

  const handleVerify = () => {
    let orderMismatch = false;
    let indentMismatch = false;
    let totalZeroInsideLoop = false;

    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.correctOrder !== i) orderMismatch = true;
      if (b.currentIndent !== b.correctIndent) indentMismatch = true;
      if (b.code.includes("total = 0") && b.currentIndent === 1) totalZeroInsideLoop = true;
    }

    if (!orderMismatch && !indentMismatch) {
      const msg = "Spot on! The running total starts outside at 0, the accumulator updates inside the loop, and print runs after completion.";
      setCheckedResult({ checked: true, isCorrect: true, feedback: msg });
      onCheck(true, msg, false);
      return;
    }

    if (totalZeroInsideLoop) {
      const msg = "Watch out: indenting total = 0 puts it inside the loop, resetting your sum back to zero on every pass. Keep it outside above the for loop!";
      setCheckedResult({ checked: true, isCorrect: false, feedback: msg });
      onCheck(false, msg, true);
      return;
    }

    if (orderMismatch) {
      const msg = "Check the execution sequence: initialize total = 0 first, then start the loop, then print the result.";
      setCheckedResult({ checked: true, isCorrect: false, feedback: msg });
      onCheck(false, msg, false);
      return;
    }

    if (indentMismatch) {
      const msg = "The ordering is correct, but check the indentation! Which statement should repeat inside the loop?";
      setCheckedResult({ checked: true, isCorrect: false, feedback: msg });
      onCheck(false, msg, false);
      return;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden my-5">
      <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-xs text-slate-800">
            Code Block Assembly
          </h3>
          <p className="text-[11px] text-slate-500">
            Arrange and indent the blocks to form a working loop.
          </p>
        </div>
        <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
          No Typing Errors
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Reorderable Code Blocks */}
        <div className="space-y-2">
          {blocks.map((block, idx) => (
            <div
              key={block.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                block.currentIndent === 1
                  ? "bg-indigo-50/40 border-indigo-200 ml-8 ring-1 ring-indigo-200/60"
                  : "bg-slate-50/80 border-slate-200 hover:border-slate-300 ml-0"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-mono text-xs w-4 select-none">
                  {idx + 1}
                </span>
                {block.currentIndent === 1 && (
                  <span className="text-indigo-500 font-mono text-xs font-bold select-none">
                    &rarr;
                  </span>
                )}
                <code className="font-mono text-xs text-slate-800 font-semibold">
                  {block.code}
                </code>
              </div>

              {!readOnly && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 disabled:opacity-30 cursor-pointer text-xs"
                    title="Move line up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === blocks.length - 1}
                    className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 disabled:opacity-30 cursor-pointer text-xs"
                    title="Move line down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleIndent(idx)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      block.currentIndent === 1
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    {block.currentIndent === 1 ? "Outdent" : "Indent"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Button */}
        {!readOnly && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleVerify}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run Assembled Code</span>
            </button>
          </div>
        )}

        {/* Inline Feedback */}
        {checkedResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              checkedResult.isCorrect
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            {checkedResult.isCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold">
                {checkedResult.isCorrect ? "Code Runs Successfully!" : "Scope Check Needed"}
              </div>
              <div className="text-xs opacity-90 mt-0.5">{checkedResult.feedback}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
