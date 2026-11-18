"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  Play,
  Lightbulb,
  BookOpen,
  ChevronRight,
  ListOrdered,
  Bug,
  Cpu,
} from "lucide-react";
import SessionHeader from "@/components/SessionHeader";
import PauseOverlay from "@/components/PauseOverlay";
import TraceTableTool from "@/components/TraceTableTool";
import ParsonsBlockEditor from "@/components/ParsonsBlockEditor";
import BugFixExplainer from "@/components/BugFixExplainer";
import DecisionOutcomeModal from "@/components/DecisionOutcomeModal";
import Footer from "@/components/Footer";
import {
  TASK_BANK,
  WARMUP_QUESTIONS,
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
  "Welcome",
  "Warmup",
  "Core Concepts",
  "Practice Arena",
  "Summary",
];

export default function HomePage() {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [difficultyTier, setDifficultyTier] = useState<1 | 2 | 3>(1);

  // Active Task & Pedagogy State
  const [activeTaskId, setActiveTaskId] = useState<string>("task_prereq_assignment");
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

  // Warmup state (Question locking)
  const [warmupIndex, setWarmupIndex] = useState<number>(0);
  const [warmupSelected, setWarmupSelected] = useState<string>("");
  const [warmupIsLocked, setWarmupIsLocked] = useState<boolean>(false);
  const [warmupFeedback, setWarmupFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Saved Session Detection
  const [savedSnapshot, setSavedSnapshot] = useState<SessionSnapshot | null>(null);

  useEffect(() => {
    const saved = loadSavedSession();
    if (saved && saved.elapsedSeconds < 600) {
      setSavedSnapshot(saved);
    }
  }, []);

  // 10-Minute countdown tick: FREEZES when stageIndex === 0, stageIndex >= 4, paused, or >= 600s
  useEffect(() => {
    if (stageIndex === 0 || stageIndex >= 4 || isPaused || elapsedSeconds >= 600) {
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        if (prev >= 600) {
          setStageIndex(4);
          return 600;
        }
        const nextVal = prev + 1;
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
        return nextVal;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, stageIndex, activeTaskId, elapsedSeconds]);

  const activeTask = getTaskById(activeTaskId);
  const currentWarmup = WARMUP_QUESTIONS[warmupIndex];

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
    setActiveTaskId(savedSnapshot.activeTaskId || "task_prereq_assignment");
    setIsPaused(false);
    setSavedSnapshot(null);
  };

  const handleStartFresh = () => {
    clearSavedSession();
    setSavedSnapshot(null);
    setElapsedSeconds(0);
    setStageIndex(1);
    setIsPaused(false);
    setWarmupIndex(0);
    setWarmupSelected("");
    setWarmupIsLocked(false);
    setWarmupFeedback(null);
  };

  // Warmup Option Selection & Locking
  const handleSelectWarmupOption = (optionId: string) => {
    if (warmupIsLocked) return; // Prevent changing when already submitted
    setWarmupSelected(optionId);
  };

  const handleCheckWarmup = () => {
    if (!warmupSelected || warmupIsLocked) return;
    const opt = currentWarmup.options.find((o) => o.id === warmupSelected);
    if (!opt) return;

    setWarmupIsLocked(true); // LOCK inputs immediately upon check
    setWarmupFeedback({
      isCorrect: !!opt.isCorrect,
      text: opt.feedback,
    });
  };

  const handleTryAgainWarmup = () => {
    // Unlock and clear selection so student can make a deliberate new attempt
    setWarmupSelected("");
    setWarmupIsLocked(false);
    setWarmupFeedback(null);
  };

  const handleNextWarmup = () => {
    if (warmupIndex + 1 < WARMUP_QUESTIONS.length) {
      setWarmupIndex((prev) => prev + 1);
      setWarmupSelected("");
      setWarmupIsLocked(false);
      setWarmupFeedback(null);
    } else {
      setStageIndex(2);
    }
  };

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
        feedbackHeader: data.suggestedAction || "Guidance",
        feedbackBody: data.supportiveFeedback,
        metaphor,
        engineUsed: data.engineUsed || "LoopStep Tutor",
        nextTaskId:
          data.decisionOutcome === "HARDER_QUESTION"
            ? activeTask.nextHarderTaskId || activeTaskId
            : data.decisionOutcome === "PREREQUISITE_INSTRUCTION"
            ? "task_prereq_assignment"
            : activeTask.nextAltTaskId || activeTaskId,
      });
    } catch (err) {
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
        engineUsed: "LoopStep Engine",
        nextTaskId: fallbackDecision.nextTaskId,
      });
    } finally {
      setIsApiLoading(false);
    }
  };

  const handleTraceSubmit = (rows: LearnerTraceRow[], divergence: DivergenceResult) => {
    const isCorrect = !divergence.hasDiverged;
    const misconception = divergence.diagnosedMisconception || (isCorrect ? "NONE" : "OTHER");
    processSubmission(rows, isCorrect, misconception);
  };

  const handleParsonsCheck = (isCorrect: boolean, feedback: string, diagnosedM2: boolean) => {
    const misconception = diagnosedM2 ? "M2" : isCorrect ? "NONE" : "OTHER";
    processSubmission("Parsons blocks assembled", isCorrect, misconception);
  };

  const handleBugFixSubmit = (fixChoice: string, explanation: string) => {
    const isCorrect = fixChoice === "opt_both";
    let misconception: "M1" | "M2" | "PREREQ" | "NONE" = "NONE";
    if (fixChoice === "opt_m1_only") misconception = "M2";
    if (fixChoice === "opt_m2_only") misconception = "M1";
    if (fixChoice === "opt_reset_inside") misconception = "M2";

    processSubmission(fixChoice, isCorrect, misconception, explanation);
  };

  const handlePrereqSubmit = (answer: string) => {
    const isCorrect = answer.trim() === "9";
    processSubmission({ answer }, isCorrect, isCorrect ? "NONE" : "PREREQ");
  };

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Session Header */}
      <SessionHeader
        elapsedSeconds={elapsedSeconds}
        totalSeconds={600}
        currentStageIndex={stageIndex}
        stageTitles={STAGE_TITLES}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
      />

      {/* Pause Overlay */}
      {isPaused && (
        <PauseOverlay
          remainingSeconds={Math.max(0, 600 - elapsedSeconds)}
          stageName={STAGE_TITLES[stageIndex]}
          onResume={() => setIsPaused(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {/* ========================================================= */}
        {/* STAGE 0: WELCOME & START SESSION                          */}
        {/* ========================================================= */}
        {stageIndex === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Python Crash Course Guide
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Master Python Loops Without the Stress
              </h1>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Build a crystal-clear mental model of Python execution, variable updates, and loop control structures through bite-sized, interactive visual exercises.
              </p>
            </div>

            {/* Saved Session Alert */}
            {savedSnapshot && (
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-xs">Resume Previous Session</h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      You have {formatTime(600 - savedSnapshot.elapsedSeconds)} remaining from your last session.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResumeSavedSession}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Resume Progress</span>
                </button>
              </div>
            )}

            {/* 3 Core Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <div className="font-semibold text-slate-800 text-xs">Variables & Memory First</div>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Start with sequential updates before loops, following Eric Matthes&apos;s guide.
                </p>
              </div>
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <div className="font-semibold text-slate-800 text-xs">Interactive Stepper</div>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Scrub line-by-line through Python frames without doing mental math.
                </p>
              </div>
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <div className="font-semibold text-slate-800 text-xs">10-Minute Focus</div>
                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                  Complete sequence designed for 10 minutes with instant pause and resume.
                </p>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={handleStartFresh}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Start Learning Session</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 1: WARMUP DIAGNOSTIC (WITH OPTION LOCKING)          */}
        {/* ========================================================= */}
        {stageIndex === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-sm space-y-5 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                  Check-in {warmupIndex + 1} of {WARMUP_QUESTIONS.length}
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  {currentWarmup.topic}
                </h2>
              </div>
              <span className="text-slate-400 text-xs">~1 minute</span>
            </div>

            <p className="text-slate-700 text-xs leading-relaxed font-medium">
              {currentWarmup.question}
            </p>

            <div className="p-3 bg-[#181825] rounded-xl font-mono text-xs text-slate-300 border border-slate-800">
              <pre>{currentWarmup.codeSnippet}</pre>
            </div>

            {/* Options List with Disabled State on Lock */}
            <div className="space-y-2">
              {currentWarmup.options.map((opt) => {
                const isSelected = warmupSelected === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => handleSelectWarmupOption(opt.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                      warmupIsLocked
                        ? isSelected
                          ? opt.isCorrect
                            ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300 cursor-default"
                            : "bg-amber-50/70 border-amber-300 ring-1 ring-amber-300 cursor-default"
                          : "bg-slate-50/40 border-slate-200 opacity-60 cursor-not-allowed"
                        : isSelected
                        ? "bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-300 cursor-pointer"
                        : "bg-slate-50/70 border-slate-200 hover:border-slate-300 cursor-pointer"
                    }`}
                  >
                    <input
                      type="radio"
                      name="warmup"
                      value={opt.id}
                      checked={isSelected}
                      disabled={warmupIsLocked}
                      onChange={() => handleSelectWarmupOption(opt.id)}
                      className="text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                    />
                    <span className="font-mono text-slate-800 text-xs">{opt.text}</span>
                  </label>
                );
              })}
            </div>

            {/* Submit / Check or Try Again Controls */}
            {!warmupIsLocked ? (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleCheckWarmup}
                  disabled={!warmupSelected}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Check Answer</span>
                </button>
              </div>
            ) : null}

            {/* Locked Feedback Alert */}
            {warmupFeedback && (
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs animate-fade-in ${
                  warmupFeedback.isCorrect
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-amber-50 border-amber-200 text-amber-950"
                }`}
              >
                {warmupFeedback.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">
                    {warmupFeedback.isCorrect ? "Spot on!" : "Let's review this concept"}
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed">{warmupFeedback.text}</p>
                </div>
              </div>
            )}

            {/* Action buttons after submission */}
            {warmupIsLocked && (
              <div className="pt-2 flex justify-end gap-2.5">
                {!warmupFeedback?.isCorrect && (
                  <button
                    type="button"
                    onClick={handleTryAgainWarmup}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNextWarmup}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>
                    {warmupIndex + 1 < WARMUP_QUESTIONS.length
                      ? "Next Question"
                      : "Continue to Core Concepts"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 2: CORE CONCEPTS & LIVE TRACER                      */}
        {/* ========================================================= */}
        {stageIndex === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-sm space-y-6 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                  Visual Guide
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  Two Fundamental Rules of Python Loops
                </h2>
              </div>
              <span className="text-slate-400 text-xs">~2 minutes</span>
            </div>

            {/* Concept Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 font-bold flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs">The Exclusive Stop Boundary</h3>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    When Python executes <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">range(1, 4)</code>, it starts at 1 and stops <strong>right before 4</strong>. The values visited are only 1, 2, and 3.
                  </p>
                </div>
                <div className="mt-2 p-2 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-indigo-600 font-semibold text-center">
                  range(1, 4) &rarr; [1, 2, 3] (3 passes)
                </div>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs">Accumulating vs. Overwriting</h3>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Writing <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">total = total + i</code> adds each new value to the running total. In contrast, <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">total = i</code> replaces the previous sum on every single pass.
                  </p>
                </div>
                <div className="mt-2 p-2 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-emerald-600 font-semibold text-center">
                  total = total + i preserves past sums
                </div>
              </div>
            </div>

            {/* Embedded Live Tracer Tool with Stable Stepper */}
            <div>
              <div className="mb-2">
                <span className="font-semibold text-slate-800 text-xs">
                  Inspect the execution frame-by-frame with the stepper:
                </span>
              </div>
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
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setStageIndex(3)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Start Practice Arena</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 3: ADAPTIVE PRACTICE ARENA                          */}
        {/* ========================================================= */}
        {stageIndex === 3 && (
          <div className="space-y-4 animate-fade-in text-xs">
            {/* Quick Task Switcher Bar */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold text-[11px] text-slate-700">Python Curriculum:</span>
              </div>
              <div className="flex items-center gap-1.5">
                {TASK_BANK.map((t, idx) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActiveTaskId(t.id);
                      setDifficultyTier(t.tier);
                      setAttempts(0);
                      setHintsUsed(0);
                      setShowHint(false);
                      setActiveDecision(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer shrink-0 ${
                      activeTaskId === t.id
                        ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    Ex {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Task Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                    {activeTask.chapterSource}
                  </span>
                  <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    Level {activeTask.tier}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowHint(!showHint);
                      if (!showHint) setHintsUsed((h) => h + 1);
                    }}
                    className="flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>{showHint ? "Hide Hint" : "Hint"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => processSubmission("Clicked foundation review", false, "PREREQ")}
                    className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Review Foundation</span>
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">{activeTask.title}</h2>
                <p className="text-slate-600 text-xs mt-1 leading-relaxed">{activeTask.prompt}</p>
              </div>

              {showHint && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 animate-fade-in text-amber-900">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">{activeTask.hint}</p>
                </div>
              )}
            </div>

            {/* Task Workspaces by Format */}
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
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
                <div className="p-3.5 bg-[#181825] rounded-xl font-mono text-xs text-slate-300 border border-slate-800">
                  <pre>{activeTask.codeSnippet}</pre>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="font-semibold text-slate-800">Final value of score:</label>
                  <input
                    type="text"
                    id="prereqInput"
                    placeholder="e.g. 9"
                    className="w-24 px-3 py-1.5 font-mono text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById("prereqInput") as HTMLInputElement;
                      if (input) handlePrereqSubmit(input.value);
                    }}
                    className="px-4 py-1.5 bg-indigo-600 text-white font-medium rounded-lg text-xs hover:bg-indigo-700 cursor-pointer shadow-xs transition"
                  >
                    Check
                  </button>
                </div>
              </div>
            )}

            {/* Decision Outcome Modal */}
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
                    ? "Go to Foundation Review →"
                    : "Try Parallel Practice →"
                }
              />
            )}

            <div className="pt-2 flex justify-between items-center text-slate-400">
              <span className="text-[11px]">
                Attempts: {attempts} · Hints used: {hintsUsed}
              </span>
              <button
                type="button"
                onClick={() => setStageIndex(4)}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Finish Session &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAGE 4: SESSION SUMMARY (TIMER STOPS COMPLETELY)         */}
        {/* ========================================================= */}
        {stageIndex === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm space-y-6 animate-fade-in text-xs">
            <div className="text-center space-y-2 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center border border-emerald-100 shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Practice Session Complete!
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Great job working through variable memory, loop bounds, trace tables, and accumulators today.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 text-center">
                <div className="text-[11px] text-slate-500 font-medium">Session Duration (Halted)</div>
                <div className="text-xl font-bold font-mono text-indigo-600 mt-1">
                  {formatTime(elapsedSeconds)}
                </div>
              </div>
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 text-center">
                <div className="text-[11px] text-slate-500 font-medium">Mastery Level Reached</div>
                <div className="text-xl font-bold text-emerald-600 mt-1">
                  Level {difficultyTier} Achieved
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
              <h3 className="font-semibold text-slate-800">Key Takeaways from Python Crash Course:</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs">
                <li>
                  <strong>Variables as Storage Boxes (Ch 2):</strong> Variables update sequentially; reassignment replaces the stored value.
                </li>
                <li>
                  <strong>List Looping (Ch 4):</strong> <code className="bg-white px-1 rounded border text-slate-800">for item in items:</code> passes each item into the variable sequentially.
                </li>
                <li>
                  <strong>Exclusive Bound (Ch 4):</strong> <code className="bg-white px-1 rounded border text-slate-800">range(start, stop)</code> stops right before <code className="text-indigo-600 font-mono">stop</code>.
                </li>
                <li>
                  <strong>Accumulator Pattern (Ch 4):</strong> <code className="bg-white px-1 rounded border text-slate-800">total = total + i</code> adds each new value without wiping the running total.
                </li>
                <li>
                  <strong>While Loops (Ch 7):</strong> Repeat as long as the condition remains True, updating counters manually.
                </li>
              </ul>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={handleStartFresh}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Practice Again</span>
              </button>

              <Link
                href="/about"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View Architecture & Spec &rarr;
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Clean Persistent Footer with ONLY Roll No */}
      <Footer />
    </div>
  );
}
