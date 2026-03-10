"use client";

import { cn } from "@/lib/utils";
import { positionLabels, type Position } from "@/lib/ranges";

interface PositionSelectorProps {
  value: Position;
  onChange: (p: Position) => void;
  className?: string;
}

const positions: Position[] = ["utg", "mp", "co", "btn", "sb", "bb"];

export function PositionSelector({ value, onChange, className }: PositionSelectorProps) {
  return (
    <div className={cn("flex gap-1 rounded-lg bg-white/[0.04] p-1", className)}>
      {positions.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-all",
            value === p
              ? "bg-poker-green text-black shadow-md"
              : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
          )}
        >
          {positionLabels[p]}
        </button>
      ))}
    </div>
  );
}
