"use client";

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface PokerTermProps {
  termKey: string;
  children: React.ReactNode;
}

export function PokerTerm({ termKey, children }: PokerTermProps) {
  const { t } = useT();
  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          "border-b border-dashed border-white/30 cursor-help",
          "hover:border-poker-green hover:text-poker-green transition-colors"
        )}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-sm">{t(termKey)}</p>
      </TooltipContent>
    </Tooltip>
  );
}
