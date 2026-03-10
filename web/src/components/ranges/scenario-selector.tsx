"use client";

import { cn } from "@/lib/utils";
import { scenarioLabels, type Scenario } from "@/lib/ranges";

interface ScenarioSelectorProps {
  value: Scenario;
  onChange: (s: Scenario) => void;
  className?: string;
}

const scenarios: Scenario[] = ["rfi", "vs_raise", "vs_3bet"];

export function ScenarioSelector({ value, onChange, className }: ScenarioSelectorProps) {
  return (
    <div className={cn("flex gap-1 rounded-lg bg-white/[0.04] p-1", className)}>
      {scenarios.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-all",
            value === s
              ? "bg-white/10 text-white shadow-md"
              : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
          )}
        >
          {scenarioLabels[s]}
        </button>
      ))}
    </div>
  );
}
