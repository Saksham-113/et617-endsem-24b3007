import React from "react";
import { Play, ShieldCheck, Clock, BookmarkCheck } from "lucide-react";
import { formatTime } from "@/lib/sessionStore";

interface PauseOverlayProps {
  remainingSeconds: number;
  stageName: string;
  onResume: () => void;
}

export default function PauseOverlay({ remainingSeconds, stageName, onResume }: PauseOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-[#1C1917]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] border border-stone-border rounded-2xl max-w-md w-full p-6 text-center shadow-2xl animate-fade-in">
        <div className="w-14 h-14 bg-white rounded-full mx-auto flex items-center justify-center border border-stone-border shadow-xs mb-4">
          <Clock className="w-7 h-7 text-calm-amber" />
        </div>

        <h2 className="text-xl font-bold text-ink mb-1">Session Paused & Safely Saved</h2>
        <p className="text-sm text-ink-light mb-4">
          Take a deep breath, Aarav. Your timer is completely frozen and your work is safely saved.
        </p>

        <div className="bg-white rounded-xl p-4 border border-stone-border text-left mb-6 space-y-2 text-xs text-ink-light">
          <div className="flex justify-between items-center pb-2 border-b border-stone-border/60">
            <span className="font-medium text-ink">Time Remaining:</span>
            <span className="font-mono font-bold text-calm-indigo text-sm">{formatTime(remainingSeconds)}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-stone-border/60">
            <span className="font-medium text-ink">Current Milestone:</span>
            <span className="font-medium text-ink">{stageName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-calm-green pt-1 font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Stored in browser memory. Even if you close this tab, you can resume right here!</span>
          </div>
        </div>

        <button
          onClick={onResume}
          className="w-full py-3 px-4 bg-calm-indigo hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Resume Where I Left Off</span>
        </button>

        <p className="text-[11px] text-ink-faint mt-3">Identity Token: 24b3007 · Constraint C4</p>
      </div>
    </div>
  );
}
