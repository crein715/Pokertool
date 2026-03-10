import type { Suit, Rank, Card } from "@/lib/poker-data";
import {
  type Position,
  type Scenario,
  type Action,
  getAction,
  getHandLabel,
  RANKS,
  allRanges,
  positionLabels,
} from "@/lib/ranges";

export type Difficulty = "easy" | "medium" | "hard";

export interface QuizHand {
  card1: Card;
  card2: Card;
  handNotation: string;
  handDescription: string;
  position: Position;
  scenario: Scenario;
  scenarioText: string;
  raiserPosition?: string;
  correctAction: Action;
  explanation: string;
}

const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
const ALL_POSITIONS: Position[] = ["utg", "mp", "co", "btn", "sb", "bb"];

const rankNames: Record<string, string> = {
  A: "Ace", K: "King", Q: "Queen", J: "Jack", T: "Ten",
  "9": "Nine", "8": "Eight", "7": "Seven", "6": "Six",
  "5": "Five", "4": "Four", "3": "Three", "2": "Two",
};

const positionNotes: Record<Position, string> = {
  utg: "Early position requires tight play — only premium hands.",
  mp: "Middle position allows slightly wider opens.",
  co: "Cutoff is a strong position — open wider.",
  btn: "Button is the best seat — play the widest range.",
  sb: "Small blind plays OOP postflop — be selective.",
  bb: "Big blind already has money in — defend with a wide range.",
};

export const positionFullNames: Record<Position, string> = {
  utg: "Under the Gun",
  mp: "Middle Position",
  co: "Cutoff",
  btn: "Button",
  sb: "Small Blind",
  bb: "Big Blind",
};

const raiserCandidates: Record<Position, Position[]> = {
  utg: [],
  mp: ["utg"],
  co: ["utg", "mp"],
  btn: ["utg", "mp", "co"],
  sb: ["utg", "mp", "co", "btn"],
  bb: ["utg", "mp", "co", "btn", "sb"],
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cardsToNotation(c1: Card, c2: Card): string {
  const r1 = RANKS.indexOf(c1.rank);
  const r2 = RANKS.indexOf(c2.rank);
  const [high, low] = r1 <= r2 ? [c1, c2] : [c2, c1];
  if (high.rank === low.rank) return `${high.rank}${low.rank}`;
  return high.suit === low.suit
    ? `${high.rank}${low.rank}s`
    : `${high.rank}${low.rank}o`;
}

function handDescription(notation: string): string {
  const r1 = rankNames[notation[0]] || notation[0];
  const r2 = rankNames[notation[1]] || notation[1];
  if (notation.length === 2) return `Pocket ${r1}s`;
  const type = notation[2] === "s" ? "suited" : "offsuit";
  return `${r1}-${r2} ${type}`;
}

function buildEasyPool(): { raises: string[]; folds: string[] } {
  const raises: string[] = [];
  const utgRange = allRanges.rfi.utg;
  utgRange.forEach((action, hand) => {
    if (action === "raise") raises.push(hand);
  });

  const anyPlayable = new Set<string>();
  for (const pos of ALL_POSITIONS) {
    allRanges.rfi[pos].forEach((_a, hand) => anyPlayable.add(hand));
  }
  const folds: string[] = [];
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      const label = getHandLabel(r, c);
      if (!anyPlayable.has(label)) folds.push(label);
    }
  }
  return { raises, folds };
}

function dealCardsFor(notation: string): { card1: Card; card2: Card } {
  const r1 = notation[0] as Rank;
  const r2 = notation[1] as Rank;
  const suits = shuffle(SUITS);
  if (notation.length === 2) {
    return { card1: { rank: r1, suit: suits[0] }, card2: { rank: r2, suit: suits[1] } };
  }
  if (notation[2] === "s") {
    return { card1: { rank: r1, suit: suits[0] }, card2: { rank: r2, suit: suits[0] } };
  }
  return { card1: { rank: r1, suit: suits[0] }, card2: { rank: r2, suit: suits[1] } };
}

function pickScenario(
  difficulty: Difficulty,
  position: Position
): { scenario: Scenario; raiserPos?: string } {
  if (difficulty !== "hard") return { scenario: "rfi" };
  const options: Scenario[] = ["rfi"];
  if (raiserCandidates[position].length > 0) options.push("vs_raise");
  options.push("vs_3bet");
  const scenario = options[Math.floor(Math.random() * options.length)];
  let raiserPos: string | undefined;
  if (scenario === "vs_raise") {
    const candidates = raiserCandidates[position];
    raiserPos = positionLabels[candidates[Math.floor(Math.random() * candidates.length)]];
  }
  return { scenario, raiserPos };
}

function scenarioText(scenario: Scenario, raiserPos?: string): string {
  if (scenario === "rfi") return "No one has raised. What do you do?";
  if (scenario === "vs_raise")
    return `${raiserPos || "Earlier position"} raised to 2.5BB. What do you do?`;
  return "You raised and got 3-bet. What do you do?";
}

function buildExplanation(
  hand: string,
  position: Position,
  action: Action,
  scenario: Scenario
): string {
  const pos = positionLabels[position];
  const note = positionNotes[position];
  switch (action) {
    case "raise":
      return `${hand} is in your ${pos} opening range. ${note}`;
    case "call":
      return scenario === "vs_raise"
        ? `${hand} is playable but not strong enough to 3-bet from ${pos}. Call to see a flop.`
        : `${hand} is playable but not strong enough to 4-bet from ${pos}. Call to see a flop.`;
    case "fold":
      return scenario === "rfi"
        ? `${hand} is too weak to open from ${pos}. Save chips for better spots. ${note}`
        : `${hand} is too weak to continue from ${pos} against this raise. Fold and wait for a better spot.`;
    case "3bet":
      return `${hand} is strong enough to 3-bet from ${pos} against this raise. ${note}`;
    case "4bet":
      return `${hand} is strong enough to 4-bet from ${pos}. Premium holding — re-raise for value.`;
  }
}

export function generateQuizHand(
  difficulty: Difficulty,
  positionFilter?: Position
): QuizHand {
  const position =
    positionFilter || ALL_POSITIONS[Math.floor(Math.random() * ALL_POSITIONS.length)];
  const { scenario, raiserPos } = pickScenario(difficulty, position);

  let notation: string;
  let card1: Card;
  let card2: Card;

  if (difficulty === "easy") {
    const pool = buildEasyPool();
    const all = [...pool.raises, ...pool.folds];
    notation = all[Math.floor(Math.random() * all.length)];
    ({ card1, card2 } = dealCardsFor(notation));
  } else {
    const deck: Card[] = [];
    for (const rank of RANKS)
      for (const suit of SUITS) deck.push({ rank, suit });
    const shuffled = shuffle(deck);
    const rawC1 = shuffled[0];
    const rawC2 = shuffled[1];
    notation = cardsToNotation(rawC1, rawC2);
    const i1 = RANKS.indexOf(rawC1.rank);
    const i2 = RANKS.indexOf(rawC2.rank);
    [card1, card2] = i1 <= i2 ? [rawC1, rawC2] : [rawC2, rawC1];
  }

  const correctAction = getAction(scenario, position, notation);

  return {
    card1,
    card2,
    handNotation: notation,
    handDescription: handDescription(notation),
    position,
    scenario,
    scenarioText: scenarioText(scenario, raiserPos),
    raiserPosition: raiserPos,
    correctAction,
    explanation: buildExplanation(notation, position, correctAction, scenario),
  };
}

export function getAvailableActions(scenario: Scenario): Action[] {
  switch (scenario) {
    case "rfi":
      return ["raise", "fold"];
    case "vs_raise":
      return ["3bet", "call", "fold"];
    case "vs_3bet":
      return ["4bet", "call", "fold"];
  }
}

export function formatAction(action: Action): string {
  const map: Record<Action, string> = {
    raise: "RAISE", call: "CALL", fold: "FOLD",
    "3bet": "3-BET", "4bet": "4-BET",
  };
  return map[action];
}

export { ALL_POSITIONS };
