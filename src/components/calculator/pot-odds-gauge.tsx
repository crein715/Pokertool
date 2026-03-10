"use client";

import { cn } from "@/lib/utils";

interface PotOddsGaugeProps {
  potOdds: number;
  equity: number;
}

export function PotOddsGauge({ potOdds, equity }: PotOddsGaugeProps) {
  const clampedPotOdds = Math.min(100, Math.max(0, potOdds));
  const clampedEquity = Math.min(100, Math.max(0, equity));
  const isProfitable = clampedEquity >= clampedPotOdds;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
      <div className="relative h-10 rounded-full overflow-hidden bg-white/[0.06] border border-white/10">
        <div
          className="absolute inset-y-0 left-0 bg-red-500/25"
          style={{ width: `${clampedPotOdds}%` }}
        />
        <div
          className="absolute inset-y-0 bg-green-500/25"
          style={{ left: `${clampedPotOdds}%`, right: 0 }}
        />

        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/60 z-10"
          style={{ left: `${clampedPotOdds}%` }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-white/50 font-medium">
            Need {clampedPotOdds.toFixed(1)}%
          </div>
        </div>

        <div
          className="absolute top-1/2 -translate-y-1/2 z-20"
          style={{ left: `${clampedEquity}%`, transform: `translateX(-50%) translateY(-50%)` }}
        >
          <div
            className={cn(
              "w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow-lg",
              isProfitable
                ? "bg-green-500 border-green-300 text-green-950"
                : "bg-red-500 border-red-300 text-red-950"
            )}
          >
            {isProfitable ? "✓" : "✗"}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500/30 border border-red-500/50" />
          <span className="text-white/40">Fold zone</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500/30 border border-green-500/50" />
          <span className="text-white/40">Call zone</span>
        </div>
      </div>
    </div>
  );
}
