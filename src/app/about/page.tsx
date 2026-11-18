import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, ShieldCheck, Sparkles, Cpu, Clock, HelpCircle } from "lucide-react";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-ink flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-stone-border bg-white py-3 px-6 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-calm-indigo hover:underline font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Learning Bench</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-light">Identity Token:</span>
            <span className="font-mono bg-paper-50 px-2 py-0.5 rounded border border-stone-border font-bold text-calm-indigo text-xs">
              24b3007
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-8 text-xs">
        {/* Exam Card Metadata Card */}
        <section className="bg-white rounded-2xl border border-stone-border p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-border">
            <div>
              <span className="text-[11px] font-mono text-calm-indigo uppercase tracking-wider font-bold">
                ET 617-2026 End-Semester Examination
              </span>
              <h1 className="text-xl font-bold text-ink mt-0.5">
                LoopStep: Calm Adaptive Python Loop Tutor
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-calm-greenBg text-calm-green border border-calm-greenBorder px-2.5 py-1 rounded-full font-mono font-bold text-xs">
                Roll No: 24b3007
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className="p-3 bg-paper-50 rounded-xl border border-stone-border">
              <span className="text-[10px] text-ink-faint uppercase font-bold">Problem Statement</span>
              <div className="font-bold text-ink text-xs mt-0.5">P4: Adaptive Tutor</div>
              <p className="text-[11px] text-ink-light mt-0.5">Automatic question generation & misconception diagnosis.</p>
            </div>
            <div className="p-3 bg-paper-50 rounded-xl border border-stone-border">
              <span className="text-[10px] text-ink-faint uppercase font-bold">Subject Content</span>
              <div className="font-bold text-ink text-xs mt-0.5">T10: Python Loops</div>
              <p className="text-[11px] text-ink-light mt-0.5">Classes 8–11: for loops, range(), and accumulators.</p>
            </div>
            <div className="p-3 bg-paper-50 rounded-xl border border-stone-border">
              <span className="text-[10px] text-ink-faint uppercase font-bold">Learner Persona</span>
              <div className="font-bold text-ink text-xs mt-0.5">L5: Repeating Learner</div>
              <p className="text-[11px] text-ink-light mt-0.5">Aarav (age 15, Cl 10): High anxiety, low self-efficacy.</p>
            </div>
            <div className="p-3 bg-paper-50 rounded-xl border border-stone-border">
              <span className="text-[10px] text-ink-faint uppercase font-bold">Design Constraint</span>
              <div className="font-bold text-ink text-xs mt-0.5">C4: 10-Minute Sessions</div>
              <p className="text-[11px] text-ink-light mt-0.5">One sequence fits in 10 mins with stop & resume.</p>
            </div>
          </div>
        </section>

        {/* P4 Mandatory Design Challenge: The 3-Way Decision Rule */}
        <section className="bg-white rounded-2xl border border-stone-border p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-calm-amber"></div>
            <h2 className="text-base font-bold text-ink">
              P4 Mandatory Design Challenge: The 3-Way Decision Rule
            </h2>
          </div>
          <p className="text-ink-light leading-relaxed">
            The tutor combines learner performance (accuracy on first attempt), misconception diagnosis (identifying M1 or M2), and interaction signals (hints requested, retry attempts, time on task) into a deterministic + AI-verified decision matrix:
          </p>

          <div className="overflow-x-auto border border-stone-border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F2EB] border-b border-stone-border text-ink font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Signal & Condition</th>
                  <th className="py-2.5 px-3">Tutor Decision Outcome</th>
                  <th className="py-2.5 px-3">Pedagogical Action in UI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-border/60">
                <tr className="bg-white">
                  <td className="py-2.5 px-3 font-medium">
                    Correct on 1st attempt + 0 hints used + solid explanation (score &ge; 0.75)
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-calm-greenBg text-calm-green border border-calm-greenBorder px-2 py-0.5 rounded font-bold">
                      Outcome 1: Harder Question
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-ink-light">
                    Advances difficulty tier (Tier 1 &rarr; Tier 2 &rarr; Tier 3), introducing negative steps `range(10, 4, -2)` while calming test anxiety.
                  </td>
                </tr>
                <tr className="bg-paper-50/50">
                  <td className="py-2.5 px-3 font-medium">
                    Exhibits M1 (Inclusive stop bound) or M2 (Accumulator overwrite), or code correct with flawed explanation
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-calm-amberBg text-calm-amber border border-calm-amberBorder px-2 py-0.5 rounded font-bold">
                      Outcome 2: Alternative Explanation
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-ink-light">
                    Holds current tier; unlocks the Interactive Divergence Trace Visualizer spotlighting the exact pass where prediction failed; presents Stop Sign / Piggy Bank metaphor + isomorphic parallel practice.
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="py-2.5 px-3 font-medium">
                    &ge; 2 consecutive errors on same tier OR basic variable update confusion OR clicked &ldquo;I&apos;m stuck&rdquo;
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="bg-calm-indigoBg text-calm-indigo border border-calm-indigoBorder px-2 py-0.5 rounded font-bold">
                      Outcome 3: Prerequisite Instruction
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-ink-light">
                    Steps down to a 60-second non-loop variable update micro-card (`score = 2` &rarr; `score = score + 3` &rarr; `score = score + 4`) before gently returning to the loop activity.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* D6: AI Functionality Specification */}
        <section className="bg-white rounded-2xl border border-stone-border p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-calm-indigo" />
            <h2 className="text-base font-bold text-ink">
              Deliverable D6: AI Functionality Specification
            </h2>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-paper-50 rounded-xl border border-stone-border">
              <span className="font-semibold text-ink">1. What the AI does:</span>
              <p className="text-ink-light mt-0.5">
                Evaluates free-text learner explanations (evaluating whether Aarav truly understands loop control flow vs. just guessing code), diagnoses whether mistakes stem from M1, M2, or prerequisite arithmetic gaps, and generates structured follow-up recommendations and adaptive questions.
              </p>
            </div>

            <div className="p-3 bg-paper-50 rounded-xl border border-stone-border">
              <span className="font-semibold text-ink">2. Model & SDK:</span>
              <p className="text-ink-light mt-0.5 font-mono text-[11px]">
                Google Gen AI SDK (`@google/genai`) invoking model `gemini-3.8-flash` with structured outputs (`responseMimeType: &quot;application/json&quot;`).
              </p>
            </div>

            <div className="p-3 bg-paper-50 rounded-xl border border-stone-border">
              <span className="font-semibold text-ink">3. Output Validation & Guardrail:</span>
              <p className="text-ink-light mt-0.5">
                Every AI response is intercepted and validated against a runtime <code className="font-bold">Zod schema</code> ensuring non-empty supportive feedback, valid decisionOutcome enum, and safe ranges before any text is rendered to the learner.
              </p>
            </div>

            <div className="p-3 bg-paper-50 rounded-xl border border-stone-border">
              <span className="font-semibold text-ink">4. Deterministic Fallback Guarantee:</span>
              <p className="text-ink-light mt-0.5">
                If the Gemini API key is not configured, times out (&gt;4s), or returns an unexpected schema, the system seamlessly transitions to our pure-TypeScript deterministic pedagogical engine in `src/lib/decisionRule.ts` and `src/lib/curriculum.ts`. The UI never crashes and displays an &ldquo;Offline Guided Mode&rdquo; badge.
              </p>
            </div>
          </div>
        </section>

        {/* Deliverable D7: Pedagogical Rationale (L5 & C4 Alignment) */}
        <section className="bg-white rounded-2xl border border-stone-border p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-calm-green" />
            <h2 className="text-base font-bold text-ink">
              Deliverable D7: Pedagogical Rationale & Rubric Alignment
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-paper-50 rounded-xl border border-stone-border">
              <h3 className="font-bold text-ink mb-1">Reducing Anxiety for Persona L5</h3>
              <p className="text-ink-light leading-relaxed">
                Repeating learners who failed programming suffer from imposter feelings. LoopStep replaces red error dialogs with warm, conversational active voice (&ldquo;we&rdquo;, &ldquo;let&apos;s&rdquo;), frames mistakes as clues, and provides an Interactive Variable Trace Table that offloads working memory so learners don&apos;t have to do mental arithmetic.
              </p>
            </div>

            <div className="p-4 bg-paper-50 rounded-xl border border-stone-border">
              <h3 className="font-bold text-ink mb-1">10-Minute Stop & Resume (Constraint C4)</h3>
              <p className="text-ink-light leading-relaxed">
                A 10-minute time-boxed sequence (5 micro-stages) prevents burnout. If Aarav is interrupted on his shared family laptop, clicking &ldquo;Pause & Save&rdquo; freezes the countdown, obscures the problem to relieve time anxiety, and persists his entire state in localStorage for zero-loss resumption.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Persistent Footer */}
      <Footer />
    </div>
  );
}
