"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";
import {
  Home,
  BookOpen,
  BarChart3,
  Target,
  Calculator,
  CreditCard,
  MapPin,
  Lightbulb,
  BookMarked,
  ChevronDown,
  Lock,
  Menu,
  X,
  Spade,
  GraduationCap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getCompletedCount } from "@/lib/progress";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useT();
  const [learnOpen, setLearnOpen] = useState(pathname.startsWith("/learn"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    setCompletedCount(getCompletedCount());
  }, []);

  const learnItems = [
    { href: "/learn/hand-rankings", label: t("nav.handRankings"), icon: CreditCard },
    { href: "/learn/positions", label: t("nav.positions"), icon: MapPin },
    { href: "/learn/concepts", label: t("nav.keyConcepts"), icon: Lightbulb },
    { href: "/learn/glossary", label: t("nav.glossary"), icon: BookMarked },
  ];

  const navItems = [
    { href: "/", label: t("nav.dashboard"), icon: Home },
    { href: "/tutorial", label: t("nav.tutorial"), icon: GraduationCap },
    { href: "/ranges", label: t("nav.ranges"), icon: BarChart3 },
    { href: "/trainer", label: t("nav.trainer"), icon: Target },
    { href: "/calculator", label: t("nav.calculator"), icon: Calculator },
  ];

  const isActive = (href: string) => pathname === href;
  const isLearnActive = pathname.startsWith("/learn");

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 rounded-lg border border-white/10 bg-neutral-900 p-2 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-white/[0.06] bg-neutral-950 transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-poker-green/20">
            <Spade className="h-5 w-5 text-poker-green" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">{t("nav.brand")}</h1>
            <p className="text-[11px] text-white/40">{t("nav.tagline")}</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden">
            <X className="h-5 w-5 text-white/40" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-0.5">
            <NavItem href="/" icon={Home} label={t("nav.dashboard")} active={isActive("/")} onClick={() => setMobileOpen(false)} />

            <button
              onClick={() => setLearnOpen(!learnOpen)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isLearnActive ? "bg-poker-green/10 text-poker-green" : "text-white/60 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span className="font-medium">{t("nav.learn")}</span>
              <ChevronDown className={cn("ml-auto h-3.5 w-3.5 transition-transform", learnOpen && "rotate-180")} />
            </button>

            {learnOpen && (
              <div className="ml-4 space-y-0.5 border-l border-white/[0.06] pl-3">
                {learnItems.map((item) => (
                  <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} active={isActive(item.href)} onClick={() => setMobileOpen(false)} />
                ))}
              </div>
            )}

            {navItems.slice(1).map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={isActive(item.href)}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </div>
        </nav>

        <div className="border-t border-white/[0.06] px-4 py-4 space-y-3">
          <div className="flex justify-center">
            <LanguageSwitcher />
          </div>
          <div className="rounded-lg bg-white/[0.03] px-3 py-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-white/50">
                {t("nav.progress").replace("{n}", String(completedCount))}
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-poker-green transition-all duration-500" style={{ width: `${(completedCount / 5) * 100}%` }} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  locked,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  locked?: boolean;
  onClick?: () => void;
}) {
  if (locked) {
    return (
      <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/25 cursor-not-allowed">
        <Icon className="h-4 w-4 shrink-0" />
        <span>{label}</span>
        <Lock className="ml-auto h-3 w-3" />
      </div>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        active ? "bg-poker-green/10 text-poker-green font-medium" : "text-white/60 hover:bg-white/5 hover:text-white/80"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
