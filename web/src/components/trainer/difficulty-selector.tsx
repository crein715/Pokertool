"use client";

import { cn } from "@/lib/utils";
import type { Difficulty } from "@/lib/trainer";

const levels: { value: Difficulty; label: string; desc: string }[] = [
  { value: "easy", label: "Easy", desc: "Premium hands & clear folds" },
  { value: "medium", label: "Medium", desc: "Full range, RFI only" },
  { value: "hard", label: "Hard", desc: "RFI + vs Raise + vs 3-Bet" },
];

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onChange: (d: Difficulty) => void;
  disabled?: boolean;
}

export function DifficultySelector({ difficulty, onChange, disabled }: DifficultySelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-white/[0.04] p-1">
      {levels.map((l) => (
        <button
          key={l.value}
          onClick={() => !disabled && onChange(l.value)}
          disabled={disabled}
          className={cn(
            "relative rounded-md px-3 py-1.5 text-sm font-medium transition-all",
            difficulty === l.value
              ? "bg-poker-green text-black shadow-sm"
              : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

export function DifficultyDescription({ difficulty }: { difficulty: Difficulty }) {
  const level = levels.find((l) => l.value === difficulty);
  return (
    <p className="text-xs text-white/40">{level?.desc}</p>
  );
}
