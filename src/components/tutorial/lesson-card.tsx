"use client";

import { cn } from "@/lib/utils";

interface LessonCardProps {
  children: React.ReactNode;
  className?: string;
}

export function LessonCard({ children, className }: LessonCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8 animate-[slide-up_0.4s_ease-out_both]",
        className
      )}
    >
      {children}
    </div>
  );
}
