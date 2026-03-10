"use client";

import { cn } from "@/lib/utils";
import { type Action } from "@/lib/ranges";
import { formatAction } from "@/lib/trainer";

interface ActionButtonsProps {
  actions: Action[];
  onAction: (a: Action) => void;
  disabled?: boolean;
}

const actionConfig: Record<Action, { bg: string; hover: string; ring: string; key: string }> = {
  raise: {
    bg: "bg-emerald-600",
    hover: "hover:bg-emerald-500 active:bg-emerald-700",
    ring: "focus-visible:ring-emerald-500/40",
    key: "R",
  },
  call: {
    bg: "bg-yellow-600",
    hover: "hover:bg-yellow-500 active:bg-yellow-700",
    ring: "focus-visible:ring-yellow-500/40",
    key: "C",
  },
  fold: {
    bg: "bg-red-600",
    hover: "hover:bg-red-500 active:bg-red-700",
    ring: "focus-visible:ring-red-500/40",
    key: "F",
  },
  "3bet": {
    bg: "bg-blue-600",
    hover: "hover:bg-blue-500 active:bg-blue-700",
    ring: "focus-visible:ring-blue-500/40",
    key: "B",
  },
  "4bet": {
    bg: "bg-violet-600",
    hover: "hover:bg-violet-500 active:bg-violet-700",
    ring: "focus-visible:ring-violet-500/40",
    key: "B",
  },
};

export function ActionButtons({ actions, onAction, disabled }: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {actions.map((action) => {
        const cfg = actionConfig[action];
        return (
          <button
            key={action}
            onClick={() => !disabled && onAction(action)}
            disabled={disabled}
            className={cn(
              "relative flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold text-white shadow-lg transition-all",
              "focus-visible:outline-none focus-visible:ring-3",
              cfg.bg,
              cfg.hover,
              cfg.ring,
              disabled && "opacity-40 cursor-not-allowed",
              !disabled && "hover:scale-[1.03] hover:shadow-xl active:scale-[0.97]"
            )}
          >
            {formatAction(action)}
            <kbd className="ml-1 rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-mono font-medium text-white/60">
              {cfg.key}
            </kbd>
          </button>
        );
      })}
    </div>
  );
}
