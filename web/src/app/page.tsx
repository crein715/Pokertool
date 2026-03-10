"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { loadProgress, getCompletionPercent, type LearningProgress } from "@/lib/progress";
import {
  CreditCard,
  MapPin,
  Lightbulb,
  BookMarked,
  BarChart3,
  ArrowRight,
  Check,
  Target,
} from "lucide-react";
import { PokerTerm } from "@/components/onboarding/poker-term";

const milestones: { key: keyof LearningProgress; icon: typeof CreditCard; href: string }[] = [
  { key: "handRankings", icon: CreditCard, href: "/learn/hand-rankings" },
  { key: "positions", icon: MapPin, href: "/learn/positions" },
  { key: "concepts", icon: Lightbulb, href: "/learn/concepts" },
  { key: "ranges", icon: BarChart3, href: "/ranges" },
  { key: "trainer", icon: Target, href: "/trainer" },
];

export default function DashboardPage() {
  const { t } = useT();
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    setProgress(loadProgress());
    setPercent(getCompletionPercent());
  }, []);

  const quickActions = [
    { href: "/learn/hand-rankings", label: t("dashboard.action.handRankings"), desc: t("dashboard.action.handRankings.desc"), icon: CreditCard, color: "from-emerald-500/20 to-emerald-500/5", time: t("dashboard.timeEstimate.5min") },
    { href: "/learn/positions", label: t("dashboard.action.positions"), desc: t("dashboard.action.positions.desc"), icon: MapPin, color: "from-blue-500/20 to-blue-500/5", time: t("dashboard.timeEstimate.5min") },
    { href: "/learn/concepts", label: t("dashboard.action.keyConcepts"), desc: t("dashboard.action.keyConcepts.desc"), icon: Lightbulb, color: "from-yellow-500/20 to-yellow-500/5", time: t("dashboard.timeEstimate.10min") },
    { href: "/learn/glossary", label: t("dashboard.action.glossary"), desc: t("dashboard.action.glossary.desc"), icon: BookMarked, color: "from-purple-500/20 to-purple-500/5", time: t("dashboard.timeEstimate.5min") },
    { href: "/ranges", label: t("dashboard.action.ranges"), desc: t("dashboard.action.ranges.desc"), icon: BarChart3, color: "from-emerald-500/20 to-emerald-500/5", time: t("dashboard.timeEstimate.15min") },
  ];

  const firstIncompleteIdx = progress
    ? milestones.findIndex((m) => !progress[m.key])
    : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-8 sm:p-12 animate-[fade-in_0.5s_ease-out]">
        {/* Decorative poker chip (CSS-only) */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 opacity-[0.04]">
          <div className="h-full w-full rounded-full border-[12px] border-dashed border-white" />
        </div>
        <div className="pointer-events-none absolute -bottom-16 -left-8 h-36 w-36 opacity-[0.03]">
          <div className="h-full w-full rounded-full border-[10px] border-dashed border-white" />
        </div>

        {/* Decorative card shapes */}
        <div className="pointer-events-none absolute right-16 top-6 h-16 w-11 rotate-12 rounded-lg border border-white/[0.04] bg-white/[0.02] opacity-60" />
        <div className="pointer-events-none absolute right-24 top-8 h-16 w-11 -rotate-6 rounded-lg border border-white/[0.04] bg-white/[0.02] opacity-40" />

        <div className="relative space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            <span className="gradient-text">{t("dashboard.hero.welcome")}</span>
          </h1>
          <p className="max-w-lg text-lg text-white/50 animate-[slide-up_0.5s_ease-out_0.2s_both]">
            {t("dashboard.hero.subtitle")}
          </p>
          <div className="animate-[slide-up_0.5s_ease-out_0.3s_both]">
            <Link
              href="/learn/hand-rankings"
              className="inline-flex items-center gap-2 rounded-xl bg-poker-green px-6 py-3 font-semibold text-black transition-all hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98]"
            >
              {t("dashboard.hero.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
      <div data-walkthrough="step-3" className="space-y-5 animate-[slide-up_0.5s_ease-out_0.15s_both]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
            {t("dashboard.progress.title")}
          </h2>
          <span className="text-sm font-medium text-poker-green">
            {t("dashboard.progress.complete").replace("{n}", String(percent))}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-poker-green transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Milestones */}
        <div className="flex items-start justify-between gap-2 overflow-x-auto pb-2">
          {milestones.map((ms, i) => {
            const done = progress?.[ms.key] ?? false;
            const isCurrent = i === firstIncompleteIdx;
            const MsIcon = ms.icon;
            const labelKey = `dashboard.progress.${ms.key}` as const;

            return (
              <Link
                key={ms.key}
                href={ms.href}
                className="group flex flex-1 min-w-0 flex-col items-center gap-2 text-center"
              >
                {/* Connector line + node */}
                <div className="relative flex items-center justify-center">
                  {i > 0 && (
                    <div
                      className={`absolute right-full w-6 sm:w-10 border-t border-dashed ${
                        done ? "border-poker-green/40" : "border-white/[0.08]"
                      }`}
                    />
                  )}
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
                      done
                        ? "bg-poker-green/15 text-poker-green animate-[pulse-glow_3s_ease-in-out_infinite]"
                        : isCurrent
                        ? "bg-poker-green/10 text-poker-green ring-2 ring-poker-green/30 animate-[pulse-glow_2s_ease-in-out_infinite]"
                        : "bg-white/[0.04] text-white/25"
                    } group-hover:scale-110`}
                  >
                    {done ? <Check className="h-5 w-5" /> : <MsIcon className="h-5 w-5" />}
                  </div>
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-medium leading-tight ${
                    done ? "text-poker-green" : isCurrent ? "text-white/70" : "text-white/30"
                  }`}
                >
                  {t(labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div data-walkthrough="step-4" className="space-y-4 animate-[slide-up_0.5s_ease-out_0.25s_both]">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">{t("dashboard.quickActions")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, i) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.1] active:scale-[0.99]"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={`inline-flex rounded-xl bg-gradient-to-br ${action.color} p-3`}>
                <action.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold group-hover:text-poker-green transition-colors">{action.label}</h3>
              <p className="mt-1.5 text-sm text-white/40 leading-relaxed">{action.desc}</p>
              <span className="mt-3 inline-block text-xs text-white/25">{action.time}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
