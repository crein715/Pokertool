"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface StepConfig {
  selector: string;
  titleKey: string;
  descKey: string;
}

const STEPS: StepConfig[] = [
  { selector: '[data-walkthrough="step-1"]', titleKey: "walkthrough.step1.title", descKey: "walkthrough.step1.desc" },
  { selector: '[data-walkthrough="step-2"]', titleKey: "walkthrough.step2.title", descKey: "walkthrough.step2.desc" },
  { selector: '[data-walkthrough="step-3"]', titleKey: "walkthrough.step3.title", descKey: "walkthrough.step3.desc" },
  { selector: '[data-walkthrough="step-4"]', titleKey: "walkthrough.step4.title", descKey: "walkthrough.step4.desc" },
  { selector: '[data-walkthrough="step-5"]', titleKey: "walkthrough.step5.title", descKey: "walkthrough.step5.desc" },
];

const LS_KEY = "poker-walkthrough-seen";

export function SpotlightWalkthrough() {
  const { t } = useT();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(LS_KEY)) return;
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    } catch {
      return;
    }
  }, []);

  const measureTarget = useCallback((idx: number) => {
    const el = document.querySelector(STEPS[idx].selector);
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    measureTarget(step);
    const onResize = () => measureTarget(step);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [visible, step, measureTarget]);

  const close = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(LS_KEY, "1");
    } catch {}
  }, []);

  const next = useCallback(() => {
    if (step >= STEPS.length - 1) {
      close();
    } else {
      setStep((s) => s + 1);
    }
  }, [step, close]);

  if (!visible || !rect) return null;

  const pad = 8;
  const spotTop = rect.top - pad;
  const spotLeft = rect.left - pad;
  const spotW = rect.width + pad * 2;
  const spotH = rect.height + pad * 2;

  const tooltipBelow = spotTop < window.innerHeight / 2;
  const tooltipStyle: React.CSSProperties = {
    position: "fixed",
    left: Math.max(16, Math.min(spotLeft, window.innerWidth - 340)),
    ...(tooltipBelow
      ? { top: spotTop + spotH + 16 }
      : { top: spotTop - 16, transform: "translateY(-100%)" }),
    zIndex: 102,
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[100] animate-[fade-in_0.3s_ease-out]">
      <div className="fixed inset-0 bg-black/70" style={{ zIndex: 100 }} onClick={close} />

      <div
        className="fixed rounded-xl transition-all duration-300 ease-out"
        style={{
          top: spotTop,
          left: spotLeft,
          width: spotW,
          height: spotH,
          zIndex: 101,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.75)",
          pointerEvents: "none",
        }}
      />

      <div
        className="w-80 rounded-xl border border-poker-green/30 bg-neutral-900 p-5 shadow-2xl animate-[slide-up_0.3s_ease-out]"
        style={tooltipStyle}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium text-poker-green">
            {t("walkthrough.stepOf")
              .replace("{current}", String(step + 1))
              .replace("{total}", String(STEPS.length))}
          </span>
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-colors",
                  i === step ? "bg-poker-green" : i < step ? "bg-poker-green/40" : "bg-white/10"
                )}
              />
            ))}
          </div>
        </div>

        <h3 className="text-base font-bold">{t(STEPS[step].titleKey)}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-white/60">{t(STEPS[step].descKey)}</p>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={close}
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            {t("walkthrough.skip")}
          </button>
          <button
            onClick={next}
            className="rounded-lg bg-poker-green px-4 py-1.5 text-sm font-semibold text-black transition-all hover:bg-emerald-400 active:scale-95"
          >
            {step >= STEPS.length - 1 ? t("walkthrough.done") : t("walkthrough.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
