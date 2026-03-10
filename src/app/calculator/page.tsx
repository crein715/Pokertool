"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PotOddsCalculator } from "@/components/calculator/pot-odds-calculator";
import { EquityCalculator } from "@/components/calculator/equity-calculator";
import { OutsCounter } from "@/components/calculator/outs-counter";
import { Calculator, Scale, Target } from "lucide-react";
import { useT } from "@/lib/i18n";
import { PageHeader } from "@/components/layout/page-header";

export default function CalculatorPage() {
  const { t } = useT();

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <PageHeader
        icon={Calculator}
        title={t("calculator.title")}
        subtitle={t("calculator.subtitle")}
      />

      <Tabs defaultValue="pot-odds">
        <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl transition-all duration-200 sticky top-0 z-10 backdrop-blur-md bg-[#0a0a0a]/90">
          <TabsTrigger
            value="pot-odds"
            className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 py-2.5 rounded-xl text-[9px] sm:text-sm data-active:bg-poker-green/15 data-active:text-poker-green data-active:border-poker-green/30 data-active:shadow-none transition-all duration-200"
          >
            <Calculator className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="sm:inline">{t("calculator.potOdds")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="equity"
            className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 py-2.5 rounded-xl text-[9px] sm:text-sm data-active:bg-poker-green/15 data-active:text-poker-green data-active:border-poker-green/30 data-active:shadow-none transition-all duration-200"
          >
            <Scale className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="sm:inline">{t("calculator.equity")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="outs"
            className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 py-2.5 rounded-xl text-[9px] sm:text-sm data-active:bg-poker-green/15 data-active:text-poker-green data-active:border-poker-green/30 data-active:shadow-none transition-all duration-200"
          >
            <Target className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="sm:inline">{t("calculator.outs")}</span>
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
