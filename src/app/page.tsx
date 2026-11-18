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
  Play,
  Lightbulb,
  BookOpen,
  ChevronRight,
  ListOrdered,
  Bug,
  Cpu,
  Layers,
  ArrowLeft,
} from "lucide-react";
import SessionHeader from "@/components/SessionHeader";
import PauseOverlay from "@/components/PauseOverlay";
import TraceTableTool from "@/components/TraceTableTool";
import ParsonsBlockEditor from "@/components/ParsonsBlockEditor";
import BugFixExplainer from "@/components/BugFixExplainer";
import Footer from "@/components/Footer";
import {
  MODULES,
  TASK_BANK,
  getTaskById,
  getModuleById,
  TaskDefinition,
  ModuleDefinition,
} from "@/lib/curriculum";
import {
  saveSession,
  formatTime,
} from "@/lib/sessionStore";
import { LearnerTraceRow, DivergenceResult } from "@/lib/loopTracer";

export default function HomePage() {
  // Fresh Startup: activeModuleId defaults to null (Clean Module Selector, no auto-load)
  const [activeModuleId, setActiveModuleId] = useState<"module_1" | "module_2" | "module_3" | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Active Task State
  const [activeTaskId, setActiveTaskId] = useState<string>("mod1_ex1_trace");
  const [attempts, setAttempts] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [divergenceInfo, setDivergenceInfo] = useState<DivergenceResult | null>(null);
  const [taskResetKey, setTaskResetKey] = useState<number>(0);

  // Dynamic AI Reply & Branching State
  const [aiResponse, setAiResponse] = useState<{
    isCorrect: boolean;
    diagnosedMisconception: "M1" | "M2" | "PREREQ" | "NONE" | "OTHER";
    explanationScore: number;
    aiReply: string;
    nextAction: "ADVANCE" | "PARALLEL_PRACTICE";
    nextTask: TaskDefinition;
    fallbackUsed: boolean;
  } | null>(null);

  // 10-Minute countdown tick: runs ONLY when an active module is selected, not paused, not finished, and < 600s
  useEffect(() => {
    if (!activeModuleId || isPaused || isFinished || elapsedSeconds >= 600) {
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        if (prev >= 600) {
          setIsFinished(true);
          return 600;
        }
        const nextVal = prev + 1;
        // Periodic snapshot for in-session C4 stop/resume
        if (nextVal % 5 === 0) {
          saveSession({
            sessionId: "session_24b3007",
            totalTimeSeconds: 600,
            elapsedSeconds: nextVal,
            stageIndex: 3,
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
  }, [activeModuleId, isPaused, isFinished, activeTaskId, elapsedSeconds]);

  // Handle module selection from the clean home screen
  const handleSelectModule = (moduleId: "module_1" | "module_2" | "module_3") => {
    const mod = getModuleById(moduleId);
    setActiveModuleId(moduleId);
    setActiveTaskId(mod.exerciseIds[0]);
    setElapsedSeconds(0); // Fresh 10:00 timer
    setIsPaused(false);
    setIsFinished(false);
    setAttempts(0);
    setHintsUsed(0);
    setShowHint(false);
    setAiResponse(null);
    setDivergenceInfo(null);
    setTaskResetKey((k) => k + 1);
  };

  const handleReturnToModuleSelector = () => {
    setActiveModuleId(null);
    setIsPaused(false);
    setAiResponse(null);
  };

  // C4 In-Session Pause & Save
  const handleTogglePause = () => {
    const nextPause = !isPaused;
    setIsPaused(nextPause);
    if (activeModuleId) {
      saveSession({
        sessionId: "session_24b3007",
        totalTimeSeconds: 600,
        elapsedSeconds,
        stageIndex: 3,
        activeTaskId,
        isPaused: nextPause,
        history: [],
        savedAt: Date.now(),
      });
    }
  };

  const handleResumeWhereLeftOff = () => {
    setIsPaused(false);
  };

  const activeModule = activeModuleId ? getModuleById(activeModuleId) : null;
  const activeTask = getTaskById(activeTaskId);

  // Submit learner's answer and explanation to POST /api/tutor
  const processSubmission = async (
    learnerAnswer: any,
    preliminaryIsCorrect: boolean,
    preliminaryMisconception: "M1" | "M2" | "PREREQ" | "NONE" | "OTHER",
    learnerExplanation: string
  ) => {
    setIsApiLoading(true);
    setAttempts((prev) => prev + 1);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: activeTaskId,
          learnerAnswer,
          learnerExplanation,
          attemptCount: attempts + 1,
          hintsRequested: hintsUsed,
          preliminaryIsCorrect,
          preliminaryMisconception,
        }),
      });

      const data = await response.json();

      setAiResponse({
        isCorrect: data.isCorrect,
        diagnosedMisconception: data.diagnosedMisconception || "NONE",
        explanationScore: data.explanationScore ?? (data.isCorrect ? 0.85 : 0.5),
        aiReply: data.aiReply || (data.isCorrect ? activeTask.feedbackCorrect : activeTask.feedbackM1),
        nextAction: data.nextAction || (data.isCorrect ? "ADVANCE" : "PARALLEL_PRACTICE"),
        nextTask: data.nextTask || (data.isCorrect ? getTaskById(activeTask.nextHarderTaskId || activeTaskId) : getTaskById(activeTask.nextAltTaskId || activeTaskId)),
        fallbackUsed: !!data.fallbackUsed,
      });
    } catch (err) {
      // Offline fallback
      const isAdvance = preliminaryIsCorrect;
      const targetTaskId = isAdvance
        ? activeTask.nextHarderTaskId || activeTaskId
        : activeTask.nextAltTaskId || activeTaskId;
      const nextTask = getTaskById(targetTaskId);

      setAiResponse({
        isCorrect: preliminaryIsCorrect,
        diagnosedMisconception: preliminaryMisconception,
        explanationScore: preliminaryIsCorrect ? 0.85 : 0.5,
        aiReply: preliminaryIsCorrect
          ? activeTask.feedbackCorrect
          : preliminaryMisconception === "M1"
          ? activeTask.feedbackM1
          : activeTask.feedbackM2,
        nextAction: isAdvance ? "ADVANCE" : "PARALLEL_PRACTICE",
        nextTask,
        fallbackUsed: true,
      });
    } finally {
      setIsApiLoading(false);
    }
  };

  // Submission adapters from exercises
  const handleTraceSubmit = (
    rows: LearnerTraceRow[],
    divergence: DivergenceResult,
    explanation: string
  ) => {
    setDivergenceInfo(divergence);
    const isCorrect = !divergence.hasDiverged;
    const misconception = divergence.diagnosedMisconception || (isCorrect ? "NONE" : "OTHER");
    processSubmission(rows, isCorrect, misconception, explanation);
  };

  const handleParsonsCheck = (
    isCorrect: boolean,
    feedback: string,
    diagnosedM2: boolean,
    explanation: string
  ) => {
    setDivergenceInfo(null);
    const misconception = diagnosedM2 ? "M2" : isCorrect ? "NONE" : "OTHER";
    processSubmission("Parsons blocks verified", isCorrect, misconception, explanation);
  };

  const handleBugFixSubmit = (fixChoice: string, explanation: string) => {
    setDivergenceInfo(null);
    const selectedOpt = activeTask.bugFixOptions?.find((o) => o.id === fixChoice);
    const isCorrect = !!selectedOpt?.isCorrect;
    const misconception = isCorrect ? "NONE" : "M1";
    processSubmission(fixChoice, isCorrect, misconception, explanation);
  };

  // Dynamic Branching Action 1: Advance to Harder Challenge
  const handleAdvanceToHarder = (nextTask: TaskDefinition) => {
    setActiveTaskId(nextTask.id);
    setAiResponse(null);
    setDivergenceInfo(null);
    setAttempts(0);
    setHintsUsed(0);
    setShowHint(false);
    setTaskResetKey((k) => k + 1);
  };

  // Dynamic Branching Action 2: Try Parallel Practice
  const handleTryParallelPractice = (nextTask: TaskDefinition) => {
    setActiveTaskId(nextTask.id);
    setAiResponse(null);
    setDivergenceInfo(null);
    setAttempts(0);
    setHintsUsed(0);
    setShowHint(false);
    setTaskResetKey((k) => k + 1);
  };

  // Dynamic Branching Action 3: Next Exercise in Module (never trapped)
  const handleNextSequentialExercise = () => {
    if (!activeModule) return;
    const currentIdx = activeModule.exerciseIds.indexOf(activeTaskId);
    let nextId = activeModule.exerciseIds[0];
    if (currentIdx !== -1 && currentIdx + 1 < activeModule.exerciseIds.length) {
      nextId = activeModule.exerciseIds[currentIdx + 1];
    } else if (activeTask.nextSequentialTaskId) {
      nextId = activeTask.nextSequentialTaskId;
    }
    setActiveTaskId(nextId);
    setAiResponse(null);
    setDivergenceInfo(null);
    setAttempts(0);
    setHintsUsed(0);
    setShowHint(false);
    setTaskResetKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Session Header */}
      <SessionHeader
        elapsedSeconds={elapsedSeconds}
        totalSeconds={600}
        currentStageIndex={activeModuleId ? 2 : 0}
        stageTitles={["Selector", "Walkthrough", "Practice Arena"]}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
      />

      {/* C4 In-Session Pause Modal */}
      {isPaused && (
        <PauseOverlay
          remainingSeconds={Math.max(0, 600 - elapsedSeconds)}
          stageName={activeModule ? activeModule.title : "Module Selector"}
          onResume={handleResumeWhereLeftOff}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {/* =================================================================== */}
        {/* VIEW A: MODULE SELECTOR (CLEAN HOME SCREEN — NO AUTO-LOAD BANNER)    */}
        {/* =================================================================== */}
        {!activeModuleId && !isFinished && (
          <div className="space-y-6 animate-fade-in">
            {/* Header Banner */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Python Crash Course · Remedial Loop Studio
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Master Python Loops in 10-Minute Micro-Sessions
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-2xl">
                Designed specifically for Class 8–11 learners repeating Python loops. Choose one of our 3 self-contained 10-minute modules (Chapters 2–6) to build rock-solid loop models with interactive frame-by-frame tracers and instant AI coaching.
              </p>
            </div>

            {/* 3 Book-Chapter Module Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MODULES.map((mod, idx) => (
                <div
                  key={mod.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                        {mod.badge}
                      </span>
                      <span className="text-slate-400 text-xs flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        10:00
                      </span>
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-slate-900">{mod.title}</h2>
                      <p className="text-[11px] font-medium text-indigo-600 mt-0.5">{mod.subtitle}</p>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{mod.description}</p>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                      <div className="font-semibold text-slate-700">What&apos;s inside:</div>
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li>150-word micro-lesson</li>
                        <li>Interactive step walkthrough</li>
                        <li>4 adaptive practice challenges</li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleSelectModule(mod.id)}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Start 10-Min Session</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Pedagogy Callout */}
            <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>AI Coaching Powered by Gemini 3.8 Flash:</strong> Live semantic diagnosis of your explanations with automatic fallback guarantees.
                </span>
              </div>
              <Link
                href="/about"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold shrink-0"
              >
                Architecture & Spec &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW B: ACTIVE MODULE & EXERCISES                                   */}
        {/* =================================================================== */}
        {activeModuleId && activeModule && !isFinished && (
          <div className="space-y-5 animate-fade-in text-xs">
            {/* Top Navigation & Module Header */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleReturnToModuleSelector}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                  title="Return to Module Selector"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 font-mono tracking-wider">
                    {activeModule.chapterCoverage}
                  </span>
                  <h1 className="text-base font-bold text-slate-900 mt-0.5">{activeModule.title}</h1>
                </div>
              </div>

              {/* In-Session 10:00 Timer Display */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-indigo-600">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{formatTime(Math.max(0, 600 - elapsedSeconds))}</span>
                </div>
              </div>
            </div>

            {/* PART 1: 150-WORD MICRO-LESSON */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h2 className="font-bold text-slate-900 text-xs">{activeModule.microLessonTitle}</h2>
                <span className="text-[10px] text-slate-400 font-medium ml-auto">Micro-Lesson (~150 words)</span>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed font-normal">
                {activeModule.microLessonContent}
              </p>
            </div>

            {/* PART 2: INTERACTIVE STEPPER WALKTHROUGH */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                  <h2 className="font-bold text-slate-900 text-xs">Interactive Step Walkthrough</h2>
                </div>
                <span className="text-[11px] text-slate-500">Scrub step-by-step before practicing</span>
              </div>

              <TraceTableTool
                loopConfig={activeModule.walkthroughConfig}
                expectedPassCount={activeModule.walkthroughExpectedPasses}
                readOnly={true}
              />
            </div>

            {/* PART 3: 4 ADAPTIVE EXERCISES */}
            <div className="space-y-4 pt-2">
              {/* Exercise Selector Bar */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-1.5 shrink-0">
                  <ListOrdered className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-bold text-[11px] text-slate-800">4 Module Exercises:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {activeModule.exerciseIds.map((exId, idx) => {
                    const taskDef = getTaskById(exId);
                    const isActive = activeTaskId === exId;
                    return (
                      <button
                        key={exId}
                        type="button"
                        onClick={() => {
                          setActiveTaskId(exId);
                          setAiResponse(null);
                          setDivergenceInfo(null);
                          setAttempts(0);
                          setHintsUsed(0);
                          setShowHint(false);
                          setTaskResetKey((k) => k + 1);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-2xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        Ex {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Exercise Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                      {activeTask.chapterSource}
                    </span>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      Tier {activeTask.tier}
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

              {/* Task Workspaces by Format with key to reset inputs */}
              <div key={taskResetKey}>
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
              </div>

              {/* Loading Indicator */}
              {isApiLoading && (
                <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-center gap-3 text-indigo-900 animate-pulse">
                  <Sparkles className="w-5 h-5 text-indigo-600 animate-spin" />
                  <span className="font-semibold text-xs">
                    LoopStep AI (Gemini 3.8 Flash) is evaluating your answer and explanation...
                  </span>
                </div>
              )}

              {/* ============================================================= */}
              {/* AI REPLY & DYNAMIC BRANCHING CARDS                            */}
              {/* ============================================================= */}
              {aiResponse && !isApiLoading && (
                <>
                  {/* Case 1: isCorrect && explanationScore >= 0.75 -> SAGE-GREEN CARD */}
                  {aiResponse.isCorrect && aiResponse.explanationScore >= 0.75 ? (
                    <div className="bg-[#eef7ee] border-2 border-[#82c685] rounded-2xl p-5 shadow-sm space-y-3 animate-fade-in text-slate-900">
                      <div className="flex items-center justify-between pb-2 border-b border-[#c2e4c4]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-emerald-950">
                              Brilliant Thinking! Explanation Verified
                            </h3>
                            <span className="text-[10px] text-emerald-800 font-semibold">
                              {aiResponse.fallbackUsed ? "Deterministic Evaluation" : "Live Gemini 3.8 Flash Evaluation"}
                            </span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono font-bold text-[11px]">
                          Explanation: {(aiResponse.explanationScore * 100).toFixed(0)}%
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed text-emerald-950 font-medium">
                        {aiResponse.aiReply}
                      </p>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleAdvanceToHarder(aiResponse.nextTask)}
                          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Advance to Harder Challenge →</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Case 2: Wrong or Misconception Detected -> AMBER CARD */
                    <div className="bg-[#fff9eb] border-2 border-[#eec56c] rounded-2xl p-5 shadow-sm space-y-3 animate-fade-in text-slate-900">
                      <div className="flex items-center justify-between pb-2 border-b border-[#f3dfa7]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                            <Lightbulb className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-amber-950">
                              Let&apos;s Look at the Logic Together
                            </h3>
                            <span className="text-[10px] text-amber-800 font-semibold">
                              {aiResponse.fallbackUsed ? "Diagnostic Engine" : "Live Gemini 3.8 Flash Diagnosis"}
                            </span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold text-[11px]">
                          {aiResponse.diagnosedMisconception === "M1"
                            ? "M1: Stop Bound Fallacy"
                            : aiResponse.diagnosedMisconception === "M2"
                            ? "M2: Overwrite Confusion"
                            : "Trace Divergence"}
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed text-amber-950 font-medium">
                        {aiResponse.aiReply}
                      </p>

                      {/* Divergence trace alert if present */}
                      {divergenceInfo && divergenceInfo.hasDiverged && (
                        <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-xl font-mono text-xs text-amber-950 space-y-1">
                          <div className="font-bold">Divergence Detected on Pass {divergenceInfo.divergencePass}:</div>
                          <div>{divergenceInfo.explanationMessage}</div>
                        </div>
                      )}

                      {/* Stop Sign Metaphor for M1 */}
                      {aiResponse.diagnosedMisconception === "M1" && (
                        <div className="p-3 bg-amber-100/60 rounded-xl border border-amber-300 flex items-start gap-2.5 text-xs text-amber-950">
                          <div className="w-6 h-6 rounded-full bg-red-500 text-white font-bold flex items-center justify-center shrink-0 text-[9px]">
                            STOP
                          </div>
                          <div>
                            <span className="font-bold">The Stop Sign Metaphor:</span> range(start, stop) stops right BEFORE reaching stop! It never visits the stop number itself.
                          </div>
                        </div>
                      )}

                      {/* Piggy Bank Metaphor for M2 */}
                      {aiResponse.diagnosedMisconception === "M2" && (
                        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 flex items-start gap-2.5 text-xs text-indigo-950">
                          <span className="text-base">🐖</span>
                          <div>
                            <span className="font-bold">The Piggy Bank Metaphor:</span> total = total + i drops coins into the piggy bank without erasing past sums. total = i wipes the board clean!
                          </div>
                        </div>
                      )}

                      {/* Working Branching Buttons: Parallel Practice OR Next Exercise */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
                        <button
                          type="button"
                          onClick={handleNextSequentialExercise}
                          className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          <span>Next Exercise →</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTryParallelPractice(aiResponse.nextTask)}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer ml-auto"
                        >
                          <span>Try Parallel Practice →</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Bottom Footer Controls */}
              <div className="pt-2 flex justify-between items-center text-slate-400">
                <span className="text-[11px]">
                  Attempts: {attempts} · Hints: {hintsUsed}
                </span>
                <button
                  type="button"
                  onClick={() => setIsFinished(true)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Finish 10-Minute Session &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW C: SESSION SUMMARY (TIMER HALTED)                              */}
        {/* =================================================================== */}
        {isFinished && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm space-y-6 animate-fade-in text-xs">
            <div className="text-center space-y-2 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center border border-emerald-100 shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                10-Minute Learning Session Complete!
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Excellent focus today. You reinforced sequential memory, exclusive bounds, accumulator patterns, and conditional loops without anxiety.
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
                <div className="text-[11px] text-slate-500 font-medium">Completed Module</div>
                <div className="text-sm font-bold text-emerald-600 mt-1">
                  {activeModule ? activeModule.title : "10-Minute Session"}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={handleReturnToModuleSelector}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Choose Another Module</span>
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

      {/* Footer with Roll No 24b3007 */}
      <Footer />
    </div>
  );
}
