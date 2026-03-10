"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import { CreditCard, MapPin, Lightbulb, BookMarked, BarChart3, Target, Calculator, TrendingUp, Brain, BookOpen } from "lucide-react";

export default function DashboardPage() {
  const { t } = useT();

  const quickActions = [
    { href: "/learn/hand-rankings", label: t("dashboard.action.handRankings"), desc: t("dashboard.action.handRankings.desc"), icon: CreditCard, color: "from-emerald-500/20 to-emerald-500/5" },
    { href: "/learn/positions", label: t("dashboard.action.positions"), desc: t("dashboard.action.positions.desc"), icon: MapPin, color: "from-blue-500/20 to-blue-500/5" },
    { href: "/learn/concepts", label: t("dashboard.action.keyConcepts"), desc: t("dashboard.action.keyConcepts.desc"), icon: Lightbulb, color: "from-yellow-500/20 to-yellow-500/5" },
    { href: "/learn/glossary", label: t("dashboard.action.glossary"), desc: t("dashboard.action.glossary.desc"), icon: BookMarked, color: "from-purple-500/20 to-purple-500/5" },
    { href: "/ranges", label: t("dashboard.action.ranges"), desc: t("dashboard.action.ranges.desc"), icon: BarChart3, color: "from-emerald-500/20 to-emerald-500/5" },
  ];

  const stats = [
    { label: t("dashboard.lessonsCompleted"), value: "0 / 4", icon: BookOpen, accent: "text-emerald-400" },
    { label: t("dashboard.quizAccuracy"), value: "—", icon: Brain, accent: "text-blue-400" },
    { label: t("dashboard.handsReviewed"), value: "0", icon: TrendingUp, accent: "text-yellow-400" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Poker<span className="text-poker-green">Trainer</span>
        </h1>
        <p className="text-lg text-white/50">{t("dashboard.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center gap-3">
              <stat.icon className={`h-5 w-5 ${stat.accent}`} />
              <span className="text-sm text-white/40">{stat.label}</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">{t("dashboard.quickActions")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-xl border border-white/[0.06] bg-gradient-to-br p-5 transition-all hover:border-poker-green/30 hover:poker-glow"
            >
              <div className={`inline-flex rounded-lg bg-gradient-to-br ${action.color} p-2.5`}>
                <action.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-semibold group-hover:text-poker-green transition-colors">{action.label}</h3>
              <p className="mt-1 text-sm text-white/40">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-poker-green/5 to-transparent p-6">
        <h3 className="font-semibold text-poker-green">{t("dashboard.gettingStarted")}</h3>
        <p
          className="mt-2 text-sm text-white/50 leading-relaxed [&_strong]:text-white/70"
          dangerouslySetInnerHTML={{ __html: t("dashboard.gettingStartedText") }}
        />
      </div>
    </div>
  );
}
