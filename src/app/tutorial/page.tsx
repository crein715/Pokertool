"use client";

import { useState, useCallback, useMemo } from "react";
import { useT, useLocalizedData } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/page-header";
import { TutorialStepper } from "@/components/tutorial/tutorial-stepper";
import { LessonCard } from "@/components/tutorial/lesson-card";
import { QuizQuestion } from "@/components/tutorial/quiz-question";
import { Confetti } from "@/components/tutorial/confetti";
import { markComplete } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  Layers,
  Target,
  MapPin,
  Zap,
  BookOpen,
  BarChart3,
  Crosshair,
  Calculator,
  Trophy,
} from "lucide-react";
import type { HandRanking } from "@/lib/poker-data";
import Link from "next/link";

const TOTAL_STEPS = 5;

export default function TutorialPage() {
  const { t } = useT();
  const { handRankings } = useLocalizedData();

  const [step, setStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, boolean>>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [completed, setCompleted] = useState(false);

  const stepTitles = useMemo(
    () =>
      Array.from({ length: TOTAL_STEPS }, (_, i) =>
        t(`tutorial.step.${i + 1}.title`)
      ),
    [t]
  );

  const completedSteps = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < step; i++) set.add(i);
    if (completed) set.add(4);
    return set;
  }, [step, completed]);

  const handleQuizAnswer = useCallback(
    (key: string, correct: boolean) => {
      setQuizAnswers((prev) => ({ ...prev, [key]: correct }));
    },
    []
  );

  const isQuizAnswered = useCallback(
    (key: string) => key in quizAnswers,
    [quizAnswers]
  );

  const canProceed = useMemo(() => {
    if (step === 0) return true;
    if (step === 1) return isQuizAnswered("l2q1") && isQuizAnswered("l2q2");
    if (step === 2) return isQuizAnswered("l3q1");
    if (step === 3) return isQuizAnswered("l4q1") && isQuizAnswered("l4q2");
    if (step === 4) return true;
    return true;
  }, [step, isQuizAnswered]);

  const handleNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setCompleted(true);
      setShowConfetti(true);
      markComplete("tutorial");
    }
  }, [step]);

  const handlePrevious = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Confetti show={showConfetti} />

      <PageHeader
        icon={GraduationCap}
        title={t("tutorial.title")}
        subtitle={t("tutorial.subtitle")}
        badge={t("tutorial.badge")}
      />

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-6 animate-[slide-up_0.4s_ease-out_0.1s_both]">
        <TutorialStepper
          steps={stepTitles}
          currentStep={step}
          completedSteps={completedSteps}
        />
      </div>

      <div className="animate-[slide-up_0.4s_ease-out_0.2s_both]">
        <span className="text-xs font-medium text-white/30">
          {t("tutorial.stepOf")
            .replace("{current}", String(step + 1))
            .replace("{total}", String(TOTAL_STEPS))}
        </span>
      </div>

      {step === 0 && <Lesson1 t={t} />}
      {step === 1 && (
        <Lesson2
          t={t}
          handRankings={handRankings}
          onAnswer={handleQuizAnswer}
          isAnswered={isQuizAnswered}
        />
      )}
      {step === 2 && (
        <Lesson3
          t={t}
          onAnswer={handleQuizAnswer}
          isAnswered={isQuizAnswered}
        />
      )}
      {step === 3 && (
        <Lesson4
          t={t}
          onAnswer={handleQuizAnswer}
          isAnswered={isQuizAnswered}
        />
      )}
      {step === 4 && <Lesson5 t={t} completed={completed} />}

      <div
        className={cn(
          "flex items-center gap-3 animate-[slide-up_0.4s_ease-out_0.3s_both]",
          step > 0 ? "justify-between" : "justify-end"
        )}
      >
        {step > 0 && (
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="gap-2 border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.06]"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("tutorial.previous")}
          </Button>
        )}

        {!completed && (
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className={cn(
              "gap-2 transition-all duration-200",
              canProceed
                ? "bg-poker-green text-black hover:bg-poker-green/90"
                : "bg-white/[0.06] text-white/30 cursor-not-allowed"
            )}
          >
            {step === TOTAL_STEPS - 1 ? (
              <>
                <Sparkles className="h-4 w-4" />
                {t("tutorial.finish")}
              </>
            ) : (
              <>
                {t("tutorial.next")}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function Lesson1({ t }: { t: (k: string) => string }) {
  const stages = [
    {
      key: "preflop",
      icon: Layers,
      title: t("tutorial.lesson1.preflop"),
      desc: t("tutorial.lesson1.preflopDesc"),
    },
    {
      key: "flop",
      icon: Target,
      title: t("tutorial.lesson1.flop"),
      desc: t("tutorial.lesson1.flopDesc"),
    },
    {
      key: "turn",
      icon: Zap,
      title: t("tutorial.lesson1.turn"),
      desc: t("tutorial.lesson1.turnDesc"),
    },
    {
      key: "river",
      icon: MapPin,
      title: t("tutorial.lesson1.river"),
      desc: t("tutorial.lesson1.riverDesc"),
    },
  ];

  return (
    <LessonCard>
      <h2 className="text-xl font-bold tracking-tight mb-3">
        {t("tutorial.lesson1.heading")}
      </h2>
      <p className="text-sm text-white/60 leading-relaxed mb-6">
        {t("tutorial.lesson1.intro")}
      </p>

      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
        {t("tutorial.lesson1.flowTitle")}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {stages.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.key}
              className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-200 hover:bg-white/[0.04] animate-[slide-up_0.4s_ease-out_both]"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-poker-green/10">
                <Icon className="h-4 w-4 text-poker-green" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-lg border border-poker-green/20 bg-poker-green/5 p-4 animate-[slide-up_0.4s_ease-out_0.4s_both]">
        <div className="flex items-start gap-2">
          <Trophy className="h-4 w-4 text-poker-green shrink-0 mt-0.5" />
          <p className="text-sm text-white/60 leading-relaxed">
            {t("tutorial.lesson1.showdown")}
          </p>
        </div>
      </div>
    </LessonCard>
  );
}

interface Lesson2Props {
  t: (k: string) => string;
  handRankings: HandRanking[];
  onAnswer: (key: string, correct: boolean) => void;
  isAnswered: (key: string) => boolean;
}

function Lesson2({ t, handRankings, onAnswer, isAnswered }: Lesson2Props) {
  return (
    <LessonCard>
      <h2 className="text-xl font-bold tracking-tight mb-3">
        {t("tutorial.lesson2.heading")}
      </h2>
      <p className="text-sm text-white/60 leading-relaxed mb-6">
        {t("tutorial.lesson2.intro")}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
        {handRankings.slice(0, 10).map((h, i) => (
          <div
            key={h.name}
            className="flex flex-col items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 animate-[slide-up_0.4s_ease-out_both]"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <span className="text-xs font-bold text-poker-green">{i + 1}</span>
            <span className="text-[10px] sm:text-xs text-white/60 text-center leading-tight">
              {h.name}
            </span>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
        {t("tutorial.lesson2.quizIntro")}
      </h3>

      <div className="space-y-6">
        <QuizQuestion
          question={t("tutorial.lesson2.q1")}
          options={[
            t("tutorial.lesson2.q1.a"),
            t("tutorial.lesson2.q1.b"),
            t("tutorial.lesson2.q1.c"),
            t("tutorial.lesson2.q1.d"),
          ]}
          correctIndex={1}
          explanation={t("tutorial.lesson2.q1.explain")}
          onAnswer={(correct) => onAnswer("l2q1", correct)}
          answered={isAnswered("l2q1")}
        />
        <QuizQuestion
          question={t("tutorial.lesson2.q2")}
          options={[
            t("tutorial.lesson2.q2.a"),
            t("tutorial.lesson2.q2.b"),
            t("tutorial.lesson2.q2.c"),
            t("tutorial.lesson2.q2.d"),
          ]}
          correctIndex={2}
          explanation={t("tutorial.lesson2.q2.explain")}
          onAnswer={(correct) => onAnswer("l2q2", correct)}
          answered={isAnswered("l2q2")}
        />
      </div>
    </LessonCard>
  );
}

interface LessonQuizProps {
  t: (k: string) => string;
  onAnswer: (key: string, correct: boolean) => void;
  isAnswered: (key: string) => boolean;
}

function Lesson3({ t, onAnswer, isAnswered }: LessonQuizProps) {
  const zones = [
    {
      key: "early",
      color: "bg-poker-red/10 text-poker-red border-poker-red/20",
      title: t("tutorial.lesson3.earlyTitle"),
      desc: t("tutorial.lesson3.earlyDesc"),
    },
    {
      key: "middle",
      color: "bg-poker-yellow/10 text-poker-yellow border-poker-yellow/20",
      title: t("tutorial.lesson3.middleTitle"),
      desc: t("tutorial.lesson3.middleDesc"),
    },
    {
      key: "late",
      color: "bg-poker-green/10 text-poker-green border-poker-green/20",
      title: t("tutorial.lesson3.lateTitle"),
      desc: t("tutorial.lesson3.lateDesc"),
    },
    {
      key: "blinds",
      color: "bg-poker-blue/10 text-poker-blue border-poker-blue/20",
      title: t("tutorial.lesson3.blindsTitle"),
      desc: t("tutorial.lesson3.blindsDesc"),
    },
  ];

  return (
    <LessonCard>
      <h2 className="text-xl font-bold tracking-tight mb-3">
        {t("tutorial.lesson3.heading")}
      </h2>
      <p className="text-sm text-white/60 leading-relaxed mb-6">
        {t("tutorial.lesson3.intro")}
      </p>

      <div className="relative mb-8">
        <div className="mx-auto w-full max-w-md aspect-[2/1] rounded-[50%] border-2 border-dashed border-white/[0.1] bg-poker-green/5 flex items-center justify-center">
          <span className="text-xs font-bold uppercase tracking-wider text-poker-green/40">
            TABLE
          </span>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <PositionBadge label="BB" color="bg-poker-blue/20 text-poker-blue" />
        </div>
        <div className="absolute top-1/4 left-0 -translate-x-1/4 sm:translate-x-0">
          <PositionBadge label="SB" color="bg-poker-blue/20 text-poker-blue" />
        </div>
        <div className="absolute bottom-1/4 left-0 -translate-x-1/4 sm:translate-x-0">
          <PositionBadge label="UTG" color="bg-poker-red/20 text-poker-red" />
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <PositionBadge label="MP" color="bg-poker-yellow/20 text-poker-yellow" />
        </div>
        <div className="absolute bottom-1/4 right-0 translate-x-1/4 sm:translate-x-0">
          <PositionBadge label="CO" color="bg-poker-green/20 text-poker-green" />
        </div>
        <div className="absolute top-1/4 right-0 translate-x-1/4 sm:translate-x-0">
          <PositionBadge label="BTN" color="bg-poker-green/20 text-poker-green" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {zones.map((z, i) => (
          <div
            key={z.key}
            className={cn(
              "rounded-lg border p-4 animate-[slide-up_0.4s_ease-out_both]",
              z.color
            )}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <p className="text-sm font-semibold mb-1">{z.title}</p>
            <p className="text-xs opacity-70 leading-relaxed">{z.desc}</p>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
        {t("tutorial.lesson3.quizIntro")}
      </h3>

      <QuizQuestion
        question={t("tutorial.lesson3.q1")}
        options={[
          t("tutorial.lesson3.q1.a"),
          t("tutorial.lesson3.q1.b"),
          t("tutorial.lesson3.q1.c"),
        ]}
        correctIndex={1}
        explanation={t("tutorial.lesson3.q1.explain")}
        onAnswer={(correct) => onAnswer("l3q1", correct)}
        answered={isAnswered("l3q1")}
      />
    </LessonCard>
  );
}

function PositionBadge({ label, color }: { label: string; color: string }) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-bold",
        color
      )}
    >
      {label}
    </div>
  );
}

function Lesson4({ t, onAnswer, isAnswered }: LessonQuizProps) {
  const actions = [
    {
      key: "raise",
      icon: Zap,
      color: "text-poker-green",
      bg: "bg-poker-green/10 border-poker-green/20",
      title: t("tutorial.lesson4.raiseTitle"),
      desc: t("tutorial.lesson4.raiseDesc"),
    },
    {
      key: "call",
      icon: ArrowRight,
      color: "text-poker-blue",
      bg: "bg-poker-blue/10 border-poker-blue/20",
      title: t("tutorial.lesson4.callTitle"),
      desc: t("tutorial.lesson4.callDesc"),
    },
    {
      key: "fold",
      icon: Target,
      color: "text-poker-red",
      bg: "bg-poker-red/10 border-poker-red/20",
      title: t("tutorial.lesson4.foldTitle"),
      desc: t("tutorial.lesson4.foldDesc"),
    },
  ];

  return (
    <LessonCard>
      <h2 className="text-xl font-bold tracking-tight mb-3">
        {t("tutorial.lesson4.heading")}
      </h2>
      <p className="text-sm text-white/60 leading-relaxed mb-6">
        {t("tutorial.lesson4.intro")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <div
              key={a.key}
              className={cn(
                "rounded-lg border p-4 animate-[slide-up_0.4s_ease-out_both]",
                a.bg
              )}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn("h-4 w-4", a.color)} />
                <p className={cn("text-sm font-bold", a.color)}>{a.title}</p>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">{a.desc}</p>
            </div>
          );
        })}
      </div>

      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
        {t("tutorial.lesson4.quizIntro")}
      </h3>

      <div className="space-y-6">
        <QuizQuestion
          question={t("tutorial.lesson4.q1")}
          options={[
            t("tutorial.lesson4.q1.a"),
            t("tutorial.lesson4.q1.b"),
            t("tutorial.lesson4.q1.c"),
          ]}
          correctIndex={2}
          explanation={t("tutorial.lesson4.q1.explain")}
          onAnswer={(correct) => onAnswer("l4q1", correct)}
          answered={isAnswered("l4q1")}
        />
        <QuizQuestion
          question={t("tutorial.lesson4.q2")}
          options={[
            t("tutorial.lesson4.q2.a"),
            t("tutorial.lesson4.q2.b"),
            t("tutorial.lesson4.q2.c"),
          ]}
          correctIndex={2}
          explanation={t("tutorial.lesson4.q2.explain")}
          onAnswer={(correct) => onAnswer("l4q2", correct)}
          answered={isAnswered("l4q2")}
        />
      </div>
    </LessonCard>
  );
}

function Lesson5({
  t,
  completed,
}: {
  t: (k: string) => string;
  completed: boolean;
}) {
  const links = [
    {
      href: "/learn/hand-rankings",
      icon: BookOpen,
      title: t("tutorial.lesson5.learnTitle"),
      desc: t("tutorial.lesson5.learnDesc"),
      color: "text-poker-green",
    },
    {
      href: "/ranges",
      icon: BarChart3,
      title: t("tutorial.lesson5.rangesTitle"),
      desc: t("tutorial.lesson5.rangesDesc"),
      color: "text-poker-blue",
    },
    {
      href: "/trainer",
      icon: Crosshair,
      title: t("tutorial.lesson5.trainerTitle"),
      desc: t("tutorial.lesson5.trainerDesc"),
      color: "text-poker-yellow",
    },
    {
      href: "/calculator",
      icon: Calculator,
      title: t("tutorial.lesson5.calcTitle"),
      desc: t("tutorial.lesson5.calcDesc"),
      color: "text-poker-red",
    },
  ];

  return (
    <LessonCard>
      {completed && (
        <div className="mb-6 text-center animate-[slide-up_0.4s_ease-out_both]">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-poker-green/15 mb-3 animate-[pulse-glow_2s_ease-in-out_infinite]">
            <Trophy className="h-8 w-8 text-poker-green" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-poker-green">
            {t("tutorial.complete.title")}
          </h2>
          <p className="text-sm text-white/50 mt-1">
            {t("tutorial.complete.subtitle")}
          </p>
        </div>
      )}

      {!completed && (
        <>
          <h2 className="text-xl font-bold tracking-tight mb-3">
            {t("tutorial.lesson5.heading")}
          </h2>
          <p className="text-sm text-white/60 leading-relaxed mb-6">
            {t("tutorial.lesson5.intro")}
          </p>
        </>
      )}

      <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
        {t("tutorial.lesson5.explore")}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((l, i) => {
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className="group flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-200 hover:bg-white/[0.06] hover:border-white/[0.12] animate-[slide-up_0.4s_ease-out_both]"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] transition-colors group-hover:bg-white/[0.08]">
                <Icon className={cn("h-4 w-4", l.color)} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold group-hover:text-white transition-colors">
                  {l.title}
                </p>
                <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
                  {l.desc}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-white/20 shrink-0 mt-1 group-hover:text-white/40 transition-colors" />
            </Link>
          );
        })}
      </div>
    </LessonCard>
  );
}
