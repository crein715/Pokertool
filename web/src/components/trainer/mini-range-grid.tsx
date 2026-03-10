"use client";

import { cn } from "@/lib/utils";
import { RANKS, getHandLabel, getAction, actionColors, type Scenario, type Position, type Action } from "@/lib/ranges";

interface MiniRangeGridProps {
  scenario: Scenario;
  position: Position;
  highlightHand: string;
}

function notationToCell(notation: string): [number, number] {
  const r1 = RANKS.indexOf(notation[0] as (typeof RANKS)[number]);
  const r2 = RANKS.indexOf(notation[1] as (typeof RANKS)[number]);
  if (notation.length === 2) return [r1, r1];
  if (notation[2] === "s") return [r1, r2];
  return [r2, r1];
}

export function MiniRangeGrid({ scenario, position, highlightHand }: MiniRangeGridProps) {
  const [hRow, hCol] = notationToCell(highlightHand);

  return (
    <div className="inline-block">
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(13, 1fr)",
          gap: "1px",
          width: 234,
          height: 234,
        }}
      >
        {RANKS.map((_, row) =>
          RANKS.map((_, col) => {
            const label = getHandLabel(row, col);
            const action = getAction(scenario, position, label);
            const isFold = action === "fold";
            const isHighlight = row === hRow && col === hCol;
            const color = actionColors[action];

            return (
              <div
                key={`${row}-${col}`}
                className={cn(
                  "flex items-center justify-center text-[7px] font-semibold leading-none rounded-[2px]",
                  isFold ? "bg-white/[0.03] text-white/15" : "text-black/70",
                  isHighlight && "ring-2 ring-white z-10 scale-[1.3] rounded-sm"
                )}
                style={{
                  backgroundColor: isFold ? undefined : color,
                  width: 17,
                  height: 17,
                }}
              >
                {isHighlight ? label : ""}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
