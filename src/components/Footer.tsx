import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white py-3.5 px-6 text-xs text-slate-500">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 tracking-tight">LoopStep</span>
          <span className="text-slate-300">·</span>
          <span>Interactive Python Tutor</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px] font-medium">
            24b3007
          </span>
          <span className="text-slate-300">·</span>
          <Link
            href="/about"
            className="text-indigo-600 hover:text-indigo-800 transition font-medium"
          >
            About & Architecture
          </Link>
        </div>
      </div>
    </footer>
  );
}
