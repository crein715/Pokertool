"use client";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import { Calculator, Target, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const { t } = useT();

  const tools = [
    { href: "/calculator", icon: Calculator, label: t("nav.calculator"), desc: t("dashboard.calc.desc"), color: "from-emerald-500/20 to-emerald-500/5" },
    { href: "/trainer", icon: Target, label: t("nav.trainer"), desc: t("dashboard.trainer.desc"), color: "from-blue-500/20 to-blue-500/5" },
    { href: "/ranges", icon: BarChart3, label: t("nav.ranges"), desc: t("dashboard.ranges.desc"), color: "from-yellow-500/20 to-yellow-500/5" },
  ];

  return (
    <div className="mx-auto max-w-lg flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-white/40 text-sm">{t("dashboard.subtitle")}</p>
      </div>
      <div className="w-full space-y-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:bg-white/[0.06] hover:border-white/[0.1] active:scale-[0.98]"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tool.color}`}>
              <tool.icon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold">{tool.label}</h2>
              <p className="text-sm text-white/40">{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
