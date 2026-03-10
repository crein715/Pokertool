"use client";

import { cn } from "@/lib/utils";
import { RANKS, getHandLabel, getHandType, getAction, actionColors, type Action, type Scenario, type Position } from "@/lib/ranges";
import { RangeCell } from "./range-cell";
import { useState } from "react";

interface RangeGridProps {
  scenario: Scenario;
  position: Position;
  comparePosition?: Position | null;
  onCellClick?: (hand: string) => void;
  className?: string;
}

export function RangeGrid({ scenario, position, comparePosition, onCellClick, className }: RangeGridProps) {
  const [hoveredHand, setHoveredHand] = useState<string | null>(null);

  return (
    <div className={cn("inline-block", className)}>
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(13, 1fr)` }}>
        {RANKS.map((_, row) =>
          RANKS.map((_, col) => {
            const label = getHandLabel(row, col);
            const type = getHandType(row, col);
            const action = getAction(scenario, position, label);
            const compareAction = comparePosition ? getAction(scenario, comparePosition, label) : null;

            return (
              <RangeCell
                key={`${row}-${col}`}
                label={label}
                type={type}
                action={action}
                compareAction={compareAction}
                isHovered={hoveredHand === label}
                onMouseEnter={() => setHoveredHand(label)}
                onMouseLeave={() => setHoveredHand(null)}
                onClick={() => onCellClick?.(label)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
