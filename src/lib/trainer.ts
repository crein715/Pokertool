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
import type { Locale } from "@/lib/i18n/types";
import { ui as enUi } from "@/lib/i18n/en";
import { ui as ukUi } from "@/lib/i18n/uk";

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

function tl(locale: Locale, key: string): string {
  const dict = locale === "uk" ? ukUi : enUi;
  return dict[key] ?? key;
}

function getRankName(rank: string, locale: Locale): string {
  return tl(locale, `trainer.rankName.${rank}`);
}

function getPosNote(pos: Position, locale: Locale): string {
  return tl(locale, `trainer.posNote.${pos}`);
}

export function getPositionFullName(pos: Position, locale: Locale = "en"): string {
  return tl(locale, `trainer.posFullName.${pos}`);
}

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

function handDescription(notation: string, locale: Locale): string {
  const r1 = getRankName(notation[0], locale);
  const r2 = getRankName(notation[1], locale);
  if (notation.length === 2) {
    return tl(locale, "trainer.hand.pocket").replace("{rank}", r1);
  }
  if (notation[2] === "s") {
    return tl(locale, "trainer.hand.suited").replace("{r1}", r1).replace("{r2}", r2);
  }
  return tl(locale, "trainer.hand.offsuit").replace("{r1}", r1).replace("{r2}", r2);
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

function scenarioText(scenario: Scenario, locale: Locale, raiserPos?: string): string {
  if (scenario === "rfi") return tl(locale, "trainer.scenario.rfi");
  if (scenario === "vs_raise") {
    const raiser = raiserPos || tl(locale, "trainer.scenario.vs_raise.default");
    return tl(locale, "trainer.scenario.vs_raise").replace("{raiser}", raiser);
  }
  return tl(locale, "trainer.scenario.vs_3bet");
}

function buildExplanation(
  hand: string,
  position: Position,
  action: Action,
  scenario: Scenario,
  locale: Locale
): string {
  const pos = positionLabels[position];
  const note = getPosNote(position, locale);
  switch (action) {
    case "raise":
      return tl(locale, "trainer.explain.raise").replace("{hand}", hand).replace("{pos}", pos).replace("{note}", note);
    case "call":
      if (scenario === "vs_raise") {
        return tl(locale, "trainer.explain.call.vs_raise").replace("{hand}", hand).replace("{pos}", pos);
      }
      return tl(locale, "trainer.explain.call.vs_3bet").replace("{hand}", hand).replace("{pos}", pos);
    case "fold":
      if (scenario === "rfi") {
        return tl(locale, "trainer.explain.fold.rfi").replace("{hand}", hand).replace("{pos}", pos).replace("{note}", note);
      }
      return tl(locale, "trainer.explain.fold.faced").replace("{hand}", hand).replace("{pos}", pos);
    case "3bet":
      return tl(locale, "trainer.explain.3bet").replace("{hand}", hand).replace("{pos}", pos).replace("{note}", note);
    case "4bet":
      return tl(locale, "trainer.explain.4bet").replace("{hand}", hand).replace("{pos}", pos);
  }
}

export function generateQuizHand(
  difficulty: Difficulty,
  positionFilter?: Position,
  locale: Locale = "en"
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
    handDescription: handDescription(notation, locale),
    position,
    scenario,
    scenarioText: scenarioText(scenario, locale, raiserPos),
    raiserPosition: raiserPos,
    correctAction,
    explanation: buildExplanation(notation, position, correctAction, scenario, locale),
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

export function formatAction(action: Action, locale: Locale = "en"): string {
  return tl(locale, `trainer.action.${action}`);
}

export { ALL_POSITIONS };
