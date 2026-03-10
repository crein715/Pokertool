"use client";

import { getRangeStats, positionLabels, type Scenario, type Position } from "@/lib/ranges";

interface RangeStatsProps {
  scenario: Scenario;
  position: Position;
}

export function RangeStats({ scenario, position }: RangeStatsProps) {
  const stats = getRangeStats(scenario, position);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <h3 className="mb-4 text-sm font-semibold text-white/40 uppercase tracking-wider">Range Stats</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-white/50">Position</p>
          <p className="text-xl font-bold text-poker-green">{positionLabels[position]}</p>
        </div>
        <div>
          <p className="text-sm text-white/50">Hands in range</p>
          <p className="text-xl font-bold">{stats.count} <span className="text-sm font-normal text-white/30">/ {stats.total}</span></p>
        </div>
        <div>
          <p className="text-sm text-white/50">Range %</p>
          <p className="text-xl font-bold">{stats.percent}%</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-poker-green transition-all duration-500"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
