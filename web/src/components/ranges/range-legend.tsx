"use client";

import { actionColors, type Action } from "@/lib/ranges";
import { useT } from "@/lib/i18n";

const legendActions: Action[] = ["raise", "call", "3bet", "4bet", "fold"];
const labelKeys: Record<Action, string> = {
  raise: "ranges.actionLabels.raise",
  call: "ranges.actionLabels.call",
  "3bet": "ranges.actionLabels.3bet",
  "4bet": "ranges.actionLabels.4bet",
  fold: "ranges.actionLabels.fold",
};

export function RangeLegend() {
  const { t } = useT();

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
          <span className="text-xs text-white/60">{t(labelKeys[action])}</span>
        </div>
      ))}
    </div>
  );
}
