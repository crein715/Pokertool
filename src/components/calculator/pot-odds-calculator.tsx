"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { calculatePotOdds, calculateExpectedValueEdge, isProfitableCall } from "@/lib/poker-math";
import { PotOddsGauge } from "./pot-odds-gauge";
import { PresetButtons } from "./preset-buttons";

export function PotOddsCalculator() {
  const { t } = useT();
  const [pot, setPot] = useState<string>("500");
  const [call, setCall] = useState<string>("150");
  const [equity, setEquity] = useState<number>(50);

  const potNum = parseFloat(pot) || 0;
  const callNum = parseFloat(call) || 0;

  const potOdds = useMemo(() => calculatePotOdds(potNum, callNum), [potNum, callNum]);
  const edge = useMemo(() => calculateExpectedValueEdge(equity, potOdds), [equity, potOdds]);
  const profitable = useMemo(() => isProfitableCall(equity, potOdds), [equity, potOdds]);
  const valid = potNum > 0 && callNum > 0;

  const PRESETS = [
    { label: t("potOdds.preset.halfPot"), description: t("potOdds.preset.halfPot.desc"), pot: 1000, call: 500 },
    { label: t("potOdds.preset.threequarterPot"), description: t("potOdds.preset.threequarterPot.desc"), pot: 1000, call: 750 },
    { label: t("potOdds.preset.fullPot"), description: t("potOdds.preset.fullPot.desc"), pot: 1000, call: 1000 },
    { label: t("potOdds.preset.overbet"), description: t("potOdds.preset.overbet.desc"), pot: 1000, call: 2000 },
  ];

  const verdictText = profitable
    ? t("potOdds.result.verdictCall")
        .replace("{equity}", String(equity))
        .replace("{needed}", potOdds.toFixed(1))
    : t("potOdds.result.verdictFold")
        .replace("{equity}", String(equity))
        .replace("{needed}", potOdds.toFixed(1));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 font-medium">{t("potOdds.potSize")}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
            <input
              type="number"
              value={pot}
              onChange={(e) => setPot(e.target.value)}
              className="w-full h-12 sm:h-10 rounded-xl border border-white/10 bg-white/[0.04] pl-7 pr-3 text-base sm:text-sm text-white outline-none focus:border-poker-green/50 focus:ring-1 focus:ring-poker-green/30 transition-all"
              min={0}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 font-medium">{t("potOdds.betToCall")}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
            <input
              type="number"
              value={call}
              onChange={(e) => setCall(e.target.value)}
              className="w-full h-12 sm:h-10 rounded-xl border border-white/10 bg-white/[0.04] pl-7 pr-3 text-base sm:text-sm text-white outline-none focus:border-poker-green/50 focus:ring-1 focus:ring-poker-green/30 transition-all"
              min={0}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 font-medium">
            {t("potOdds.yourEquity").replace("{n}%", "")}<span className="text-white/80">{equity}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={equity}
            onChange={(e) => setEquity(parseInt(e.target.value))}
            className="w-full h-12 sm:h-10 accent-poker-green cursor-pointer"
          />
        </div>
      </div>

      <div className="text-xs text-white/40">
        {t("potOdds.quickPresets")}
      </div>
      <PresetButtons
        presets={PRESETS}
        onSelect={(p) => {
          setPot(String(p.pot));
          setCall(String(p.call));
        }}
      />

      {valid && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-6">
          <div className="flex items-stretch gap-3 sm:gap-6">
            <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <div className="text-xs text-white/40 mb-1">{t("potOdds.result.youNeedLabel")}</div>
              <div className="text-3xl sm:text-2xl font-bold text-white">{potOdds.toFixed(1)}%</div>
              <div className="text-[11px] text-white/30 mt-1">{t("potOdds.result.toBreakEven")}</div>
            </div>
            <div className="flex items-center text-white/20 text-lg font-bold shrink-0">vs</div>
            <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <div className="text-xs text-white/40 mb-1">{t("potOdds.result.youHaveLabel")}</div>
              <div className={cn(
                "text-3xl sm:text-2xl font-bold",
                profitable ? "text-green-400" : "text-red-400"
              )}>
                {equity}%
              </div>
              <div className="text-[11px] text-white/30 mt-1">{t("potOdds.result.yourEstimatedChance")}</div>
            </div>
          </div>

          <PotOddsGauge potOdds={potOdds} equity={equity} />

          <div
            className={cn(
              "rounded-xl p-5 text-center space-y-2 transition-all duration-200 border",
              profitable
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl">{profitable ? "✅" : "❌"}</span>
              <span className={cn(
                "text-2xl sm:text-xl font-bold",
                profitable ? "text-green-400" : "text-red-400"
              )}>
                {profitable ? t("potOdds.result.call") : t("potOdds.result.fold")}
              </span>
            </div>
            <p className={cn(
              "text-sm leading-relaxed max-w-md mx-auto",
              profitable ? "text-green-300/70" : "text-red-300/70"
            )}>
              {verdictText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
