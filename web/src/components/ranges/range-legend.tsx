"use client";

import { actionColors, actionLabels, type Action } from "@/lib/ranges";

const legendActions: Action[] = ["raise", "call", "3bet", "4bet", "fold"];

export function RangeLegend() {
  return (
    <div className="flex flex-wrap gap-3">
      {legendActions.map((action) => (
        <div key={action} className="flex items-center gap-2">
          <div
            className="h-4 w-4 rounded-sm"
            style={{
              backgroundColor: action === "fold" ? "transparent" : actionColors[action],
              border: action === "fold" ? "1px solid rgba(255,255,255,0.15)" : "none",
            }}
          />
          <span className="text-xs text-white/60">{actionLabels[action]}</span>
        </div>
      ))}
    </div>
  );
}
