"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TutorialStepperProps {
  steps: string[];
  currentStep: number;
  completedSteps: Set<number>;
}

export function TutorialStepper({ steps, currentStep, completedSteps }: TutorialStepperProps) {
  return (
    <div className="flex items-start justify-between gap-1 sm:gap-2 overflow-x-auto pb-2">
      {steps.map((label, i) => {
        const done = completedSteps.has(i);
        const isCurrent = i === currentStep;

        return (
          <div
            key={i}
            className="flex flex-1 min-w-0 flex-col items-center gap-2 text-center"
          >
            <div className="relative flex items-center justify-center">
              {i > 0 && (
                <div
                  className={cn(
                    "absolute right-full w-4 sm:w-8 lg:w-12 border-t border-dashed",
                    done ? "border-poker-green/40" : "border-white/[0.08]"
                  )}
                />
              )}
              <div
                className={cn(
                  "flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl transition-all duration-200",
                  done
                    ? "bg-poker-green/15 text-poker-green"
                    : isCurrent
                    ? "bg-poker-green/10 text-poker-green ring-2 ring-poker-green/30 animate-[pulse-glow_2s_ease-in-out_infinite]"
                    : "bg-white/[0.04] text-white/25"
                )}
              >
                {done ? <Check className="h-5 w-5" /> : <span className="text-sm font-semibold">{i + 1}</span>}
              </div>
            </div>
            <span
              className={cn(
                "text-[10px] sm:text-xs font-medium leading-tight max-w-[70px] sm:max-w-none",
                done ? "text-poker-green" : isCurrent ? "text-white/70" : "text-white/30"
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
