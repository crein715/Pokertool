"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { type Action } from "@/lib/ranges";
import type { QuizHand } from "@/lib/trainer";
import { formatAction } from "@/lib/trainer";
import { useLocale, useT } from "@/lib/i18n";
import { MiniRangeGrid } from "./mini-range-grid";
import { Check, X } from "lucide-react";

interface QuizResultProps {
  hand: QuizHand;
  selectedAction: Action;
  isCorrect: boolean;
  onNext: () => void;
}

export function QuizResult({ hand, selectedAction, isCorrect, onNext }: QuizResultProps) {
  const { locale } = useLocale();
  const { t } = useT();
  const [countdown, setCountdown] = useState(4);

  const stableNext = useCallback(() => {
    onNext();
  }, [onNext]);

  useEffect(() => {
    setCountdown(4);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          stableNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hand, stableNext]);

  return (
    <div className={cn(
      "rounded-xl border p-5 space-y-4 animate-[fade-in_0.2s_ease-out]",
      isCorrect
        ? "border-emerald-500/30 bg-emerald-500/[0.06]"
        : "border-red-500/30 bg-red-500/[0.06]"
    )}>
      <div className="flex items-center gap-3">
        {isCorrect ? (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20">
            <Check className="w-6 h-6 text-emerald-400" />
          </div>
        ) : (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20 animate-[shake_0.4s_ease-out]">
            <X className="w-6 h-6 text-red-400" />
          </div>
        )}
        <div>
          <p className={cn(
            "text-lg font-bold",
            isCorrect ? "text-emerald-400" : "text-red-400"
          )}>
            {isCorrect ? t("quiz.correct") : t("quiz.incorrect")}
          </p>
          <p className="text-sm text-white/50">
            {t("quiz.correctPlay")
              .replace("{action}", formatAction(hand.correctAction, locale))
              .replace("{position}", hand.position.toUpperCase())
              .replace("{hand}", hand.handNotation)}
          </p>
        </div>
      </div>

      {!isCorrect && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/40">{t("quiz.yourPick")}</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-medium">
            <X className="w-3 h-3" />
            {formatAction(selectedAction, locale)}
          </span>
        </div>
      )}

      <p className="text-sm text-white/60 leading-relaxed">{hand.explanation}</p>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="shrink-0">
          <p className="text-xs text-white/30 mb-1.5 uppercase tracking-wider font-medium">{t("quiz.rangeContext")}</p>
          <MiniRangeGrid
            scenario={hand.scenario}
            position={hand.position}
            highlightHand={hand.handNotation}
          />
        </div>
        <div className="flex-1 flex flex-col items-stretch gap-2 sm:self-end">
          <button
            onClick={onNext}
            className="w-full rounded-lg bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/[0.12] hover:text-white transition-all"
          >
            {t("quiz.nextHand")}
            <kbd className="ml-2 rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-mono text-white/40">
              Space
            </kbd>
          </button>
          <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-white/20"
              style={{ animation: "countdown-bar 4s linear forwards" }}
            />
          </div>
          <p className="text-[10px] text-white/30 text-center">
            {t("quiz.autoAdvance").replace("{n}", String(countdown))}
          </p>
        </div>
      </div>
    </div>
  );
}
