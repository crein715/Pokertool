"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PotOddsCalculator } from "@/components/calculator/pot-odds-calculator";
import { EquityCalculator } from "@/components/calculator/equity-calculator";
import { OutsCounter } from "@/components/calculator/outs-counter";
import { Calculator, Scale, Target } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function CalculatorPage() {
  const { t } = useT();

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{t("calculator.title")}</h1>
        <p className="text-sm text-white/40">
          {t("calculator.subtitle")}
        </p>
      </div>

      <Tabs defaultValue="pot-odds">
        <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl">
          <TabsTrigger
            value="pot-odds"
            className="flex items-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm data-active:bg-poker-green/15 data-active:text-poker-green data-active:border-poker-green/30 data-active:shadow-none"
          >
            <Calculator className="h-4 w-4 hidden sm:block" />
            {t("calculator.potOdds")}
          </TabsTrigger>
          <TabsTrigger
            value="equity"
            className="flex items-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm data-active:bg-poker-green/15 data-active:text-poker-green data-active:border-poker-green/30 data-active:shadow-none"
          >
            <Scale className="h-4 w-4 hidden sm:block" />
            {t("calculator.equity")}
          </TabsTrigger>
          <TabsTrigger
            value="outs"
            className="flex items-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm data-active:bg-poker-green/15 data-active:text-poker-green data-active:border-poker-green/30 data-active:shadow-none"
          >
            <Target className="h-4 w-4 hidden sm:block" />
            {t("calculator.outs")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pot-odds" className="mt-6">
          <PotOddsCalculator />
        </TabsContent>

        <TabsContent value="equity" className="mt-6">
          <EquityCalculator />
        </TabsContent>

        <TabsContent value="outs" className="mt-6">
          <OutsCounter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
