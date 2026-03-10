import { Calculator, Lock } from "lucide-react";

export default function CalculatorPage() {
  return (
    <div className="mx-auto max-w-2xl flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
        <Calculator className="h-10 w-10 text-white/20" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
          Equity Calculator
          <Lock className="h-5 w-5 text-white/20" />
        </h1>
        <p className="text-white/40 max-w-md">
          Calculate hand vs. hand equity, pot odds, and expected value. Coming in Phase 4.
        </p>
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-4 text-sm text-white/30">
        Hand vs. Hand &bull; Range vs. Range &bull; Pot odds &bull; EV calculations
      </div>
    </div>
  );
}
