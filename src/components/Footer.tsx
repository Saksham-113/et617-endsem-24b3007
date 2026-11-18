import React from "react";
import Link from "next/link";
import { ShieldCheck, BookOpen, Clock, HeartHandshake } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-stone-border bg-[#FAF8F5] py-4 px-6 text-sm text-ink-light">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">Roll No / Identity Token:</span>
          <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-border text-calm-indigo font-bold shadow-sm">
            24b3007
          </span>
          <span className="text-xs text-ink-faint">| CBSE Cl. 10 Python Loops</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-ink-light">
            <span className="w-2 h-2 rounded-full bg-calm-green inline-block animate-pulse"></span>
            Card: P4 · T10 · L5 · C4
          </span>
          <Link
            href="/about"
            className="text-calm-indigo hover:underline font-medium flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-stone-border shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            About & AI Spec (D6)
          </Link>
        </div>
      </div>
    </footer>
  );
}
