"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { Locale } from "./types";
import { ui as enUi, handRankings as enHR, positions as enPos, concepts as enCon, glossaryTerms as enGloss } from "./en";
import { ui as ukUi, handRankings as ukHR, positions as ukPos, concepts as ukCon, glossaryTerms as ukGloss } from "./uk";

const dictionaries: Record<Locale, Record<string, string>> = { en: enUi, uk: ukUi };

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({ locale: "en", setLocale: () => {} });

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem("locale");
    if (stored === "en" || stored === "uk") {
      setLocaleState(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
    document.documentElement.lang = l;
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useT() {
  const { locale } = useLocale();
  const dict = dictionaries[locale];
  const t = useCallback((key: string) => dict[key] ?? key, [dict]);
  return { t };
}

export function useLocalizedData() {
  const { locale } = useLocale();
  return useMemo(() => {
    if (locale === "uk") {
      return { handRankings: ukHR, positions: ukPos, concepts: ukCon, glossaryTerms: ukGloss };
    }
    return { handRankings: enHR, positions: enPos, concepts: enCon, glossaryTerms: enGloss };
  }, [locale]);
}
