"use client";

import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import type { Difficulty } from "@/lib/trainer";

const levelKeys: { value: Difficulty; label: string; desc: string }[] = [
  { value: "easy", label: "difficulty.easy", desc: "difficulty.easy.desc" },
  { value: "medium", label: "difficulty.medium", desc: "difficulty.medium.desc" },
  { value: "hard", label: "difficulty.hard", desc: "difficulty.hard.desc" },
];

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onChange: (d: Difficulty) => void;
  disabled?: boolean;
}

export function DifficultySelector({ difficulty, onChange, disabled }: DifficultySelectorProps) {
  const { t } = useT();

  return (
    <div className="flex items-center gap-1 rounded-lg bg-white/[0.04] p-1">
      {levelKeys.map((l) => (
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
          {t(l.label)}
        </button>
      ))}
    </div>
  );
}

export function DifficultyDescription({ difficulty }: { difficulty: Difficulty }) {
  const { t } = useT();
  const level = levelKeys.find((l) => l.value === difficulty);
  return (
    <p className="text-xs text-white/40">{level ? t(level.desc) : ""}</p>
  );
}
