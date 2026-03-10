"use client";

import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

interface EquityBarProps {
  hand1Pct: number;
  hand2Pct: number;
  tiePct: number;
}

export function EquityBar({ hand1Pct, hand2Pct, tiePct }: EquityBarProps) {
  const { t } = useT();

  return (
    <div className="space-y-2">
      <div className="relative h-4 sm:h-8 rounded-full overflow-hidden bg-white/[0.06] border border-white/10 flex">
        {hand1Pct > 0 && (
          <div
            className="h-full bg-green-500/60 flex items-center justify-center text-xs font-bold text-white transition-all duration-500"
            style={{ width: `${hand1Pct}%` }}
          >
            {hand1Pct >= 10 && `${hand1Pct.toFixed(1)}%`}
          </div>
        )}
        {tiePct > 0 && (
          <div
            className="h-full bg-white/20 flex items-center justify-center text-xs font-medium text-white/70 transition-all duration-500"
            style={{ width: `${tiePct}%` }}
          >
            {tiePct >= 8 && `${tiePct.toFixed(1)}%`}
          </div>
        )}
        {hand2Pct > 0 && (
          <div
            className="h-full bg-red-500/60 flex items-center justify-center text-xs font-bold text-white transition-all duration-500"
            style={{ width: `${hand2Pct}%` }}
          >
            {hand2Pct >= 10 && `${hand2Pct.toFixed(1)}%`}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500/50 border border-green-500/70" />
          <span className="text-white/50">{t("equity.result.yourHandLabel")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-white/20 border border-white/30" />
          <span className="text-white/50">{t("equity.result.tieLabel")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500/50 border border-red-500/70" />
          <span className="text-white/50">{t("equity.result.opponentLabel")}</span>
        </div>
      </div>
    </div>
  );
}
