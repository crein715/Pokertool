"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuizQuestionProps {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  onAnswer: (correct: boolean) => void;
  answered: boolean;
}

export function QuizQuestion({
  question,
  options,
  correctIndex,
  explanation,
  onAnswer,
  answered,
}: QuizQuestionProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelected(index);
    onAnswer(index === correctIndex);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-white/90">{question}</p>
      <div className="space-y-2">
        {options.map((opt, i) => {
          const isCorrect = i === correctIndex;
          const isSelected = i === selected;
          const showResult = answered && (isSelected || isCorrect);

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all duration-200",
                !answered && "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.12] cursor-pointer",
                answered && !showResult && "border-white/[0.04] bg-white/[0.01] text-white/30 cursor-default",
                answered && isCorrect && "border-poker-green/40 bg-poker-green/10 text-poker-green",
                answered && isSelected && !isCorrect && "border-poker-red/40 bg-poker-red/10 text-poker-red animate-[shake_0.4s]"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  !answered && "bg-white/[0.06] text-white/50",
                  answered && isCorrect && "bg-poker-green/20 text-poker-green",
                  answered && isSelected && !isCorrect && "bg-poker-red/20 text-poker-red",
                  answered && !showResult && "bg-white/[0.03] text-white/20"
                )}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {answered && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-poker-green" />}
              {answered && isSelected && !isCorrect && <XCircle className="h-4 w-4 shrink-0 text-poker-red" />}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="rounded-lg border border-poker-green/20 bg-poker-green/5 p-4 animate-[slide-up_0.3s_ease-out_both]">
          <p className="text-sm text-white/70 leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  );
}
