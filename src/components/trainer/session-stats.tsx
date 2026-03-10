"use client";

import { cn } from "@/lib/utils";
import { positionLabels, type Action } from "@/lib/ranges";
import { formatAction } from "@/lib/trainer";
import { useLocale, useT } from "@/lib/i18n";
import { Flame, Target, TrendingUp, BarChart3 } from "lucide-react";

interface SessionStatsPanelProps {
  hands: number;
  correct: number;
  streak: number;
  bestStreak: number;
  byPosition: Record<string, { total: number; correct: number }>;
  byAction: Record<string, { total: number; correct: number }>;
}

export function SessionStatsPanel({
  hands,
  correct,
  streak,
  bestStreak,
  byPosition,
  byAction,
}: SessionStatsPanelProps) {
  const { locale } = useLocale();
  const { t } = useT();
  const accuracy = hands > 0 ? Math.round((correct / hands) * 100) : 0;
  const isHot = streak >= 5;
  const isBlazing = streak >= 10;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-poker-green" />
          <h3 className="text-sm font-semibold">{t("session.stats")}</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white/[0.03] p-3 text-center">
            <div className={cn(
              "text-2xl font-bold tabular-nums flex items-center justify-center gap-1",
              isBlazing ? "text-orange-400" : isHot ? "text-yellow-400" : "text-white"
            )}>
              {isHot && (
                <span className={cn(
                  "inline-block",
                  isBlazing && "animate-[streak-fire_0.6s_ease-in-out_infinite]"
                )}>
                  🔥
                </span>
              )}
              {streak}
            </div>
            <p className="text-[10px] text-white/40 mt-0.5">{t("session.currentStreak")}</p>
          </div>
          <div className="rounded-lg bg-white/[0.03] p-3 text-center">
            <div className={cn(
              "text-2xl font-bold tabular-nums",
              accuracy >= 80 ? "text-emerald-400" : accuracy >= 60 ? "text-yellow-400" : "text-red-400"
            )}>
              {accuracy}%
            </div>
            <p className="text-[10px] text-white/40 mt-0.5">{t("session.accuracy")}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-white/50">
          <span>{correct}/{hands} {t("session.correct")}</span>
          <span>{t("session.best")} {bestStreak} 🔥</span>
        </div>
      </div>

      {Object.keys(byPosition).length > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold">{t("session.byPosition")}</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(byPosition)
              .sort(([a], [b]) => {
                const order = ["utg", "mp", "co", "btn", "sb", "bb"];
                return order.indexOf(a) - order.indexOf(b);
              })
              .map(([pos, data]) => {
                const pct = Math.round((data.correct / data.total) * 100);
                return (
                  <div key={pos} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60 font-medium">{positionLabels[pos as keyof typeof positionLabels] || pos.toUpperCase()}</span>
                      <span className="text-white/40 tabular-nums">{pct}% ({data.correct}/{data.total})</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {Object.keys(byAction).length > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold">{t("session.byAction")}</h3>
          </div>
          <div className="space-y-1.5">
            {Object.entries(byAction).map(([act, data]) => {
              const pct = Math.round((data.correct / data.total) * 100);
              return (
                <div key={act} className="flex items-center justify-between text-xs">
                  <span className="text-white/60 font-medium">
                    {formatAction(act as Action, locale)}
                  </span>
                  <span className={cn(
                    "tabular-nums font-medium",
                    pct >= 80 ? "text-emerald-400" : pct >= 60 ? "text-yellow-400" : "text-red-400"
                  )}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
