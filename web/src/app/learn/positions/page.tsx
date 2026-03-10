"use client";

import { useState, useEffect } from "react";
import { useT, useLocalizedData } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { MapPin } from "lucide-react";
import { markComplete } from "@/lib/progress";

export default function PositionsPage() {
  const { t } = useT();
  const { positions } = useLocalizedData();
  const [selected, setSelected] = useState<string>("btn");
  const selectedPos = positions.find((p) => p.id === selected)!;

  useEffect(() => {
    const timer = setTimeout(() => markComplete("positions"), 30000);
    return () => clearTimeout(timer);
  }, []);

  const zoneLabel = (zone: string) => {
    if (zone === "early") return t("positions.zone.early");
    if (zone === "middle") return t("positions.zone.middle");
    if (zone === "late") return t("positions.zone.late");
    return t("positions.zone.blind");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        icon={MapPin}
        title={t("positions.title")}
        subtitle={t("positions.subtitle")}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
        <div className="relative flex items-center justify-center">
          <div className="relative w-full max-w-lg aspect-[1.7/1]">
            <div className="absolute inset-4 sm:inset-8 rounded-[50%] bg-gradient-to-b from-emerald-900/60 to-emerald-950/80 border-4 border-emerald-700/40 shadow-[inset_0_4px_30px_rgba(0,0,0,0.4)]">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-emerald-500/30 font-bold text-sm sm:text-base tracking-widest uppercase">Poker Table</span>
              </div>
            </div>

            {positions.map((pos, index) => {
              const rad = (pos.angle * Math.PI) / 180;
              const rx = 50;
              const ry = 46;
              const cx = 50 + rx * Math.cos(rad);
              const cy = 50 + ry * Math.sin(rad);

              return (
                <button
                  key={pos.id}
                  onClick={() => setSelected(pos.id)}
                  className={cn(
                    "absolute flex flex-col items-center justify-center w-11 h-11 sm:w-14 sm:h-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 text-[10px] sm:text-xs font-bold transition-all animate-[slide-up_0.3s_ease-out_both]",
                    selected === pos.id
                      ? "bg-poker-green border-poker-green text-black scale-110 shadow-lg shadow-poker-green/30"
                      : pos.zone === "early" || pos.zone === "blind"
                      ? "bg-neutral-800 border-neutral-600 text-white hover:border-poker-green/50 hover:bg-neutral-700"
                      : pos.zone === "middle"
                      ? "bg-neutral-800 border-yellow-600/50 text-white hover:border-poker-green/50 hover:bg-neutral-700"
                      : "bg-neutral-800 border-emerald-600/50 text-white hover:border-poker-green/50 hover:bg-neutral-700"
                  )}
                  style={{ left: `${cx}%`, top: `${cy}%`, animationDelay: `${index * 0.06}s` }}
                >
                  <span>{pos.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.1]">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{selectedPos.zoneEmoji}</span>
            <div>
              <h3 className="text-xl font-bold">{selectedPos.fullName}</h3>
              <p className="text-sm text-white/40">{selectedPos.name}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-white/30">{t("positions.zone")}</span>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={cn(
                    "inline-block rounded-full px-3 py-1 text-xs font-medium",
                    selectedPos.zone === "early" && "bg-red-500/20 text-red-400",
                    selectedPos.zone === "middle" && "bg-yellow-500/20 text-yellow-400",
                    selectedPos.zone === "late" && "bg-emerald-500/20 text-emerald-400",
                    selectedPos.zone === "blind" && "bg-red-500/20 text-red-400"
                  )}
                >
                  {zoneLabel(selectedPos.zone)}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-white/30">{t("positions.handsToPlay")}</span>
              <p className="mt-1 text-2xl font-bold text-poker-green">{selectedPos.handsPercent}</p>
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-white/30">{t("positions.overview")}</span>
              <p className="mt-1 text-sm text-white/60 leading-relaxed">{selectedPos.description}</p>
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-white/30">{t("positions.strategy")}</span>
              <p className="mt-1 text-sm text-white/60 leading-relaxed">{selectedPos.strategy}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-white/40">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/40 border border-red-500/40" /> {t("positions.legend.early")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-yellow-500/40 border border-yellow-500/40" /> {t("positions.legend.middle")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-emerald-500/40 border border-emerald-500/40" /> {t("positions.legend.late")}
        </span>
      </div>
    </div>
  );
}
