"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculatePotOdds, calculateExpectedValueEdge, isProfitableCall } from "@/lib/poker-math";
import { PotOddsGauge } from "./pot-odds-gauge";
import { PresetButtons } from "./preset-buttons";

interface PotOddsPreset {
  label: string;
  description: string;
  pot: number;
  call: number;
}

const PRESETS: PotOddsPreset[] = [
  { label: "Half pot bet", description: "needs 33%", pot: 1000, call: 500 },
  { label: "3/4 pot bet", description: "needs 43%", pot: 1000, call: 750 },
  { label: "Full pot bet", description: "needs 50%", pot: 1000, call: 1000 },
  { label: "Overbet 2x pot", description: "needs 67%", pot: 1000, call: 2000 },
];

export function PotOddsCalculator() {
  const [pot, setPot] = useState<string>("500");
  const [call, setCall] = useState<string>("150");
  const [equity, setEquity] = useState<number>(50);
  const [howToUse, setHowToUse] = useState(false);

  const potNum = parseFloat(pot) || 0;
  const callNum = parseFloat(call) || 0;

  const potOdds = useMemo(() => calculatePotOdds(potNum, callNum), [potNum, callNum]);
  const edge = useMemo(() => calculateExpectedValueEdge(equity, potOdds), [equity, potOdds]);
  const profitable = useMemo(() => isProfitableCall(equity, potOdds), [equity, potOdds]);
  const valid = potNum > 0 && callNum > 0;

  return (
    <div className="space-y-6">
      <button
        onClick={() => setHowToUse(!howToUse)}
        className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors"
      >
        <Info className="h-3.5 w-3.5" />
        <span>How to use</span>
        {howToUse ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {howToUse && (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-white/50 space-y-2">
          <p>Enter the current pot size and the amount you need to call. Adjust the equity slider to match your estimated hand strength.</p>
          <p>The calculator instantly shows whether calling is profitable in the long run.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 font-medium">Pot size</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
            <input
              type="number"
              value={pot}
              onChange={(e) => setPot(e.target.value)}
              className="w-full h-10 rounded-lg border border-white/10 bg-white/[0.04] pl-7 pr-3 text-sm text-white outline-none focus:border-poker-green/50 focus:ring-1 focus:ring-poker-green/30 transition-all"
              min={0}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 font-medium">Bet to call</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
            <input
              type="number"
              value={call}
              onChange={(e) => setCall(e.target.value)}
              className="w-full h-10 rounded-lg border border-white/10 bg-white/[0.04] pl-7 pr-3 text-sm text-white outline-none focus:border-poker-green/50 focus:ring-1 focus:ring-poker-green/30 transition-all"
              min={0}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 font-medium">
            Your estimated equity: <span className="text-white/80">{equity}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={equity}
            onChange={(e) => setEquity(parseInt(e.target.value))}
            className="w-full h-10 accent-poker-green cursor-pointer"
          />
        </div>
      </div>

      <div className="text-xs text-white/40">
        Quick presets
      </div>
      <PresetButtons
        presets={PRESETS}
        onSelect={(p) => {
          setPot(String(p.pot));
          setCall(String(p.call));
        }}
      />

      {valid && (
        <>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ResultBox
                label="Pot Odds"
                value={`${potOdds.toFixed(1)}%`}
                detail={`${callNum} / ${potNum + callNum}`}
              />
              <ResultBox
                label="You Need"
                value={`${potOdds.toFixed(1)}%`}
                detail="equity to break even"
              />
              <ResultBox
                label="Your Equity"
                value={`${equity}%`}
                detail="estimated"
              />
              <ResultBox
                label="EV Edge"
                value={`${edge > 0 ? "+" : ""}${edge.toFixed(1)}%`}
                detail={edge > 0 ? "edge" : "shortfall"}
                positive={edge > 0}
              />
            </div>

            <PotOddsGauge potOdds={potOdds} equity={equity} />

            <div
              className={cn(
                "flex items-center justify-center gap-3 rounded-lg py-4 px-6 text-center font-bold text-lg transition-all",
                profitable
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              )}
            >
              <span className="text-2xl">{profitable ? "✅" : "❌"}</span>
              <span>{profitable ? "PROFITABLE CALL (+EV)" : "UNPROFITABLE CALL (-EV)"}</span>
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">How Pot Odds Work</h4>
            <div className="text-xs text-white/40 space-y-2 leading-relaxed">
              <p>Pot odds tell you the minimum equity (chance of winning) you need to make a profitable call.</p>
              <p><span className="text-white/60 font-mono">Formula:</span> Bet to Call ÷ (Current Pot + Bet to Call) = Minimum Equity Needed</p>
              <p>If your equity is <span className="text-green-400">HIGHER</span> than pot odds → Call is profitable long-term</p>
              <p>If your equity is <span className="text-red-400">LOWER</span> than pot odds → Fold saves money long-term</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ResultBox({
  label,
  value,
  detail,
  positive,
}: {
  label: string;
  value: string;
  detail: string;
  positive?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div
        className={cn(
          "text-xl font-bold",
          positive === true && "text-green-400",
          positive === false && "text-red-400"
        )}
      >
        {value}
      </div>
      <div className="text-[10px] text-white/30">{detail}</div>
    </div>
  );
}
