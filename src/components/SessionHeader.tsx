import React from "react";
import { Clock, Pause, Play, Sparkles, CheckCircle2 } from "lucide-react";
import { formatTime } from "@/lib/sessionStore";

interface SessionHeaderProps {
  elapsedSeconds: number;
  totalSeconds?: number;
  currentStageIndex: number;
  stageTitles: string[];
  isPaused: boolean;
  onTogglePause: () => void;
}

export default function SessionHeader({
  elapsedSeconds,
  totalSeconds = 600,
  currentStageIndex,
  stageTitles,
  isPaused,
  onTogglePause,
}: SessionHeaderProps) {
  const remaining = Math.max(0, totalSeconds - elapsedSeconds);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-2.5 px-4 sm:px-6 shadow-xs">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m17 2 4 4-4 4" />
              <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
              <path d="m7 22-4-4 4-4" />
              <path d="M21 13v1a4 4 0 0 1-4 4H3" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight text-base">
              LoopStep
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 font-normal">
              Python Loop Studio
            </span>
          </div>
        </div>

        {/* Step Progress Pill Indicator */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-full border border-slate-200">
          {stageTitles.map((title, idx) => (
            <div
              key={idx}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                idx === currentStageIndex
                  ? "bg-white text-indigo-600 shadow-2xs font-semibold"
                  : idx < currentStageIndex
                  ? "text-emerald-700"
                  : "text-slate-500"
              }`}
            >
              <span className="flex items-center gap-1">
                {idx < currentStageIndex && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                <span>{title}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Timer & Pause */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{formatTime(remaining)}</span>
          </div>

          <button
            onClick={onTogglePause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition cursor-pointer border border-indigo-200"
            title="Freeze timer and save progress"
          >
            {isPaused ? (
              <Play className="w-3.5 h-3.5 fill-indigo-700 text-indigo-700" />
            ) : (
              <Pause className="w-3.5 h-3.5 fill-indigo-700 text-indigo-700" />
            )}
            <span className="hidden sm:inline">{isPaused ? "Resume" : "Pause & Save"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
