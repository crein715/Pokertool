"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  subtitle: string;
  badge?: string;
}

export function PageHeader({ icon: Icon, iconColor = "text-poker-green", title, subtitle, badge }: PageHeaderProps) {
  return (
    <div className="flex items-start gap-4 animate-[fade-in_0.4s_ease-out]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-poker-green/10">
        <Icon className={cn("h-6 w-6", iconColor)} />
      </div>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {badge && (
            <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium text-white/40">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-white/50">{subtitle}</p>
      </div>
    </div>
  );
}
