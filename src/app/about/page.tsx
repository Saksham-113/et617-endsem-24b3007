import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, ShieldCheck, Sparkles, Cpu, Clock, HelpCircle } from "lucide-react";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white py-3 px-6 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 transition font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Learning Bench</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Identity:</span>
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-bold text-indigo-600 text-xs">
              24b3007
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6 text-xs">
        {/* System Overview */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-mono text-indigo-600 uppercase tracking-wider font-bold">
                ET 617 End-Semester Examination
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-0.5">
                LoopStep: Adaptive Python Loop Tutor
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-mono font-bold text-xs">
                Roll No: 24b3007
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Architecture</span>
              <div className="font-bold text-slate-800 text-xs mt-0.5">Adaptive Tutor (P4)</div>
              <p className="text-[11px] text-slate-500 mt-0.5">3+ non-MCQ formats & misconception diagnosis.</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Subject Content</span>
              <div className="font-bold text-slate-800 text-xs mt-0.5">Python Loops (T10)</div>
              <p className="text-[11px] text-slate-500 mt-0.5">range() bounds, step sizes, and accumulators.</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Learner Target</span>
              <div className="font-bold text-slate-800 text-xs mt-0.5">Remedial Focus (L5)</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Anxiety reduction, working memory offloading.</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Session Architecture</span>
              <div className="font-bold text-slate-800 text-xs mt-0.5">10-Minute Sessions (C4)</div>
              <p className="text-[11px] text-slate-500 mt-0.5">5 micro-stages with zero-loss pause & resume.</p>
            </div>
          </div>
        </section>

        {/* The 3-Way Decision Rule */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
            <h2 className="text-sm font-bold text-slate-900">
              Pedagogical Decision Engine (3-Way Rule)
            </h2>
          </div>
          <p className="text-slate-600 leading-relaxed text-xs">
            The tutor combines learner accuracy, diagnosed misconceptions, and interaction signals (attempts and hint requests) into a deterministic decision matrix:
          </p>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Condition</th>
                  <th className="py-2.5 px-3">Tutor Decision</th>
                  <th className="py-2.5 px-3">Pedagogical Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-white">
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    Correct on 1st attempt with 0 hints and solid explanation
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                      Outcome 1: Harder Question
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    Advances difficulty tier, introducing negative step sizes like <code className="bg-slate-100 px-1 rounded">range(10, 4, -2)</code>.
                  </td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    Inclusive bound error (M1) or accumulator overwrite (M2)
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-bold">
                      Outcome 2: Alternative Explanation
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    Maintains tier; activates divergence visualizer spotlighting the exact iteration, provides Stop Sign or Piggy Bank metaphor, and offers isomorphic parallel task.
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    &ge; 2 consecutive failures on same tier or clicks &ldquo;Review Foundation&rdquo;
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-bold">
                      Outcome 3: Prerequisite Instruction
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    Steps down to a 60-second non-loop variable update card (<code className="bg-slate-100 px-1 rounded">score = score + 3</code>) before returning to loops.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* D6 AI Specification */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              AI Functionality Specification (D6)
            </h2>
          </div>

          <div className="space-y-2 text-slate-600 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <strong className="text-slate-800">Model:</strong> Google Gemini 3.8 Flash (`@google/genai`) with structured JSON schema (`responseMimeType: &quot;application/json&quot;`).
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <strong className="text-slate-800">Validation Guardrail:</strong> Output is parsed against a strict runtime Zod schema ensuring valid decision outcomes and supportive non-punitive feedback.
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <strong className="text-slate-800">Fallback Guarantee:</strong> If the API key is not present or an AI call times out (&gt;4s), the system transitions transparently to our pure-TypeScript deterministic engine in `decisionRule.ts`.
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
