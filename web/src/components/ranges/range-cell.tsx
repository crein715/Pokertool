"use client";

import { cn } from "@/lib/utils";
import { actionColors, actionLabels, type Action } from "@/lib/ranges";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface RangeCellProps {
  label: string;
  type: "pair" | "suited" | "offsuit";
  action: Action;
  compareAction?: Action | null;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

export function RangeCell({ label, type, action, compareAction, isHovered, onMouseEnter, onMouseLeave, onClick }: RangeCellProps) {
  const color = actionColors[action];
  const isFold = action === "fold";
  const typeLabel = type === "pair" ? "Pocket Pair" : type === "suited" ? "Suited" : "Offsuit";

  if (compareAction && compareAction !== "fold" && action !== "fold") {
    const color1 = actionColors[action];
    const color2 = actionColors[compareAction];
    return (
      <Tooltip>
        <TooltipTrigger
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
          className={cn(
            "relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-[3px] text-[10px] font-semibold transition-all sm:h-10 sm:w-10 sm:text-xs cursor-pointer",
            isHovered && "ring-2 ring-white scale-110 z-10"
          )}
        >
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${color1} 50%, ${color2} 50%)` }} />
          <span className="relative z-10 text-black/80 drop-shadow-sm">{label}</span>
        </TooltipTrigger>
        <TooltipContent className="bg-neutral-900 border-white/10">
          <p className="font-bold">{label} — {typeLabel}</p>
          <p className="text-xs text-white/60">Pos 1: {actionLabels[action]} / Pos 2: {actionLabels[compareAction]}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-[3px] text-[10px] font-semibold transition-all sm:h-10 sm:w-10 sm:text-xs cursor-pointer",
          isFold ? "bg-white/[0.04] text-white/20" : "text-black/80",
          isHovered && "ring-2 ring-white scale-110 z-10"
        )}
        style={!isFold ? { backgroundColor: color } : undefined}
      >
        {label}
      </TooltipTrigger>
      <TooltipContent className="bg-neutral-900 border-white/10">
        <p className="font-bold">{label} — {typeLabel}</p>
        <p className="text-xs text-white/60">{actionLabels[action]}</p>
      </TooltipContent>
    </Tooltip>
  );
}
