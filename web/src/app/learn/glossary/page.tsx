"use client";

import { useState, useMemo } from "react";
import { useT, useLocalizedData } from "@/lib/i18n";
import { Search } from "lucide-react";

export default function GlossaryPage() {
  const { t } = useT();
  const { glossaryTerms } = useLocalizedData();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return glossaryTerms;
    const q = search.toLowerCase();
    return glossaryTerms.filter(
      (t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
    );
  }, [search, glossaryTerms]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    for (const term of filtered) {
      const letter = term.term[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(term);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("glossary.title")}</h1>
        <p className="text-white/50">{t("glossary.subtitle").replace("{count}", String(glossaryTerms.length))}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder={t("glossary.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-10 pr-4 text-sm placeholder:text-white/30 focus:border-poker-green/30 focus:outline-none focus:ring-1 focus:ring-poker-green/30"
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-white/30 py-8">{t("glossary.noMatch").replace("{query}", search)}</p>
      )}

      <div className="space-y-6">
        {grouped.map(([letter, terms]) => (
          <div key={letter}>
            <div className="sticky top-0 z-10 mb-2 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-poker-green/10 text-sm font-bold text-poker-green">
                {letter}
              </span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </div>
            <div className="space-y-2">
              {terms.map((term) => (
                <div key={term.term} className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-4 py-3">
                  <h3 className="font-semibold text-poker-green">{term.term}</h3>
                  <p className="mt-1 text-sm text-white/50 leading-relaxed">{term.definition}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
