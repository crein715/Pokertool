"use client";

import { useState, useEffect } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Lightbulb, type LucideIcon } from "lucide-react";

interface HowThisWorksProps {
  titleKey: string;
  stepsKeys: string[];
  icon?: LucideIcon;
  pageId: string;
}

export function HowThisWorks({ titleKey, stepsKeys, icon: Icon = Lightbulb, pageId }: HowThisWorksProps) {
  const { t } = useT();
  const lsKey = `poker-guide-${pageId}`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(lsKey);
      if (stored === "open") setOpen(true);
    } catch {}
  }, [lsKey]);

  const handleChange = (value: number[]) => {
    const isOpen = value.length > 0;
    setOpen(isOpen);
    try {
      localStorage.setItem(lsKey, isOpen ? "open" : "closed");
    } catch {}
  };

  return (
    <div className="glass-card rounded-xl animate-[fade-in_0.4s_ease-out]">
      <Accordion value={open ? [0] : []} onValueChange={handleChange}>
        <AccordionItem value={0} className="border-none">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-poker-green/10">
                <Icon className="h-4 w-4 text-poker-green" />
              </div>
              <span className="text-sm font-semibold text-white/80">{t(titleKey)}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <ol className="ml-10 space-y-2">
              {stepsKeys.map((key, i) => (
                <li key={key} className="flex items-start gap-2.5 text-sm text-white/50 leading-relaxed">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-white/40">
                    {i + 1}
                  </span>
                  <span>{t(key)}</span>
                </li>
              ))}
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
