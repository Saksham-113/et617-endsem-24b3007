import React, { useState } from "react";
import { ParsonsBlock } from "@/lib/curriculum";
import { ArrowUp, ArrowDown, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, Code2 } from "lucide-react";

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
      if (b.correctOrder !== i) {
        orderMismatch = true;
      }
      if (b.currentIndent !== b.correctIndent) {
        indentMismatch = true;
      }
      // Check if total = 0 was placed after for loop with indentation
      if (b.code.includes("total = 0") && b.currentIndent === 1) {
        totalZeroInsideLoop = true;
      }
    }

    if (!orderMismatch && !indentMismatch) {
      const msg = "🌟 Spot on! The initialization is outside, the accumulator is indented inside the loop, and print runs after completion.";
      setCheckedResult({ checked: true, isCorrect: true, feedback: msg });
      onCheck(true, msg, false);
      return;
    }

    if (totalZeroInsideLoop) {
      const msg = "⚠️ Watch out! Indenting `total = 0` puts it inside the loop, resetting your piggy bank to zero on every pass. Move it above `for` with zero indent!";
      setCheckedResult({ checked: true, isCorrect: false, feedback: msg });
      onCheck(false, msg, true);
      return;
    }

    if (orderMismatch) {
      const msg = "Look closely at the execution order: we must initialize `total = 0` first, then run the `for` loop, and finally `print(total)`.";
      setCheckedResult({ checked: true, isCorrect: false, feedback: msg });
      onCheck(false, msg, false);
      return;
    }

    if (indentMismatch) {
      const msg = "The ordering is right, but check the indentation! Which statement needs to repeat on every pass inside the loop?";
      setCheckedResult({ checked: true, isCorrect: false, feedback: msg });
      onCheck(false, msg, false);
      return;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-border shadow-xs overflow-hidden my-4">
      <div className="bg-[#F5F2EB] px-4 py-3 border-b border-stone-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-calm-indigo" />
          <h3 className="font-semibold text-sm text-ink">
            Parsons Block Assembly (Format B)
          </h3>
        </div>
        <span className="text-xs text-ink-faint">
          Reorder & Indent with zero typing fatigue
        </span>
      </div>

      <div className="p-4 space-y-2">
        <p className="text-xs text-ink-light mb-3">
          Use the <span className="font-semibold text-ink">↑ / ↓</span> buttons to change line sequence, and{" "}
          <span className="font-semibold text-ink">Indent</span> to shift a line inside the loop.
        </p>

        <div className="space-y-2 font-mono text-xs">
          {blocks.map((block, idx) => (
            <div
              key={block.id}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                block.currentIndent === 1
                  ? "bg-calm-indigoBg/30 border-calm-indigoBorder ml-8"
                  : "bg-paper-50 border-stone-border ml-0"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-ink-faint text-[10px] w-4">{idx + 1}.</span>
                {block.currentIndent === 1 && (
                  <span className="text-calm-indigo text-xs font-bold">&rarr;</span>
                )}
                <span className="font-semibold text-ink">{block.code}</span>
              </div>

              {!readOnly && (
                <div className="flex items-center gap-1 font-sans">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1 bg-white hover:bg-stone-subtle text-ink rounded border border-stone-border disabled:opacity-30 cursor-pointer text-xs"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === blocks.length - 1}
                    className="p-1 bg-white hover:bg-stone-subtle text-ink rounded border border-stone-border disabled:opacity-30 cursor-pointer text-xs"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleIndent(idx)}
                    className={`px-2 py-0.5 rounded border text-[11px] font-medium transition cursor-pointer ${
                      block.currentIndent === 1
                        ? "bg-calm-indigo text-white border-calm-indigo"
                        : "bg-white text-ink hover:bg-stone-subtle border-stone-border"
                    }`}
                  >
                    {block.currentIndent === 1 ? "Outdent" : "Indent"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {!readOnly && (
          <div className="pt-3 border-t border-stone-border flex justify-end">
            <button
              onClick={handleVerify}
              className="px-4 py-2 bg-calm-indigo hover:bg-indigo-700 text-white font-medium rounded-lg text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verify Code Order & Scope</span>
            </button>
          </div>
        )}

        {checkedResult && (
          <div
            className={`mt-3 p-3 rounded-lg border text-xs flex items-start gap-2 ${
              checkedResult.isCorrect
                ? "bg-calm-greenBg/40 border-calm-greenBorder text-ink"
                : "bg-calm-amberBg/40 border-calm-amberBorder text-ink"
            }`}
          >
            {checkedResult.isCorrect ? (
              <CheckCircle2 className="w-4 h-4 text-calm-green shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-calm-amber shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold mb-0.5">
                {checkedResult.isCorrect ? "Perfect Assembly!" : "Let's Re-evaluate Scope"}
              </div>
              <p className="text-ink-light">{checkedResult.feedback}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
