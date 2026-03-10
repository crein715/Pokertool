"use client";

import { useEffect } from "react";
import { useT, useLocalizedData } from "@/lib/i18n";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeader } from "@/components/layout/page-header";
import { Lightbulb } from "lucide-react";
import { markComplete } from "@/lib/progress";
import {
  Hand,
  MapPin,
  Calculator,
  Coins,
  Wallet,
  Eye,
  Zap,
  Brain,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  hand: Hand,
  "map-pin": MapPin,
  calculator: Calculator,
  coins: Coins,
  wallet: Wallet,
  eye: Eye,
  zap: Zap,
  brain: Brain,
};

export default function ConceptsPage() {
  const { t } = useT();
  const { concepts } = useLocalizedData();

  useEffect(() => {
    const timer = setTimeout(() => markComplete("concepts"), 30000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        icon={Lightbulb}
        iconColor="text-yellow-400"
        title={t("concepts.title")}
        subtitle={t("concepts.subtitle")}
        badge={t("concepts.badge")}
      />

      <Accordion className="space-y-3">
        {concepts.map((concept, idx) => {
          const Icon = iconMap[concept.icon] || Zap;
          return (
            <AccordionItem
              key={concept.id}
              value={concept.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 overflow-hidden transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.1] animate-[slide-up_0.4s_ease-out_both]"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <AccordionTrigger className="py-4 hover:no-underline group">
                <div className="flex items-center gap-4 text-left">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-poker-green/10">
                    <Icon className="h-5 w-5 text-poker-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-poker-green transition-colors">
                      <span className="text-white/30 mr-2">{idx + 1}.</span>
                      {concept.title}
                    </h3>
                    <p className="text-sm text-white/40">{concept.summary}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <div className="space-y-3 pl-14">
                  {concept.details.map((para, i) => (
                    <p key={i} className="text-sm text-white/60 leading-relaxed">
                      {para}
                    </p>
                  ))}
                  <div className="mt-4 rounded-lg border border-poker-green/20 bg-poker-green/5 p-4">
                    <p className="text-sm font-medium">
                      <span className="text-poker-green">{t("concepts.keyTakeaway")}</span>{" "}
                      <span className="text-white/70">{concept.takeaway}</span>
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
