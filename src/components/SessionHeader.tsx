import React from "react";
import { Clock, Pause, Play, Sparkles, BookMarked } from "lucide-react";
import { formatTime } from "@/lib/sessionStore";

interface SessionHeaderProps {
  elapsedSeconds: number;
  totalSeconds?: number;
  currentStageIndex: number; // 0 to 4
  stageTitles: string[];
  isPaused: boolean;
  onTogglePause: () => void;
  difficultyTier: 1 | 2 | 3;
}

export default function SessionHeader({
  elapsedSeconds,
  totalSeconds = 600,
  currentStageIndex,
  stageTitles,
  isPaused,
  onTogglePause,
  difficultyTier,
}: SessionHeaderProps) {
  const remaining = Math.max(0, totalSeconds - elapsedSeconds);
  const percentElapsed = Math.min(100, (elapsedSeconds / totalSeconds) * 100);

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-xs border-b border-stone-border py-3 px-4 sm:px-6 shadow-xs">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Persona Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-calm-indigo text-white flex items-center justify-center font-bold text-sm shadow-xs">
              LS
            </div>
            <div>
              <h1 className="font-bold text-base text-ink leading-tight">LoopStep</h1>
              <p className="text-[11px] text-ink-light">Calm Tutor for Aarav (L5)</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-stone-border">
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                difficultyTier === 1
                  ? "bg-calm-greenBg text-calm-green border border-calm-greenBorder"
                  : difficultyTier === 2
                  ? "bg-calm-amberBg text-calm-amber border border-calm-amberBorder"
                  : "bg-calm-indigoBg text-calm-indigo border border-calm-indigoBorder"
              }`}
            >
              Tier {difficultyTier}: {difficultyTier === 1 ? "Foundations" : difficultyTier === 2 ? "Pattern Trace" : "Step Master"}
            </span>
          </div>
        </div>

        {/* 10-Minute C4 Timer & Pause/Save */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-stone-border shadow-2xs">
            <Clock className="w-4 h-4 text-calm-indigo" />
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-ink">
                {formatTime(remaining)} <span className="text-[10px] text-ink-faint font-normal">left</span>
              </div>
            </div>
          </div>

          <button
            onClick={onTogglePause}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-subtle text-ink font-medium text-xs border border-stone-border transition shadow-2xs cursor-pointer"
            title="Pause and save session to resume later without losing your place"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-calm-green" /> : <Pause className="w-3.5 h-3.5 text-calm-amber" />}
            <span>{isPaused ? "Resume" : "Pause & Save"}</span>
          </button>
        </div>
      </div>

      {/* Micro-Stage Progress Bar (5 Steps in 10 Minutes) */}
      <div className="max-w-4xl mx-auto mt-2.5">
        <div className="flex items-center justify-between text-[11px] text-ink-light mb-1 px-1">
          <span className="font-medium">
            Stage {currentStageIndex + 1} of {stageTitles.length}: {stageTitles[currentStageIndex]}
          </span>
          <span className="text-ink-faint">{Math.round(percentElapsed)}% session used</span>
        </div>
        <div className="w-full bg-[#EBE6DD] h-1.5 rounded-full overflow-hidden flex gap-0.5">
          {stageTitles.map((_, idx) => (
            <div
              key={idx}
              className={`h-full flex-1 transition-all duration-300 ${
                idx < currentStageIndex
                  ? "bg-calm-green"
                  : idx === currentStageIndex
                  ? "bg-calm-indigo"
                  : "bg-transparent"
              }`}
            />
          ))}
        </div>
      </div>
    </header>
  );
}
