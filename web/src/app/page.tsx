import Link from "next/link";
import { CreditCard, MapPin, Lightbulb, BookMarked, BarChart3, Target, Calculator, TrendingUp, Brain, BookOpen } from "lucide-react";

const quickActions = [
  { href: "/learn/hand-rankings", label: "Hand Rankings", desc: "Learn all 10 poker hands", icon: CreditCard, color: "from-emerald-500/20 to-emerald-500/5" },
  { href: "/learn/positions", label: "Positions", desc: "Master table position play", icon: MapPin, color: "from-blue-500/20 to-blue-500/5" },
  { href: "/learn/concepts", label: "Key Concepts", desc: "Core poker strategy", icon: Lightbulb, color: "from-yellow-500/20 to-yellow-500/5" },
  { href: "/learn/glossary", label: "Glossary", desc: "Poker terminology A-Z", icon: BookMarked, color: "from-purple-500/20 to-purple-500/5" },
  { href: "/ranges", label: "Preflop Ranges", desc: "Position-based opening ranges", icon: BarChart3, color: "from-emerald-500/20 to-emerald-500/5" },
];

const stats = [
  { label: "Lessons Completed", value: "0 / 4", icon: BookOpen, accent: "text-emerald-400" },
  { label: "Quiz Accuracy", value: "—", icon: Brain, accent: "text-blue-400" },
  { label: "Hands Reviewed", value: "0", icon: TrendingUp, accent: "text-yellow-400" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Poker<span className="text-poker-green">Trainer</span>
        </h1>
        <p className="text-lg text-white/50">Learn poker from zero to hero</p>
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
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-xl border border-white/[0.06] bg-gradient-to-br p-5 transition-all hover:border-poker-green/30 hover:poker-glow"
              style={{}}
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
        <h3 className="font-semibold text-poker-green">Getting Started</h3>
        <p className="mt-2 text-sm text-white/50 leading-relaxed">
          Start with <strong className="text-white/70">Hand Rankings</strong> to learn what beats what.
          Then move to <strong className="text-white/70">Positions</strong> to understand where you sit at the table.
          Study <strong className="text-white/70">Key Concepts</strong> for foundational strategy, and use the{" "}
          <strong className="text-white/70">Glossary</strong> whenever you hit an unfamiliar term.
          Finally, dive into <strong className="text-white/70">Preflop Ranges</strong> to learn which hands to play from each position.
        </p>
      </div>
    </div>
  );
}
