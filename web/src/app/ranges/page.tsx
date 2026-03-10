"use client";

import { useState } from "react";
import { RangeGrid } from "@/components/ranges/range-grid";
import { PositionSelector } from "@/components/ranges/position-selector";
import { ScenarioSelector } from "@/components/ranges/scenario-selector";
import { RangeStats } from "@/components/ranges/range-stats";
import { RangeLegend } from "@/components/ranges/range-legend";
import {
  type Position,
  type Scenario,
  positionLabels,
  getHandLabel,
  getAction,
  actionLabels,
  RANKS,
} from "@/lib/ranges";
import { cn } from "@/lib/utils";

export default function RangesPage() {
  const [position, setPosition] = useState<Position>("utg");
  const [scenario, setScenario] = useState<Scenario>("rfi");
  const [selectedHand, setSelectedHand] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);
  const [comparePos, setComparePos] = useState<Position>("btn");

  const allPositions: Position[] = ["utg", "mp", "co", "btn", "sb", "bb"];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Preflop Range Charts</h1>
        <p className="text-white/50">Visual guide to which hands to play from each position.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ScenarioSelector value={scenario} onChange={setScenario} />
        <label className="flex items-center gap-2 text-sm text-white/50">
          <input
            type="checkbox"
            checked={comparing}
            onChange={(e) => setComparing(e.target.checked)}
            className="rounded border-white/20 bg-white/5 accent-poker-green"
          />
          Compare Positions
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div>
          <span className="text-xs text-white/30 mb-1 block">{comparing ? "Position 1" : "Position"}</span>
          <PositionSelector value={position} onChange={setPosition} />
        </div>
        {comparing && (
          <div>
            <span className="text-xs text-white/30 mb-1 block">Position 2</span>
            <PositionSelector value={comparePos} onChange={setComparePos} />
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,280px]">
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:p-5">
            <RangeGrid
              scenario={scenario}
              position={position}
              comparePosition={comparing ? comparePos : null}
              onCellClick={(hand) => setSelectedHand(hand === selectedHand ? null : hand)}
            />
          </div>
          <RangeLegend />
        </div>

        <div className="space-y-4">
          <RangeStats scenario={scenario} position={position} />

          {selectedHand && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="text-lg font-bold text-poker-green">{selectedHand}</h3>
              <p className="text-xs text-white/30 mt-1 mb-3">Action by position ({scenario === "rfi" ? "RFI" : scenario === "vs_raise" ? "vs Raise" : "vs 3-Bet"})</p>
              <div className="space-y-1.5">
                {allPositions.map((p) => {
                  const action = getAction(scenario, p, selectedHand);
                  return (
                    <div key={p} className="flex items-center justify-between text-sm">
                      <span className={cn("font-medium", p === position && "text-poker-green")}>{positionLabels[p]}</span>
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-xs font-medium",
                          action === "raise" && "bg-emerald-500/20 text-emerald-400",
                          action === "call" && "bg-yellow-500/20 text-yellow-400",
                          action === "3bet" && "bg-blue-500/20 text-blue-400",
                          action === "4bet" && "bg-purple-500/20 text-purple-400",
                          action === "fold" && "bg-white/5 text-white/30"
                        )}
                      >
                        {actionLabels[action]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
