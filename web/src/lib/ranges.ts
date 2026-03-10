export type Position = "utg" | "mp" | "co" | "btn" | "sb" | "bb";
export type Scenario = "rfi" | "vs_raise" | "vs_3bet";
export type Action = "raise" | "call" | "fold" | "3bet" | "4bet";

export const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"] as const;

export const actionColors: Record<Action, string> = {
  raise: "#22c55e",
  call: "#eab308",
  fold: "transparent",
  "3bet": "#3b82f6",
  "4bet": "#8b5cf6",
};

export const actionLabels: Record<Action, string> = {
  raise: "Raise / Open",
  call: "Call",
  fold: "Fold",
  "3bet": "3-Bet",
  "4bet": "4-Bet",
};

export function getHandLabel(row: number, col: number): string {
  const r1 = RANKS[row];
  const r2 = RANKS[col];
  if (row === col) return `${r1}${r2}`;
  if (row < col) return `${r1}${r2}s`;
  return `${r2}${r1}o`;
}

export function getHandType(row: number, col: number): "pair" | "suited" | "offsuit" {
  if (row === col) return "pair";
  if (row < col) return "suited";
  return "offsuit";
}

function parseHands(spec: string): Set<string> {
  const hands = new Set<string>();
  const parts = spec.split(",").map((s) => s.trim());
  for (const part of parts) {
    const rangeMatch = part.match(/^([AKQJT2-9]{2}[so]?)-([AKQJT2-9]{2}[so]?)$/);
    if (rangeMatch) {
      const [, start, end] = rangeMatch;
      const suffix = start.length === 3 ? start[2] : "";
      const r1 = start[0];
      const startR2 = start[1];
      const endR2 = end[1];

      if (r1 === startR2 && suffix === "") {
        const startIdx = RANKS.indexOf(r1 as (typeof RANKS)[number]);
        const endIdx = RANKS.indexOf(endR2 as (typeof RANKS)[number]);
        for (let i = startIdx; i <= endIdx; i++) {
          hands.add(`${RANKS[i]}${RANKS[i]}`);
        }
      } else {
        const startIdx = RANKS.indexOf(startR2 as (typeof RANKS)[number]);
        const endIdx = RANKS.indexOf(endR2 as (typeof RANKS)[number]);
        for (let i = startIdx; i <= endIdx; i++) {
          hands.add(`${r1}${RANKS[i]}${suffix}`);
        }
      }
    } else {
      hands.add(part);
    }
  }
  return hands;
}

interface RangeSpec {
  raise?: string;
  call?: string;
  "3bet"?: string;
  "4bet"?: string;
}

function buildRange(specs: RangeSpec): Map<string, Action> {
  const range = new Map<string, Action>();
  if (specs["4bet"]) {
    for (const h of parseHands(specs["4bet"])) range.set(h, "4bet");
  }
  if (specs["3bet"]) {
    for (const h of parseHands(specs["3bet"])) range.set(h, "3bet");
  }
  if (specs.call) {
    for (const h of parseHands(specs.call)) range.set(h, "call");
  }
  if (specs.raise) {
    for (const h of parseHands(specs.raise)) range.set(h, "raise");
  }
  return range;
}

const rfiRanges: Record<Position, Map<string, Action>> = {
  utg: buildRange({ raise: "AA-77, AKs-ATs, KQs, AKo-AJo" }),
  mp: buildRange({ raise: "AA-66, AKs-A8s, KQs-KTs, QJs-QTs, JTs, AKo-ATo, KQo" }),
  co: buildRange({ raise: "AA-44, AKs-A2s, KQs-K8s, QJs-Q9s, JTs-J9s, T9s, 98s, 87s, AKo-A9o, KQo-KTo, QJo" }),
  btn: buildRange({ raise: "AA-22, AKs-A2s, KQs-K5s, QJs-Q7s, JTs-J8s, T9s-T8s, 98s-97s, 87s-86s, 76s-75s, 65s, 54s, AKo-A7o, KQo-K9o, QJo-QTo, JTo" }),
  sb: buildRange({ raise: "AA-55, AKs-A2s, KQs-K7s, QJs-Q9s, JTs-J9s, T9s, 98s, 87s, 76s, 65s, AKo-A8o, KQo-KTo, QJo" }),
  bb: buildRange({ raise: "AA-22, AKs-A2s, KQs-K9s, QJs-Q9s, JTs-J9s, T9s-T8s, 98s-97s, 87s, 76s, 65s, AKo-ATo, KQo-KJo, QJo" }),
};

const vsRaiseRanges: Record<Position, Map<string, Action>> = {
  utg: buildRange({ "3bet": "AA-QQ, AKs, AKo", call: "JJ-TT, AQs" }),
  mp: buildRange({ "3bet": "AA-QQ, AKs, AKo", call: "JJ-88, AQs-AJs, KQs" }),
  co: buildRange({ "3bet": "AA-JJ, AKs-AQs, AKo", call: "TT-66, AJs-ATs, KQs-KJs, QJs" }),
  btn: buildRange({ "3bet": "AA-TT, AKs-AQs, AKo", call: "99-44, AJs-A9s, KQs-KTs, QJs-QTs, JTs, T9s, 98s, 87s" }),
  sb: buildRange({ "3bet": "AA-QQ, AKs, AKo, A5s-A4s, 76s, 65s", call: "JJ-22, AQs-A2s, KQs-K9s, QJs-Q9s, JTs-J9s, T9s-T8s, 98s-97s, 87s, 76s, 65s, AQo-ATo, KQo-KJo, QJo" }),
  bb: buildRange({ "3bet": "AA-QQ, AKs, AKo, A5s-A4s, 76s, 65s", call: "JJ-22, AQs-A2s, KQs-K9s, QJs-Q9s, JTs-J9s, T9s-T8s, 98s-97s, 87s, 76s, 65s, AQo-ATo, KQo-KJo, QJo" }),
};

const vs3BetRange = buildRange({ "4bet": "AA-QQ, AKs, AKo", call: "JJ-TT, AQs, AJs" });

const vs3BetRanges: Record<Position, Map<string, Action>> = {
  utg: vs3BetRange,
  mp: vs3BetRange,
  co: vs3BetRange,
  btn: vs3BetRange,
  sb: vs3BetRange,
  bb: vs3BetRange,
};

export const allRanges: Record<Scenario, Record<Position, Map<string, Action>>> = {
  rfi: rfiRanges,
  vs_raise: vsRaiseRanges,
  vs_3bet: vs3BetRanges,
};

export function getAction(scenario: Scenario, position: Position, hand: string): Action {
  const range = allRanges[scenario][position];
  return range.get(hand) || "fold";
}

export function getRangeStats(scenario: Scenario, position: Position): { count: number; total: number; percent: number } {
  const range = allRanges[scenario][position];
  const total = 169;
  let count = 0;
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      const label = getHandLabel(r, c);
      const action = range.get(label) || "fold";
      if (action !== "fold") count++;
    }
  }
  return { count, total, percent: Math.round((count / total) * 100) };
}

export const positionLabels: Record<Position, string> = {
  utg: "UTG",
  mp: "MP",
  co: "CO",
  btn: "BTN",
  sb: "SB",
  bb: "BB",
};

export const scenarioLabels: Record<Scenario, string> = {
  rfi: "RFI (Raise First In)",
  vs_raise: "vs Raise",
  vs_3bet: "vs 3-Bet",
};
