import React from "react";
import { Play, Clock } from "lucide-react";
import { formatTime } from "@/lib/sessionStore";

interface PauseOverlayProps {
  remainingSeconds: number;
  stageName: string;
  onResume: () => void;
}

export default function PauseOverlay({ remainingSeconds, stageName, onResume }: PauseOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 text-center shadow-xl animate-fade-in">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full mx-auto flex items-center justify-center border border-indigo-100 shadow-xs mb-4">
          <Clock className="w-6 h-6" />
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-1">Session Paused</h2>
        <p className="text-xs text-slate-500 mb-5">
          Your progress is safely saved. Take a break and resume when you&apos;re ready.
        </p>

        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 text-left mb-5 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>Time Left:</span>
            <span className="font-mono font-bold text-indigo-600">{formatTime(remainingSeconds)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Current Topic:</span>
            <span className="font-medium text-slate-800">{stageName}</span>
          </div>
        </div>

        <button
          onClick={onResume}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Resume Session</span>
        </button>
      </div>
    </div>
  );
}
