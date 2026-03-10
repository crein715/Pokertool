"use client";

import { useT, useLocalizedData } from "@/lib/i18n";
import { CardHand } from "@/components/cards/playing-card";

export default function HandRankingsPage() {
  const { t } = useT();
  const { handRankings } = useLocalizedData();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("handRankings.title")}</h1>
        <p className="text-white/50">{t("handRankings.subtitle")}</p>
      </div>

      <div className="space-y-4">
        {handRankings.map((hand, index) => (
          <div
            key={hand.name}
            className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-poker-green/20"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-poker-green/10 text-sm font-bold text-poker-green">
                  {index + 1}
                </div>
                <div className="sm:hidden">
                  <h3 className="text-lg font-bold">{hand.name}</h3>
                  <p className="text-xs text-poker-green/80">{hand.probability}</p>
                </div>
              </div>

              <div className="flex justify-center sm:shrink-0">
                <CardHand cards={hand.cards} size="sm" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="hidden sm:block">
                  <h3 className="text-lg font-bold">{hand.name}</h3>
                  <span className="inline-block mt-0.5 text-xs font-medium text-poker-green/80 bg-poker-green/10 px-2 py-0.5 rounded-full">
                    {hand.probability}
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/50 leading-relaxed">{hand.description}</p>
                <p className="mt-1.5 text-xs text-white/30 font-mono">{hand.example}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
