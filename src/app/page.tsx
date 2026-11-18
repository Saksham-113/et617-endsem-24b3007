"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Play,
  Lightbulb,
  HeartHandshake,
  Layers,
  FileCode,
  Flame,
} from "lucide-react";
import SessionHeader from "@/components/SessionHeader";
import PauseOverlay from "@/components/PauseOverlay";
import TraceTableTool from "@/components/TraceTableTool";
import ParsonsBlockEditor from "@/components/ParsonsBlockEditor";
import BugFixExplainer from "@/components/BugFixExplainer";
import DecisionOutcomeModal from "@/components/DecisionOutcomeModal";
import VivaScenarioSwitcher from "@/components/VivaScenarioSwitcher";
import Footer from "@/components/Footer";
import {
  AARAV_PERSONA,
  MICRO_CONCEPT_LESSON,
  TASK_BANK,
  getTaskById,
  TaskDefinition,
  DecisionOutcomeType,
} from "@/lib/curriculum";
import {
  loadSavedSession,
  saveSession,
  clearSavedSession,
  SessionSnapshot,
  formatTime,
} from "@/lib/sessionStore";
import { LearnerTraceRow, DivergenceResult } from "@/lib/loopTracer";
import { evaluateDecisionRule } from "@/lib/decisionRule";

const STAGE_TITLES = [
  "Welcome & Check-In",
  "Warmup Diagnostic",
  "Visual Micro-Concept",
  "Adaptive Loop Arena",
  "Session Mastery & Review",
];

export default function HomePage() {
  // Session & Timer State (C4: 10-Minute Sessions)
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [difficultyTier, setDifficultyTier] = useState<1 | 2 | 3>(1);

  // Active Task & Pedagogy State (P4)
  const [activeTaskId, setActiveTaskId] = useState<string>("task_1_trace_basic");
  const [consecutiveErrors, setConsecutiveErrors] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);

  // Decision Modal State
  const [activeDecision, setActiveDecision] = useState<{
    outcome: DecisionOutcomeType;
    rationale: string;
    feedbackHeader: string;
    feedbackBody: string;
    metaphor?: "STOP_SIGN" | "PIGGY_BANK" | "VARIABLE_BOX";
    engineUsed: string;
    nextTaskId: string;
  } | null>(null);

  // Warmup state (Stage 1)
  const [warmupSelected, setWarmupSelected] = useState<string>("");
  const [warmupFeedback, setWarmupFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Saved Session Detection (C4)
  const [savedSnapshot, setSavedSnapshot] = useState<SessionSnapshot | null>(null);

  // Initial mount: check for saved session in localStorage
  useEffect(() => {
    const saved = loadSavedSession();
    if (saved && saved.elapsedSeconds < 600) {
      setSavedSnapshot(saved);
    }
  }, []);

  // 10-Minute countdown tick
  useEffect(() => {
    if (stageIndex === 0 && !savedSnapshot) return; // Don't tick on welcome screen before start
    if (isPaused) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const nextVal = prev + 1;
        // Auto-save snapshot every 5 seconds for robust C4 persistence
        if (nextVal % 5 === 0) {
          saveSession({
            sessionId: "session_24b3007",
            totalTimeSeconds: 600,
            elapsedSeconds: nextVal,
            stageIndex,
            activeTaskId,
            isPaused: false,
            history: [],
            savedAt: Date.now(),
          });
        }
        if (nextVal >= 600) {
          setStageIndex(4); // Advance to summary when 10 mins complete
          return 600;
        }
        return nextVal;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, stageIndex, activeTaskId, savedSnapshot]);

  const activeTask = getTaskById(activeTaskId);

  // Handlers for Pause/Resume
  const handleTogglePause = () => {
    const newPause = !isPaused;
    setIsPaused(newPause);
    saveSession({
      sessionId: "session_24b3007",
      totalTimeSeconds: 600,
      elapsedSeconds,
      stageIndex,
      activeTaskId,
      isPaused: newPause,
      history: [],
      savedAt: Date.now(),
    });
  };

  const handleResumeSavedSession = () => {
    if (!savedSnapshot) return;
    setElapsedSeconds(savedSnapshot.elapsedSeconds);
    setStageIndex(savedSnapshot.stageIndex);
    setActiveTaskId(savedSnapshot.activeTaskId || "task_1_trace_basic");
    setIsPaused(false);
    setSavedSnapshot(null);
  };

  const handleStartFresh = () => {
    clearSavedSession();
    setSavedSnapshot(null);
    setElapsedSeconds(0);
    setStageIndex(1); // Jump to Warmup
    setIsPaused(false);
  };

  // Evaluate submission via /api/tutor or fallback
  const processSubmission = async (
    learnerInput: any,
    preliminaryIsCorrect: boolean,
    preliminaryMisconception: "M1" | "M2" | "PREREQ" | "NONE" | "OTHER",
    explanation: string = ""
  ) => {
    setIsApiLoading(true);
    setAttempts((prev) => prev + 1);

    const nextAttemptCount = attempts + 1;
    const nextConsecutiveErrors = preliminaryIsCorrect ? 0 : consecutiveErrors + 1;
    setConsecutiveErrors(nextConsecutiveErrors);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: activeTaskId,
          learnerInput,
          learnerExplanation: explanation,
          attemptCount: nextAttemptCount,
          consecutiveErrorsOnTier: nextConsecutiveErrors,
          hintsRequested: hintsUsed,
          timeSpentSeconds: 30,
          explicitStuckSignal: false,
          preliminaryIsCorrect,
          preliminaryMisconception,
        }),
      });

      const data = await response.json();

      let metaphor: "STOP_SIGN" | "PIGGY_BANK" | "VARIABLE_BOX" | undefined;
      if (data.diagnosedMisconception === "M1") metaphor = "STOP_SIGN";
      else if (data.diagnosedMisconception === "M2") metaphor = "PIGGY_BANK";
      else if (data.decisionOutcome === "PREREQUISITE_INSTRUCTION") metaphor = "VARIABLE_BOX";

      setActiveDecision({
        outcome: data.decisionOutcome,
        rationale: data.rationale,
        feedbackHeader: data.suggestedAction || "Tutor Guidance",
        feedbackBody: data.supportiveFeedback,
        metaphor,
        engineUsed: data.engineUsed || "LoopStep Pedagogical Engine",
        nextTaskId:
          data.decisionOutcome === "HARDER_QUESTION"
            ? activeTask.nextHarderTaskId || activeTaskId
            : data.decisionOutcome === "PREREQUISITE_INSTRUCTION"
            ? "task_prereq_assignment"
            : activeTask.nextAltTaskId || activeTaskId,
      });
    } catch (err) {
      // Deterministic client fallback if network fails
      const fallbackDecision = evaluateDecisionRule(activeTask, {
        taskId: activeTaskId,
        isCorrect: preliminaryIsCorrect,
        diagnosedMisconception: preliminaryMisconception,
        attemptCount: nextAttemptCount,
        consecutiveErrorsOnTier: nextConsecutiveErrors,
        hintsRequested: hintsUsed,
        timeSpentSeconds: 30,
      });

      setActiveDecision({
        outcome: fallbackDecision.outcome,
        rationale: fallbackDecision.rationale,
        feedbackHeader: fallbackDecision.feedbackHeader,
        feedbackBody: fallbackDecision.feedbackBody,
        metaphor: fallbackDecision.scaffoldingUnlocked.showVisualMetaphor,
        engineUsed: "Client-Side Offline Engine (Guaranteed Fallback)",
        nextTaskId: fallbackDecision.nextTaskId,
      });
    } finally {
      setIsApiLoading(false);
    }
  };

  // Format A: Trace Table Verification
  const handleTraceSubmit = (rows: LearnerTraceRow[], divergence: DivergenceResult) => {
    const isCorrect = !divergence.hasDiverged;
    const misconception = divergence.diagnosedMisconception || (isCorrect ? "NONE" : "OTHER");
    processSubmission(rows, isCorrect, misconception);
  };

  // Format B: Parsons Verification
  const handleParsonsCheck = (isCorrect: boolean, feedback: string, diagnosedM2: boolean) => {
    const misconception = diagnosedM2 ? "M2" : isCorrect ? "NONE" : "OTHER";
    processSubmission("Parsons blocks assembled", isCorrect, misconception);
  };

  // Format C: BugFix & Explanation
  const handleBugFixSubmit = (fixChoice: string, explanation: string) => {
    const isCorrect = fixChoice === "opt_both";
    let misconception: "M1" | "M2" | "PREREQ" | "NONE" = "NONE";
    if (fixChoice === "opt_m1_only") misconception = "M2";
    if (fixChoice === "opt_m2_only") misconception = "M1";
    if (fixChoice === "opt_reset_inside") misconception = "M2";

    processSubmission(fixChoice, isCorrect, misconception, explanation);
  };

  // Prerequisite Task Submission
  const handlePrereqSubmit = (answer: string) => {
    const isCorrect = answer.trim() === "9";
    processSubmission({ answer }, isCorrect, isCorrect ? "NONE" : "PREREQ");
  };

  // Proceed after Decision Modal
  const handleProceedFromDecision = () => {
    if (!activeDecision) return;
    setActiveTaskId(activeDecision.nextTaskId);
    const nextTask = getTaskById(activeDecision.nextTaskId);
    setDifficultyTier(nextTask.tier);
    setActiveDecision(null);
    setAttempts(0);
    setHintsUsed(0);
    setShowHint(false);
  };

  // Handle Viva Scenario Switcher Actions (For examiner inspection)
  const handleVivaScenario = (scenarioType: "CORRECT_PATH" | "M1_PATH" | "M2_PATH" | "PREREQ_PATH") => {
    setStageIndex(3); // Jump right to Practice Arena
    if (scenarioType === "CORRECT_PATH") {
      setActiveTaskId("task_1_trace_basic");
      setActiveDecision({
        outcome: "HARDER_QUESTION",
        rationale: "Examiner Viva Demo: Correct on 1st attempt with 0 hints -> Outcome 1.",
        feedbackHeader: "🚀 Advancing to Tier 2 / Custom Steps!",
        feedbackBody: "Spot on! You tracked range(1, 4) cleanly (1 -> 3 -> 6) without including 4. Let's try custom step sizes next!",
        engineUsed: "Viva Evaluation Demo Engine",
        nextTaskId: "task_4_trace_step",
      });
    } else if (scenarioType === "M1_PATH") {
      setActiveTaskId("task_1_trace_basic");
      setActiveDecision({
        outcome: "ALTERNATIVE_EXPLANATION",
        rationale: "Examiner Viva Demo: Inclusive upper-bound fallacy (includes 4 in range(1, 4)) -> Outcome 2.",
        feedbackHeader: "🛑 The Stop Sign Rule (M1 Shield)",
        feedbackBody: "You included 4 in range(1, 4). Remember: Python stops right BEFORE 4! Unlocking the Stop Sign visual breakdown.",
        metaphor: "STOP_SIGN",
        engineUsed: "Viva Evaluation Demo Engine",
        nextTaskId: "task_1_isomorphic_alt",
      });
    } else if (scenarioType === "M2_PATH") {
      setActiveTaskId("task_1_trace_basic");
      setActiveDecision({
        outcome: "ALTERNATIVE_EXPLANATION",
        rationale: "Examiner Viva Demo: Accumulator overwrite (total = i) -> Outcome 2.",
        feedbackHeader: "🐖 Piggy Bank vs. Whiteboard (M2 Shield)",
        feedbackBody: "You wrote total = i, which wiped out previous totals. With total = total + i, new coins drop into the piggy bank!",
        metaphor: "PIGGY_BANK",
        engineUsed: "Viva Evaluation Demo Engine",
        nextTaskId: "task_1_isomorphic_alt",
      });
    } else if (scenarioType === "PREREQ_PATH") {
      setActiveTaskId("task_prereq_assignment");
      setActiveDecision({
        outcome: "PREREQUISITE_INSTRUCTION",
        rationale: "Examiner Viva Demo: 2+ consecutive errors or high anxiety -> Outcome 3.",
        feedbackHeader: "🌱 60-Second Variable Update Foundation",
        feedbackBody: "Let's step back from loops for 60 seconds and master sequential updates: score = score + 3 without loop syntax.",
        metaphor: "VARIABLE_BOX",
        engineUsed: "Viva Evaluation Demo Engine",
        nextTaskId: "task_prereq_assignment",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-ink flex flex-col font-sans relative selection:bg-calm-indigoBg selection:text-calm-indigo">
      {/* C4 Session Header */}
      <SessionHeader
        elapsedSeconds={elapsedSeconds}
        totalSeconds={600}
        currentStageIndex={stageIndex}
        stageTitles={STAGE_TITLES}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        difficultyTier={difficultyTier}
      />

      {/* C4 Pause Overlay */}
      {isPaused && (
        <PauseOverlay
          remainingSeconds={Math.max(0, 600 - elapsedSeconds)}
          stageName={STAGE_TITLES[stageIndex]}
          onResume={() => setIsPaused(false)}
        />
      )}

      {/* Main Learning Content Area */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {/* ========================================================= */}
        {/* STAGE 0: WELCOME & CALM REASSURANCE / RESUME CHECK        */}
        {/* ========================================================= */}
        {stageIndex === 0 && (
          <div className="bg-white rounded-2xl border border-stone-border p-6 shadow-xs space-y-6 animate-fade-in text-xs">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-border">
              <div>
                <span className="text-[11px] font-mono text-calm-indigo uppercase tracking-wider font-bold">
                  Card P4 · T10 · L5 · C4 | ID: 24b3007
                </span>
                <h2 className="text-xl font-bold text-ink mt-1">
                  Welcome to LoopStep, Aarav!
                </h2>
                <p className="text-xs text-ink-light mt-1">
                  A calm, stress-free 10-minute learning bench for Class 10 Python loops.
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-calm-indigoBg text-calm-indigo flex items-center justify-center shrink-0">
                <HeartHandshake className="w-6 h-6" />
              </div>
            </div>

            {/* Resume Banner if saved snapshot exists */}
            {savedSnapshot && (
              <div className="p-4 bg-calm-amberBg/40 rounded-xl border border-calm-amberBorder flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-calm-amber shrink-0" />
                  <div>
                    <h3 className="font-bold text-ink">Saved Session Found!</h3>
                    <p className="text-ink-light text-[11px]">
                      You have {formatTime(600 - savedSnapshot.elapsedSeconds)} left from your last session.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleResumeSavedSession}
                  className="px-4 py-2 bg-calm-indigo hover:bg-indigo-700 text-white rounded-lg font-medium shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Resume at Stage {savedSnapshot.stageIndex + 1}</span>
                </button>
              </div>
            )}

            {/* Anxiety Reduction Promise */}
            <div className="p-4 bg-[#F5F2EB] rounded-xl border border-stone-border space-y-2">
              <h3 className="font-bold text-ink flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-calm-green" />
                <span>Our 3 Low-Anxiety Guarantees:</span>
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-ink-light">
                <li>
                  <strong>No Red Error Banners:</strong> Mistakes are clues. If a trace doesn&apos;t match, our tutor highlights the divergence and explains why.
                </li>
                <li>
                  <strong>Zero Mental Calculation Overload:</strong> You have an interactive Variable Trace Table that keeps track of memory frames for you.
                </li>
                <li>
                  <strong>Time-Boxed to 10 Minutes:</strong> You are never stuck in an endless quiz. When the timer hits 10:00, you are done for the day!
                </li>
              </ul>
            </div>

            {/* 5-Step Sequence Overview */}
            <div>
              <h3 className="font-semibold text-ink mb-2">Today&apos;s 10-Minute Roadmap:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {STAGE_TITLES.map((title, i) => (
                  <div key={i} className="p-2.5 rounded-lg border border-stone-border bg-paper-50 text-center">
                    <div className="text-[10px] text-ink-faint font-mono">Stage {i + 1}</div>
                    <div className="font-semibold text-ink text-[11px] mt-0.5">{title}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleStartFresh}
                className="px-6 py-2.5 bg-calm-indigo hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Start 10-Minute Sequence</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 1: WARMUP DIAGNOSTIC                                */}
        {/* ========================================================= */}
        {stageIndex === 1 && (
          <div className="bg-white rounded-2xl border border-stone-border p-6 shadow-xs space-y-5 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-border">
              <div>
                <span className="text-[11px] font-mono text-calm-green font-bold">Stage 1 of 5</span>
                <h2 className="text-lg font-bold text-ink mt-0.5">Quick Warmup: The Stop Boundary</h2>
              </div>
              <span className="text-[11px] text-ink-faint">~1 minute</span>
            </div>

            <p className="text-ink-light">
              Let&apos;s test our baseline intuition. In Python, what numbers are visited when we run this loop?
            </p>

            <div className="p-3 bg-paper-50 rounded-lg border border-stone-border font-mono text-xs text-ink">
              for i in range(1, 4):
                  print(i)
            </div>

            <div className="space-y-2">
              {[
                { id: "opt_inclusive", label: "1, 2, 3, 4 (includes 4)", isM1: true },
                { id: "opt_exclusive", label: "1, 2, 3 (stops right before 4)", isCorrect: true },
                { id: "opt_zero_start", label: "0, 1, 2, 3 (starts at 0)", isOther: true },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    warmupSelected === opt.id
                      ? "bg-calm-indigoBg/40 border-calm-indigo"
                      : "bg-white border-stone-border hover:bg-paper-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="warmup"
                    value={opt.id}
                    checked={warmupSelected === opt.id}
                    onChange={() => {
                      setWarmupSelected(opt.id);
                      if (opt.isCorrect) {
                        setWarmupFeedback({
                          isCorrect: true,
                          text: "🌟 Exactly right! Python treats the second number as a stop sign — it stops right before 4.",
                        });
                      } else if (opt.isM1) {
                        setWarmupFeedback({
                          isCorrect: false,
                          text: "🛑 Very common catch (Misconception M1)! In Python, range(1, 4) stops right BEFORE 4, so it only visits 1, 2, and 3.",
                        });
                      } else {
                        setWarmupFeedback({
                          isCorrect: false,
                          text: "Notice the start number is 1: range(1, 4) starts at 1 and stops before 4.",
                        });
                      }
                    }}
                    className="text-calm-indigo"
                  />
                  <span className="font-mono font-medium text-ink">{opt.label}</span>
                </label>
              ))}
            </div>

            {warmupFeedback && (
              <div
                className={`p-3 rounded-lg border flex items-start gap-2 ${
                  warmupFeedback.isCorrect
                    ? "bg-calm-greenBg/40 border-calm-greenBorder"
                    : "bg-calm-amberBg/40 border-calm-amberBorder"
                }`}
              >
                {warmupFeedback.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-calm-green shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-calm-amber shrink-0 mt-0.5" />
                )}
                <p className="text-ink text-xs">{warmupFeedback.text}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setStageIndex(2)}
                disabled={!warmupSelected}
                className="px-5 py-2 bg-calm-indigo hover:bg-indigo-700 text-white font-medium rounded-lg text-xs transition shadow-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <span>Continue to Visual Micro-Concept</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 2: VISUAL MICRO-CONCEPT & INTERACTIVE TRACER        */}
        {/* ========================================================= */}
        {stageIndex === 2 && (
          <div className="bg-white rounded-2xl border border-stone-border p-6 shadow-xs space-y-6 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-border">
              <div>
                <span className="text-[11px] font-mono text-calm-green font-bold">Stage 2 of 5</span>
                <h2 className="text-lg font-bold text-ink mt-0.5">
                  The Two Golden Rules of Python Loops
                </h2>
              </div>
              <span className="text-[11px] text-ink-faint">~2 minutes</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MICRO_CONCEPT_LESSON.sections.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-paper-50 rounded-xl border border-stone-border space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-calm-indigo uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-stone-border">
                      {sec.tag}
                    </span>
                    <h3 className="font-bold text-ink text-xs mt-2">{sec.heading}</h3>
                    <p className="text-ink-light text-xs mt-1 leading-relaxed">{sec.body}</p>
                  </div>
                  <div className="mt-2 p-2 bg-white rounded border border-stone-border font-mono text-[11px] text-calm-indigo font-medium">
                    {sec.callout}
                  </div>
                </div>
              ))}
            </div>

            {/* Embedded Live Tracer Tool for hands-on inspection */}
            <TraceTableTool
              loopConfig={{
                initialAccumulatorName: "total",
                initialAccumulatorValue: 0,
                loopVar: "i",
                rangeStart: 1,
                rangeStop: 4,
                rangeStep: 1,
                customCodeSnippet: "for i in range(1, 4): total = total + i",
              }}
              expectedPassCount={3}
              initialLearnerRows={[
                { passNumber: 1, loopVarValue: "1", accumulatorValue: "1" },
                { passNumber: 2, loopVarValue: "2", accumulatorValue: "3" },
                { passNumber: 3, loopVarValue: "3", accumulatorValue: "6" },
              ]}
              readOnly={false}
            />

            <div className="pt-2 flex justify-between items-center border-t border-stone-border">
              <span className="text-[11px] text-ink-faint">Ready to try your first adaptive challenge?</span>
              <button
                onClick={() => setStageIndex(3)}
                className="px-5 py-2.5 bg-calm-indigo hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Enter Adaptive Loop Arena</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 3: ADAPTIVE PRACTICE ARENA (FORMATS A, B, C)        */}
        {/* ========================================================= */}
        {stageIndex === 3 && (
          <div className="space-y-4 animate-fade-in text-xs">
            {/* Task Card Header */}
            <div className="bg-white rounded-2xl border border-stone-border p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-border">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-calm-indigoBg text-calm-indigo px-2 py-0.5 rounded font-bold border border-calm-indigoBorder">
                    Format: {activeTask.format.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-ink-faint">Tier {activeTask.tier}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1 text-[11px] text-calm-amber hover:text-amber-800 bg-calm-amberBg/30 px-2 py-1 rounded border border-calm-amberBorder cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{showHint ? "Hide Hint" : "Need a Hint?"}</span>
                  </button>

                  <button
                    onClick={() => {
                      // Trigger Outcome 3 directly (Prerequisite Instruction)
                      processSubmission("Clicked stuck", false, "PREREQ");
                    }}
                    className="flex items-center gap-1 text-[11px] text-ink-light hover:text-ink bg-paper-50 px-2 py-1 rounded border border-stone-border cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-calm-indigo" />
                    <span>I&apos;m feeling stuck</span>
                  </button>
                </div>
              </div>

              <h2 className="text-base font-bold text-ink mt-3">{activeTask.title}</h2>
              <p className="text-ink-light text-xs mt-1 leading-relaxed">{activeTask.prompt}</p>

              {/* Hint Box if toggled */}
              {showHint && (
                <div className="mt-3 p-3 bg-calm-amberBg/40 rounded-lg border border-calm-amberBorder flex items-start gap-2 animate-fade-in">
                  <Lightbulb className="w-4 h-4 text-calm-amber shrink-0 mt-0.5" />
                  <p className="text-ink text-xs">{activeTask.hint}</p>
                </div>
              )}
            </div>

            {/* Render Specific Question Format */}
            {activeTask.format === "trace_grid" && (
              <TraceTableTool
                loopConfig={activeTask.loopConfig}
                expectedPassCount={activeTask.expectedPassCount || 3}
                onSubmitTrace={handleTraceSubmit}
              />
            )}

            {activeTask.format === "parsons_order" && activeTask.parsonsBlocks && (
              <ParsonsBlockEditor
                initialBlocks={activeTask.parsonsBlocks}
                onCheck={handleParsonsCheck}
              />
            )}

            {activeTask.format === "bugfix_explain" && (
              <BugFixExplainer
                buggyCode={activeTask.buggyCode || activeTask.codeSnippet}
                onSubmit={handleBugFixSubmit}
                isLoading={isApiLoading}
              />
            )}

            {activeTask.format === "prereq_trace" && (
              <div className="bg-white rounded-xl border border-stone-border p-5 shadow-xs space-y-4">
                <div className="p-3 bg-paper-50 rounded-lg border border-stone-border font-mono text-xs">
                  <pre>{activeTask.codeSnippet}</pre>
                </div>

                <div className="flex items-center gap-3">
                  <label className="font-medium text-ink">What is the final value of score?</label>
                  <input
                    type="text"
                    id="prereqInput"
                    placeholder="e.g. 9"
                    className="w-24 px-3 py-1.5 font-mono text-xs rounded border border-stone-border"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById("prereqInput") as HTMLInputElement;
                      if (input) handlePrereqSubmit(input.value);
                    }}
                    className="px-4 py-1.5 bg-calm-indigo text-white font-medium rounded-lg text-xs hover:bg-indigo-700 cursor-pointer"
                  >
                    Verify Foundation
                  </button>
                </div>
              </div>
            )}

            {/* P4 Decision Rule Outcome Modal */}
            {activeDecision && (
              <DecisionOutcomeModal
                outcome={activeDecision.outcome}
                rationale={activeDecision.rationale}
                feedbackHeader={activeDecision.feedbackHeader}
                feedbackBody={activeDecision.feedbackBody}
                metaphor={activeDecision.metaphor}
                engineUsed={activeDecision.engineUsed}
                onProceed={handleProceedFromDecision}
                proceedLabel={
                  activeDecision.outcome === "HARDER_QUESTION"
                    ? "Next Challenge →"
                    : activeDecision.outcome === "PREREQUISITE_INSTRUCTION"
                    ? "Go to 60-Sec Foundation →"
                    : "Try Alternative Practice →"
                }
              />
            )}

            {/* Finish Session Early Option */}
            <div className="pt-2 flex justify-between items-center">
              <span className="text-[11px] text-ink-faint">
                Attempts on this task: {attempts} · Hints used: {hintsUsed}
              </span>
              <button
                onClick={() => setStageIndex(4)}
                className="text-xs text-ink-light hover:text-ink underline cursor-pointer"
              >
                Complete Session & View Summary &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 4: SESSION MASTERY & REVIEW                         */}
        {/* ========================================================= */}
        {stageIndex === 4 && (
          <div className="bg-white rounded-2xl border border-stone-border p-6 shadow-xs space-y-6 animate-fade-in text-xs">
            <div className="text-center space-y-2 pb-4 border-b border-stone-border">
              <div className="w-14 h-14 bg-calm-greenBg text-calm-green rounded-full mx-auto flex items-center justify-center border border-calm-greenBorder shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-ink">
                10-Minute Sequence Complete!
              </h2>
              <p className="text-xs text-ink-light max-w-md mx-auto">
                Incredible focus, Aarav! You took on loop boundaries, dry-run tracing, and accumulators step-by-step.
              </p>
            </div>

            {/* Session Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-paper-50 rounded-xl border border-stone-border text-center">
                <div className="text-[10px] text-ink-faint uppercase font-bold">Total Time Spent</div>
                <div className="text-base font-bold font-mono text-calm-indigo mt-0.5">
                  {formatTime(elapsedSeconds)} / 10:00
                </div>
              </div>
              <div className="p-3 bg-paper-50 rounded-xl border border-stone-border text-center">
                <div className="text-[10px] text-ink-faint uppercase font-bold">Difficulty Reached</div>
                <div className="text-base font-bold text-calm-green mt-0.5">
                  Tier {difficultyTier}: Pattern Trace
                </div>
              </div>
              <div className="p-3 bg-paper-50 rounded-xl border border-stone-border text-center">
                <div className="text-[10px] text-ink-faint uppercase font-bold">Misconceptions Shielded</div>
                <div className="text-base font-bold text-ink mt-0.5">
                  M1 & M2 Defended
                </div>
              </div>
            </div>

            {/* Key Insights Mastered */}
            <div className="p-4 bg-[#F5F2EB] rounded-xl border border-stone-border space-y-2">
              <h3 className="font-bold text-ink">Takeaways for Your Class 10 Re-Test:</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-ink-light">
                <li>
                  <strong>Rule 1 (The Stop Sign):</strong> `range(start, stop)` ALWAYS stops before `stop`. `range(1, 6)` visits 1, 2, 3, 4, 5.
                </li>
                <li>
                  <strong>Rule 2 (The Piggy Bank):</strong> `total = total + i` drops each new number into the piggy bank without erasing the past.
                </li>
                <li>
                  <strong>Rule 3 (Indentation Scope):</strong> Keep `total = 0` outside the loop, and only indent the line that repeats inside.
                </li>
              </ul>
            </div>

            <div className="pt-2 flex flex-wrap justify-between items-center gap-3">
              <button
                onClick={handleStartFresh}
                className="px-4 py-2 bg-white hover:bg-stone-subtle text-ink font-medium rounded-lg text-xs border border-stone-border flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart 10-Minute Sequence</span>
              </button>

              <Link
                href="/about"
                className="px-5 py-2 bg-calm-indigo hover:bg-indigo-700 text-white font-medium rounded-lg text-xs shadow-xs flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Inspect Examiner Report & AI Spec (D6)</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Floating Viva Examiner Quick-Switcher (Deliverable D5 & Viva support) */}
      <VivaScenarioSwitcher onSelectScenario={handleVivaScenario} />

      {/* Persistent Footer with Identity Token */}
      <Footer />
    </div>
  );
}
