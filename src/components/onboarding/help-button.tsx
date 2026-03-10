"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { HelpCircle, RotateCcw, BookMarked, CreditCard } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function HelpButton() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const replayTour = () => {
    try {
      localStorage.removeItem("poker-walkthrough-seen");
    } catch {}
    window.location.reload();
  };

  return (
    <div ref={ref} className="relative flex justify-center">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-all",
          "text-white/40 hover:text-white/70 hover:bg-white/[0.06]",
          open && "bg-white/[0.06] text-white/70"
        )}
        aria-label={t("help.title")}
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-xl border border-white/[0.08] bg-neutral-900 p-4 shadow-xl animate-[slide-up_0.2s_ease-out] z-[60]">
          <h4 className="text-sm font-semibold mb-3">{t("help.title")}</h4>

          <button
            onClick={replayTour}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-white/60 hover:bg-white/[0.04] hover:text-white/80 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-poker-green" />
            <div className="text-left">
              <div className="font-medium text-xs">{t("help.replayTour")}</div>
              <div className="text-[10px] text-white/30">{t("help.replayTourDesc")}</div>
            </div>
          </button>

          <div className="my-2.5 border-t border-white/[0.06]" />

          <p className="text-[11px] text-white/40 leading-relaxed mb-3">{t("help.aboutText")}</p>

          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-1.5">{t("help.quickLinks")}</div>
          <div className="space-y-0.5">
            <Link
              href="/learn/hand-rankings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-white/50 hover:bg-white/[0.04] hover:text-white/70 transition-colors"
            >
              <CreditCard className="h-3 w-3" />
              {t("help.linkHandRankings")}
            </Link>
            <Link
              href="/learn/glossary"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-white/50 hover:bg-white/[0.04] hover:text-white/70 transition-colors"
            >
              <BookMarked className="h-3 w-3" />
              {t("help.linkGlossary")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
