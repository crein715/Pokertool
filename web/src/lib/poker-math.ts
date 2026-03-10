export function calculatePotOdds(pot: number, call: number): number {
  if (pot + call <= 0) return 0;
  return (call / (pot + call)) * 100;
}

export function calculateExpectedValueEdge(equity: number, potOdds: number): number {
  return equity - potOdds;
}

export function isProfitableCall(equity: number, potOdds: number): boolean {
  return equity > potOdds;
}

export function outsToEquityOneCard(outs: number, remaining: number): number {
  if (remaining <= 0) return 0;
  return (outs / remaining) * 100;
}

export function outsToEquityTwoCards(outs: number, remaining: number): number {
  if (remaining <= 1) return 0;
  const missOnce = (remaining - outs) / remaining;
  const missTwice = ((remaining - 1) - outs) / (remaining - 1);
  return (1 - missOnce * missTwice) * 100;
}

export function ruleOf2(outs: number): number {
  return outs * 2;
}

export function ruleOf4(outs: number): number {
  return outs * 4;
}
