"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";
import {
  BarChart3,
  Target,
  Calculator,
  Spade,
  X,
} from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useT();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/calculator", label: t("nav.calculator"), icon: Calculator },
    { href: "/trainer", label: t("nav.trainer"), icon: Target },
    { href: "/ranges", label: t("nav.ranges"), icon: BarChart3 },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-white/[0.06] bg-neutral-950 transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Link href="/" className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-5">
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
        </Link>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-0.5">
            {navItems.map((item) => (
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

        <div className="border-t border-white/[0.06] px-4 py-4">
          <div className="flex justify-center">
            <LanguageSwitcher />
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
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
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
