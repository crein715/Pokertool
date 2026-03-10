"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, Target, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useT();

  const items = [
    { href: "/calculator", icon: Calculator, label: t("nav.calculator") },
    { href: "/trainer", icon: Target, label: t("nav.trainer") },
    { href: "/ranges", icon: BarChart3, label: t("nav.ranges") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/[0.06] bg-neutral-950/95 backdrop-blur-sm px-2 py-2 lg:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-4 py-1.5 transition-colors",
              active ? "text-poker-green" : "text-white/40"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
