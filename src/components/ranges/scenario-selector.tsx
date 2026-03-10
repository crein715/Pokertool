"use client";

import { cn } from "@/lib/utils";
import { type Scenario } from "@/lib/ranges";
import { useT } from "@/lib/i18n";

interface ScenarioSelectorProps {
  value: Scenario;
  onChange: (s: Scenario) => void;
  className?: string;
}

const scenarios: Scenario[] = ["rfi", "vs_raise", "vs_3bet"];
const scenarioKeys: Record<Scenario, string> = {
  rfi: "ranges.scenarioLabels.rfi",
  vs_raise: "ranges.scenarioLabels.vs_raise",
  vs_3bet: "ranges.scenarioLabels.vs_3bet",
};

export function ScenarioSelector({ value, onChange, className }: ScenarioSelectorProps) {
  const { t } = useT();

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
          {t(scenarioKeys[s])}
        </button>
      ))}
    </div>
  );
}
