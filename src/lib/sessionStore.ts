/**
 * ET 617 Constraint C4: 10-Minute Session State & Persistence
 * Persists session snapshot in localStorage so anxious learners can stop/pause
 * and resume without losing a single input or having their timer expire.
 */

export interface SessionSnapshot {
  sessionId: string;
  totalTimeSeconds: number; // default 600 (10 minutes)
  elapsedSeconds: number;
  stageIndex: number; // 0 to 4 (5 micro-stages)
  activeTaskId: string;
  isPaused: boolean;
  history: {
    taskId: string;
    attempts: number;
    hintsUsed: number;
    decisionOutcome: string;
    timestamp: number;
  }[];
  draftInputs?: Record<string, any>;
  savedAt: number;
}

const STORAGE_KEY = "loopstep_session_24b3007";

export function loadSavedSession(): SessionSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed as SessionSnapshot;
  } catch (err) {
    console.error("Failed to load session:", err);
    return null;
  }
}

export function saveSession(snapshot: SessionSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.error("Failed to save session:", err);
  }
}

export function clearSavedSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear session:", err);
  }
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
