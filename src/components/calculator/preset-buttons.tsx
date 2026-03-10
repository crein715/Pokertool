"use client";

import { cn } from "@/lib/utils";

interface Preset {
  label: string;
  description?: string;
}

interface PresetButtonsProps<T extends Preset> {
  presets: T[];
  onSelect: (preset: T) => void;
  className?: string;
}

export function PresetButtons<T extends Preset>({
  presets,
  onSelect,
  className,
}: PresetButtonsProps<T>) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:flex-wrap gap-2", className)}>
      {presets.map((preset) => (
        <button
          key={preset.label}
          onClick={() => onSelect(preset)}
          className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:px-3 sm:py-1.5 text-sm sm:text-xs text-white/60 hover:bg-white/[0.08] hover:text-white/80 hover:border-white/20 transition-all duration-200 active:scale-[0.98] text-left sm:text-center"
        >
          <span className="font-medium">{preset.label}</span>
          {preset.description && (
            <span className="ml-2 sm:ml-1.5 text-white/30">{preset.description}</span>
          )}
        </button>
      ))}
    </div>
  );
}
