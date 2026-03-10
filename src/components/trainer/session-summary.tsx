"use client";

import { cn } from "@/lib/utils";
import { positionLabels, type Action } from "@/lib/ranges";
import { formatAction } from "@/lib/trainer";
import { getWeakestPosition } from "@/lib/trainer-stats";
import { useLocale, useT } from "@/lib/i18n";
import { Trophy, Clock, Target, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SessionSummaryProps {
  hands: number;
  correct: number;
  bestStreak: number;
  duration: number;
  byPosition: Record<string, { total: number; correct: number }>;
  byAction: Record<string, { total: number; correct: number }>;
  onRestart: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export function SessionSummary({
  hands,
  correct,
  bestStreak,
  duration,
  byPosition,
  byAction,
  onRestart,
}: SessionSummaryProps) {
  const { locale } = useLocale();
  const { t } = useT();
  const accuracy = hands > 0 ? Math.round((correct / hands) * 100) : 0;
  const weakest = getWeakestPosition(byPosition);

  const actionEntries = Object.entries(byAction).map(([act, data]) => ({
    action: act,
    total: data.total,
    correct: data.correct,
    pct: Math.round((data.correct / data.total) * 100),
  }));

  const totalActionHands = actionEntries.reduce((s, e) => s + e.total, 0);

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-[fade-in_0.3s_ease-out]">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-poker-green/10 mb-2">
          <Trophy className={cn(
            "w-8 h-8",
            accuracy >= 80 ? "text-poker-green" : accuracy >= 60 ? "text-yellow-400" : "text-red-400"
          )} />
        </div>
        <h2 className="text-2xl font-bold">{t("summary.title")}</h2>
        <p className="text-white/40">{t("summary.subtitle")}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <div className={cn(
            "text-3xl font-bold tabular-nums",
            accuracy >= 80 ? "text-emerald-400" : accuracy >= 60 ? "text-yellow-400" : "text-red-400"
          )}>
            {accuracy}%
          </div>
          <p className="text-xs text-white/40 mt-1">{t("summary.accuracy")}</p>
          <p className="text-[10px] text-white/30">{correct}/{hands}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <div className="text-3xl font-bold tabular-nums text-orange-400">
            🔥 {bestStreak}
          </div>
          <p className="text-xs text-white/40 mt-1">{t("summary.bestStreak")}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <div className="text-3xl font-bold tabular-nums text-blue-400 flex items-center justify-center gap-1">
            <Clock className="w-5 h-5" />
            {formatDuration(duration)}
          </div>
          <p className="text-xs text-white/40 mt-1">{t("summary.time")}</p>
        </div>
      </div>

      {weakest && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/[0.04] p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-400">{t("summary.weakestSpot")}</p>
              <p className="text-sm text-white/60 mt-1">
                {t("summary.struggleWith")
                  .replace("{position}", positionLabels[weakest.position as keyof typeof positionLabels] || weakest.position.toUpperCase())
                  .replace("{accuracy}", String(weakest.accuracy))}
              </p>
              <p className="text-xs text-white/40 mt-1">
                {weakest.accuracy < 60
                  ? t("summary.focusStudy")
                  : t("summary.gettingThere")}
              </p>
            </div>
          </div>
        </div>
      )}

      {actionEntries.length > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-poker-green" />
            {t("summary.actionBreakdown")}
          </h3>
          <div className="space-y-2">
            {actionEntries.map((entry) => (
              <div key={entry.action} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60 font-medium">
                    {formatAction(entry.action as Action, locale)}
                  </span>
                  <span className="text-white/40 tabular-nums">
                    {entry.pct}% ({entry.correct}/{entry.total})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex-1 h-4 rounded bg-white/[0.04] overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500/50 flex items-center justify-center text-[8px] font-bold text-white/80"
                      style={{ width: `${(entry.total / totalActionHands) * 100}%` }}
                    >
                      {Math.round((entry.total / totalActionHands) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="flex-1 rounded-xl bg-poker-green px-4 py-3 text-sm font-bold text-black hover:bg-emerald-400 transition-colors"
        >
          {t("summary.practiceAgain")}
        </button>
        <Link
          href="/ranges"
          className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors text-center flex items-center justify-center gap-2"
        >
          {t("summary.reviewRanges")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
