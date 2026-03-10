"use client";

import { useState, useCallback, useMemo } from "react";
import { ChevronDown, ChevronUp, Info, Loader2 } from "lucide-react";
import type { Card } from "@/lib/poker-data";
import { suitSymbols } from "@/lib/poker-data";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { calculateEquity, type EquityResult } from "@/lib/equity";
import { MultiCardSelector } from "./card-selector";
import { EquityBar } from "./equity-bar";
import { PresetButtons } from "./preset-buttons";

function cardStr(c: Card): string {
  return `${c.rank}${suitSymbols[c.suit]}`;
}

export function EquityCalculator() {
  const { t } = useT();
  const [hand1, setHand1] = useState<(Card | null)[]>([null, null]);
  const [hand2, setHand2] = useState<(Card | null)[]>([null, null]);
  const [board, setBoard] = useState<(Card | null)[]>([null, null, null, null, null]);
  const [result, setResult] = useState<EquityResult | null>(null);
  const [computing, setComputing] = useState(false);
  const [presetNote, setPresetNote] = useState<string>("");
  const [howToUse, setHowToUse] = useState(false);

  const allSelected: Card[] = useMemo(() => {
    return [...hand1, ...hand2, ...board].filter((c): c is Card => c !== null);
  }, [hand1, hand2, board]);

  const canCalculate =
    hand1[0] !== null &&
    hand1[1] !== null &&
    hand2[0] !== null &&
    hand2[1] !== null;

  const PRESETS = useMemo(() => [
    {
      label: t("equity.preset.overpair"), description: t("equity.preset.overpair.desc"),
      hand1: [{ rank: "A" as const, suit: "spades" as const }, { rank: "A" as const, suit: "hearts" as const }] as [Card, Card],
      hand2: [{ rank: "K" as const, suit: "diamonds" as const }, { rank: "K" as const, suit: "clubs" as const }] as [Card, Card],
      board: [] as Card[], note: t("equity.preset.overpair.note"),
    },
    {
      label: t("equity.preset.pairVsOvercards"), description: t("equity.preset.pairVsOvercards.desc"),
      hand1: [{ rank: "Q" as const, suit: "spades" as const }, { rank: "Q" as const, suit: "hearts" as const }] as [Card, Card],
      hand2: [{ rank: "A" as const, suit: "diamonds" as const }, { rank: "K" as const, suit: "diamonds" as const }] as [Card, Card],
      board: [] as Card[], note: t("equity.preset.pairVsOvercards.note"),
    },
    {
      label: t("equity.preset.dominated"), description: t("equity.preset.dominated.desc"),
      hand1: [{ rank: "A" as const, suit: "spades" as const }, { rank: "K" as const, suit: "hearts" as const }] as [Card, Card],
      hand2: [{ rank: "A" as const, suit: "diamonds" as const }, { rank: "Q" as const, suit: "clubs" as const }] as [Card, Card],
      board: [] as Card[], note: t("equity.preset.dominated.note"),
    },
    {
      label: t("equity.preset.coinFlip"), description: t("equity.preset.coinFlip.desc"),
      hand1: [{ rank: "J" as const, suit: "spades" as const }, { rank: "J" as const, suit: "hearts" as const }] as [Card, Card],
      hand2: [{ rank: "A" as const, suit: "diamonds" as const }, { rank: "K" as const, suit: "diamonds" as const }] as [Card, Card],
      board: [] as Card[], note: t("equity.preset.coinFlip.note"),
    },
    {
      label: t("equity.preset.suitedConnector"), description: t("equity.preset.suitedConnector.desc"),
      hand1: [{ rank: "T" as const, suit: "clubs" as const }, { rank: "T" as const, suit: "diamonds" as const }] as [Card, Card],
      hand2: [{ rank: "8" as const, suit: "hearts" as const }, { rank: "7" as const, suit: "hearts" as const }] as [Card, Card],
      board: [] as Card[], note: t("equity.preset.suitedConnector.note"),
    },
  ], [t]);

  const handleCalculate = useCallback(() => {
    if (!canCalculate) return;
    setComputing(true);
    setResult(null);

    setTimeout(() => {
      const boardCards = board.filter((c): c is Card => c !== null);
      const eq = calculateEquity(
        [hand1[0]!, hand1[1]!],
        [hand2[0]!, hand2[1]!],
        boardCards,
        10000
      );
      setResult(eq);
      setComputing(false);
    }, 50);
  }, [hand1, hand2, board, canCalculate]);

  const handlePreset = useCallback((preset: typeof PRESETS[number]) => {
    setHand1([preset.hand1[0], preset.hand1[1]]);
    setHand2([preset.hand2[0], preset.hand2[1]]);
    const newBoard: (Card | null)[] = [null, null, null, null, null];
    preset.board.forEach((c, i) => { newBoard[i] = c; });
    setBoard(newBoard);
    setPresetNote(preset.note);
    setResult(null);
  }, []);

  const handleReset = useCallback(() => {
    setHand1([null, null]);
    setHand2([null, null]);
    setBoard([null, null, null, null, null]);
    setResult(null);
    setPresetNote("");
  }, []);

  return (
    <div className="space-y-6">
      <button
        onClick={() => setHowToUse(!howToUse)}
        className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors"
      >
        <Info className="h-3.5 w-3.5" />
        <span>{t("equity.howToUse")}</span>
        {howToUse ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {howToUse && (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-white/50 space-y-2">
          <p>{t("equity.helpText1")}</p>
          <p>{t("equity.helpText2")}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-green-400 uppercase tracking-wider">{t("equity.yourHand")}</div>
          <MultiCardSelector
            cards={hand1}
            onChange={(i, card) => { const next = [...hand1]; next[i] = card; setHand1(next); }}
            usedCards={allSelected.filter((c) => !hand1.some((h) => h && h.rank === c.rank && h.suit === c.suit))}
            count={2}
          />
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold text-red-400 uppercase tracking-wider">{t("equity.opponentHand")}</div>
          <MultiCardSelector
            cards={hand2}
            onChange={(i, card) => { const next = [...hand2]; next[i] = card; setHand2(next); }}
            usedCards={allSelected.filter((c) => !hand2.some((h) => h && h.rank === c.rank && h.suit === c.suit))}
            count={2}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">{t("equity.board")} <span className="font-normal text-white/30">{t("equity.boardOptional")}</span></div>
        <MultiCardSelector
          cards={board}
          onChange={(i, card) => { const next = [...board]; next[i] = card; setBoard(next); }}
          usedCards={allSelected.filter((c) => !board.some((b) => b && b.rank === c.rank && b.suit === c.suit))}
          count={5}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCalculate}
          disabled={!canCalculate || computing}
          className={cn(
            "rounded-lg px-6 py-2.5 text-sm font-semibold transition-all",
            canCalculate && !computing
              ? "bg-poker-green text-black hover:bg-poker-green/90 shadow-lg shadow-poker-green/20"
              : "bg-white/[0.06] text-white/30 cursor-not-allowed"
          )}
        >
          {computing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("equity.calculating")}
            </span>
          ) : (
            t("equity.calculate")
          )}
        </button>
        <button
          onClick={handleReset}
          className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/50 hover:bg-white/[0.06] hover:text-white/70 transition-all"
        >
          {t("equity.reset")}
        </button>
      </div>

      <div className="text-xs text-white/40">{t("equity.presets")}</div>
      <PresetButtons presets={PRESETS} onSelect={handlePreset} />

      {result && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-5">
          <EquityBar
            hand1Pct={result.hand1WinPct}
            hand2Pct={result.hand2WinPct}
            tiePct={result.tiePct}
          />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-white/40 mb-1">{t("equity.result.yourHand")}</div>
              <div className="text-2xl font-bold text-green-400">
                {result.hand1WinPct.toFixed(1)}%
              </div>
              <div className="text-[10px] text-white/30 mt-1">{result.hand1Best}</div>
            </div>
            <div>
              <div className="text-xs text-white/40 mb-1">{t("equity.result.tie")}</div>
              <div className="text-2xl font-bold text-white/50">
                {result.tiePct.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-white/40 mb-1">{t("equity.result.opponent")}</div>
              <div className="text-2xl font-bold text-red-400">
                {result.hand2WinPct.toFixed(1)}%
              </div>
              <div className="text-[10px] text-white/30 mt-1">{result.hand2Best}</div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-white/30">
              {t("equity.result.basedOn").replace("{n}", result.sampleSize.toLocaleString())}
            </div>
            {hand1[0] && hand1[1] && hand2[0] && hand2[1] && (
              <div className="text-sm text-white/50 mt-2 font-mono">
                {cardStr(hand1[0])}{cardStr(hand1[1])} vs {cardStr(hand2[0])}{cardStr(hand2[1])}
              </div>
            )}
          </div>

          {presetNote && (
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-xs text-white/50 flex items-start gap-2">
              <Info className="h-3.5 w-3.5 text-poker-green shrink-0 mt-0.5" />
              <span>{presetNote}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
