"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { useLocale, useT } from "@/lib/i18n";
import {
  generateQuizHand,
  getAvailableActions,
  formatAction,
  ALL_POSITIONS,
  getPositionFullName,
  type Difficulty,
  type QuizHand,
} from "@/lib/trainer";
import {
  loadStats,
  saveStats,
  recordHand,
  addSessionToHistory,
  type TrainerStats,
} from "@/lib/trainer-stats";
import { type Position, type Action, positionLabels } from "@/lib/ranges";
import { DifficultySelector, DifficultyDescription } from "@/components/trainer/difficulty-selector";
import { QuizHandDisplay } from "@/components/trainer/quiz-hand";
import { ActionButtons } from "@/components/trainer/action-buttons";
import { QuizResult } from "@/components/trainer/quiz-result";
import { SessionStatsPanel } from "@/components/trainer/session-stats";
import { SessionSummary } from "@/components/trainer/session-summary";
import { HowThisWorks } from "@/components/onboarding/how-this-works";
import { Target, Play, Brain, Trophy, Flame, ChevronDown, StopCircle } from "lucide-react";

type Phase = "setup" | "playing" | "result" | "summary";

interface SessionData {
  hands: number;
  correct: number;
  streak: number;
  bestStreak: number;
  byPosition: Record<string, { total: number; correct: number }>;
  byAction: Record<string, { total: number; correct: number }>;
  startTime: number;
}

function emptySession(): SessionData {
  return {
    hands: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    byPosition: {},
    byAction: {},
    startTime: Date.now(),
  };
}

export default function TrainerPage() {
  const { locale } = useLocale();
  const { t } = useT();
  const [phase, setPhase] = useState<Phase>("setup");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [positionFilter, setPositionFilter] = useState<Position | "all">("all");
  const [currentHand, setCurrentHand] = useState<QuizHand | null>(null);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [session, setSession] = useState<SessionData>(emptySession());
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [handKey, setHandKey] = useState(0);
  const phaseRef = useRef<Phase>("setup");
  const currentHandRef = useRef<QuizHand | null>(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    currentHandRef.current = currentHand;
  }, [currentHand]);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  const dealHand = useCallback(() => {
    const pos = positionFilter === "all" ? undefined : positionFilter;
    const hand = generateQuizHand(difficulty, pos, locale);
    setCurrentHand(hand);
    setSelectedAction(null);
    setIsCorrect(null);
    setPhase("playing");
    setHandKey((k) => k + 1);
  }, [difficulty, positionFilter, locale]);

  const handleStart = useCallback(() => {
    setSession(emptySession());
    dealHand();
  }, [dealHand]);

  const handleAction = useCallback(
    (action: Action) => {
      if (!currentHandRef.current || phaseRef.current !== "playing") return;
      const hand = currentHandRef.current;
      const correct = action === hand.correctAction;
      setSelectedAction(action);
      setIsCorrect(correct);
      setPhase("result");

      setSession((prev) => {
        const next = { ...prev };
        next.hands += 1;
        if (correct) {
          next.correct += 1;
          next.streak += 1;
          if (next.streak > next.bestStreak) next.bestStreak = next.streak;
        } else {
          next.streak = 0;
        }

        const pos = hand.position;
        const bp = { ...next.byPosition };
        if (!bp[pos]) bp[pos] = { total: 0, correct: 0 };
        bp[pos] = {
          total: bp[pos].total + 1,
          correct: bp[pos].correct + (correct ? 1 : 0),
        };
        next.byPosition = bp;

        const act = hand.correctAction;
        const ba = { ...next.byAction };
        if (!ba[act]) ba[act] = { total: 0, correct: 0 };
        ba[act] = {
          total: ba[act].total + 1,
          correct: ba[act].correct + (correct ? 1 : 0),
        };
        next.byAction = ba;

        return next;
      });

      setStats((prev) => {
        if (!prev) return prev;
        const updated = recordHand(prev, hand.position, hand.correctAction, correct);
        saveStats(updated);
        return updated;
      });
    },
    []
  );

  const handleNext = useCallback(() => {
    dealHand();
  }, [dealHand]);

  const handleEndSession = useCallback(() => {
    setPhase("summary");
    setStats((prev) => {
      if (!prev) return prev;
      const updated = addSessionToHistory(prev, session.hands, session.correct);
      saveStats(updated);
      return updated;
    });
  }, [session]);

  const handleRestart = useCallback(() => {
    setPhase("setup");
    setCurrentHand(null);
    setSelectedAction(null);
    setIsCorrect(null);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.target instanceof HTMLSelectElement) return;
      const key = e.key.toLowerCase();

      if (phaseRef.current === "playing" && currentHandRef.current) {
        const actions = getAvailableActions(currentHandRef.current.scenario);
        if (key === "r" && actions.includes("raise")) { e.preventDefault(); handleAction("raise"); }
        if (key === "f" && actions.includes("fold")) { e.preventDefault(); handleAction("fold"); }
        if (key === "c" && actions.includes("call")) { e.preventDefault(); handleAction("call"); }
        if (key === "b") {
          e.preventDefault();
          if (actions.includes("3bet")) handleAction("3bet");
          else if (actions.includes("4bet")) handleAction("4bet");
        }
      }

      if (phaseRef.current === "result" && (key === " " || key === "enter")) {
        e.preventDefault();
        handleNext();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleAction, handleNext]);

  if (phase === "setup") {
    return (
      <div className="mx-auto max-w-2xl space-y-8 animate-[fade-in_0.3s_ease-out]">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-poker-green/10 mb-1">
            <Target className="w-8 h-8 text-poker-green" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("trainer.title").split(" ")[0]} <span className="text-poker-green">{t("trainer.title").split(" ").slice(1).join(" ")}</span>
          </h1>
          <p className="text-white/40 max-w-md mx-auto">
            {t("trainer.subtitle")}
          </p>
        </div>

        <HowThisWorks
          titleKey="guide.title"
          stepsKeys={[
            "guide.trainer.step1",
            "guide.trainer.step2",
            "guide.trainer.step3",
            "guide.trainer.step4",
          ]}
          pageId="trainer"
        />

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t("trainer.difficulty")}</label>
            <DifficultySelector difficulty={difficulty} onChange={setDifficulty} />
            <DifficultyDescription difficulty={difficulty} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-white/40">{t("trainer.position")}</label>
            <div className="relative">
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value as Position | "all")}
                className="w-full appearance-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white/80 focus:border-poker-green/50 focus:outline-none focus:ring-1 focus:ring-poker-green/30"
              >
                <option value="all">{t("trainer.allPositions")}</option>
                {ALL_POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {positionLabels[pos]} — {getPositionFullName(pos, locale)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            </div>
          </div>
        </div>

        {stats && stats.totalHands > 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-yellow-400" />
              {t("trainer.allTimeStats")}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold tabular-nums">{stats.totalHands}</div>
                <p className="text-[10px] text-white/40">{t("trainer.hands")}</p>
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-xl font-bold tabular-nums",
                  stats.totalHands > 0
                    ? Math.round((stats.totalCorrect / stats.totalHands) * 100) >= 80
                      ? "text-emerald-400"
                      : "text-yellow-400"
                    : "text-white/40"
                )}>
                  {stats.totalHands > 0
                    ? `${Math.round((stats.totalCorrect / stats.totalHands) * 100)}%`
                    : "—"}
                </div>
                <p className="text-[10px] text-white/40">{t("trainer.accuracy")}</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold tabular-nums text-orange-400">
                  🔥 {stats.bestStreak}
                </div>
                <p className="text-[10px] text-white/40">{t("trainer.bestStreak")}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleStart}
          className="w-full rounded-xl bg-poker-green px-6 py-4 text-lg font-bold text-black hover:bg-emerald-400 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          {t("trainer.startTraining")}
        </button>
      </div>
    );
  }

  if (phase === "summary") {
    const duration = Math.round((Date.now() - session.startTime) / 1000);
    return (
      <SessionSummary
        hands={session.hands}
        correct={session.correct}
        bestStreak={session.bestStreak}
        duration={duration}
        byPosition={session.byPosition}
        byAction={session.byAction}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl animate-[fade-in_0.2s_ease-out]">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,260px] gap-6">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <DifficultySelector difficulty={difficulty} onChange={setDifficulty} />
              <div className="relative">
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value as Position | "all")}
                  className="appearance-none rounded-lg border border-white/[0.08] bg-white/[0.04] pl-3 pr-8 py-1.5 text-xs text-white/70 focus:border-poker-green/50 focus:outline-none"
                >
                  <option value="all">{t("trainer.allPos")}</option>
                  {ALL_POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>{positionLabels[pos]}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
              </div>
            </div>
            <button
              onClick={handleEndSession}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.08] transition-colors"
            >
              <StopCircle className="w-3.5 h-3.5" />
              {t("trainer.endSession")}
            </button>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-5">
            {currentHand && (
              <>
                <QuizHandDisplay hand={currentHand} animKey={handKey} />

                {phase === "playing" && (
                  <div className="animate-[fade-in_0.3s_ease-out_0.2s_both]">
                    <ActionButtons
                      actions={getAvailableActions(currentHand.scenario)}
                      onAction={handleAction}
                    />
                  </div>
                )}

                {phase === "result" && selectedAction && isCorrect !== null && (
                  <QuizResult
                    hand={currentHand}
                    selectedAction={selectedAction}
                    isCorrect={isCorrect}
                    onNext={handleNext}
                  />
                )}
              </>
            )}
          </div>
        </div>

        <div className="hidden lg:block">
          <SessionStatsPanel
            hands={session.hands}
            correct={session.correct}
            streak={session.streak}
            bestStreak={session.bestStreak}
            byPosition={session.byPosition}
            byAction={session.byAction}
          />
        </div>

        <div className="lg:hidden">
          {session.hands > 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {session.streak >= 5 && (
                    <span className={cn(
                      "text-lg",
                      session.streak >= 10 && "animate-[streak-fire_0.6s_ease-in-out_infinite]"
                    )}>
                      🔥
                    </span>
                  )}
                  <span className="text-sm font-bold tabular-nums">
                    {t("trainer.streak")} {session.streak}
                  </span>
                </div>
                <span className={cn(
                  "text-sm font-bold tabular-nums",
                  session.hands > 0
                    ? Math.round((session.correct / session.hands) * 100) >= 80
                      ? "text-emerald-400"
                      : Math.round((session.correct / session.hands) * 100) >= 60
                        ? "text-yellow-400"
                        : "text-red-400"
                    : "text-white/40"
                )}>
                  {session.correct}/{session.hands} ({session.hands > 0 ? Math.round((session.correct / session.hands) * 100) : 0}%)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
