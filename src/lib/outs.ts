import type { Card, Rank, Suit } from "./poker-data";
import { rankValue, evaluateHand, compareHands, RANK_VALUES } from "./hand-evaluator";

export interface DrawInfo {
  name: string;
  outs: Card[];
  description: string;
  color: string;
}

export interface OutsResult {
  draws: DrawInfo[];
  totalOuts: Card[];
  totalOutCount: number;
}

const ALL_SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
const ALL_RANKS: Rank[] = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

function cardKey(c: Card): string {
  return `${c.rank}${c.suit}`;
}

function buildRemainingDeck(used: Card[]): Card[] {
  const usedKeys = new Set(used.map(cardKey));
  const deck: Card[] = [];
  for (const suit of ALL_SUITS)
    for (const rank of ALL_RANKS)
      if (!usedKeys.has(`${rank}${suit}`)) deck.push({ rank, suit });
  return deck;
}

function getSuitCounts(cards: Card[]): Map<Suit, Card[]> {
  const map = new Map<Suit, Card[]>();
  for (const c of cards) {
    if (!map.has(c.suit)) map.set(c.suit, []);
    map.get(c.suit)!.push(c);
  }
  return map;
}

function getSortedValues(cards: Card[]): number[] {
  return cards.map((c) => rankValue(c.rank)).sort((a, b) => a - b);
}

function detectFlushDraw(hand: Card[], board: Card[], remaining: Card[]): DrawInfo | null {
  const all = [...hand, ...board];
  const suitCounts = getSuitCounts(all);

  for (const [suit, cards] of suitCounts) {
    if (cards.length === 4) {
      const outs = remaining.filter((c) => c.suit === suit);
      return {
        name: "Flush Draw",
        outs,
        description: "4 cards of same suit, need 1 more",
        color: "#22c55e",
      };
    }
  }
  return null;
}

function detectBackdoorFlush(hand: Card[], board: Card[], remaining: Card[]): DrawInfo | null {
  if (board.length !== 3) return null;
  const all = [...hand, ...board];
  const suitCounts = getSuitCounts(all);

  for (const [suit, cards] of suitCounts) {
    if (cards.length === 3) {
      const outs = remaining.filter((c) => c.suit === suit).slice(0, 2);
      if (outs.length > 0) {
        return {
          name: "Backdoor Flush",
          outs,
          description: "3 of suit, need runner-runner",
          color: "#16a34a",
        };
      }
    }
  }
  return null;
}

function getConsecutiveRuns(values: number[]): number[][] {
  const unique = [...new Set(values)].sort((a, b) => a - b);
  const runs: number[][] = [];
  let current = [unique[0]];

  for (let i = 1; i < unique.length; i++) {
    if (unique[i] === current[current.length - 1] + 1) {
      current.push(unique[i]);
    } else {
      runs.push(current);
      current = [unique[i]];
    }
  }
  runs.push(current);
  return runs;
}

function detectOESD(hand: Card[], board: Card[], remaining: Card[]): DrawInfo | null {
  const all = [...hand, ...board];
  const values = getSortedValues(all);
  const unique = [...new Set(values)].sort((a, b) => a - b);

  if (unique.includes(14)) {
    unique.unshift(1);
  }

  const runs = getConsecutiveRuns(unique);

  for (const run of runs) {
    if (run.length === 4) {
      const low = run[0];
      const high = run[3];
      const neededValues: number[] = [];

      if (low > 1 && low - 1 >= 2) neededValues.push(low - 1);
      if (low - 1 === 1) neededValues.push(14);
      if (high + 1 <= 14) neededValues.push(high + 1);

      if (neededValues.length === 2) {
        const outs: Card[] = [];
        for (const v of neededValues) {
          const r = valueToRank(v);
          if (r) {
            for (const c of remaining) {
              if (c.rank === r) outs.push(c);
            }
          }
        }
        if (outs.length > 0) {
          return {
            name: "Open-Ended Straight Draw",
            outs,
            description: "4 consecutive cards, can hit on either end",
            color: "#3b82f6",
          };
        }
      }
    }
  }
  return null;
}

function detectGutshot(hand: Card[], board: Card[], remaining: Card[]): DrawInfo | null {
  const all = [...hand, ...board];
  const values = getSortedValues(all);
  const unique = [...new Set(values)].sort((a, b) => a - b);

  if (unique.includes(14)) {
    unique.unshift(1);
  }

  for (let target = 5; target <= 14; target++) {
    const straightCards = [];
    for (let i = target - 4; i <= target; i++) {
      const v = i === 1 ? 14 : i;
      if (unique.includes(i) || unique.includes(v)) {
        straightCards.push(i);
      }
    }
    if (straightCards.length === 4) {
      const missing = [];
      for (let i = target - 4; i <= target; i++) {
        const v = i === 1 ? 14 : i;
        if (!unique.includes(i) && !unique.includes(v)) {
          missing.push(v);
        }
      }
      if (missing.length === 1) {
        const neededRank = valueToRank(missing[0]);
        if (neededRank) {
          const outs = remaining.filter((c) => c.rank === neededRank);
          if (outs.length > 0) {
            return {
              name: "Gutshot Straight Draw",
              outs,
              description: "Need 1 specific rank to complete straight",
              color: "#f59e0b",
            };
          }
        }
      }
    }
  }
  return null;
}

function detectOvercards(hand: Card[], board: Card[]): DrawInfo | null {
  if (board.length === 0) return null;
  const boardMax = Math.max(...board.map((c) => rankValue(c.rank)));
  const overcards = hand.filter((c) => rankValue(c.rank) > boardMax);

  if (overcards.length === 2) {
    const outs: Card[] = [];
    for (const oc of overcards) {
      for (const s of ALL_SUITS) {
        const key = `${oc.rank}${s}`;
        const isUsed = [...hand, ...board].some((c) => cardKey(c) === key);
        if (!isUsed) outs.push({ rank: oc.rank, suit: s });
      }
    }
    return {
      name: "Two Overcards",
      outs,
      description: "Both hole cards higher than board",
      color: "#a855f7",
    };
  }

  if (overcards.length === 1) {
    const outs: Card[] = [];
    for (const s of ALL_SUITS) {
      const key = `${overcards[0].rank}${s}`;
      const isUsed = [...hand, ...board].some((c) => cardKey(c) === key);
      if (!isUsed) outs.push({ rank: overcards[0].rank, suit: s });
    }
    return {
      name: "One Overcard",
      outs,
      description: "One hole card higher than board",
      color: "#c084fc",
    };
  }

  return null;
}

function valueToRank(v: number): Rank | null {
  for (const [r, val] of Object.entries(RANK_VALUES)) {
    if (val === v) return r as Rank;
  }
  return null;
}

export function detectDraws(hand: Card[], board: Card[]): OutsResult {
  if (hand.length < 2 || board.length < 3) {
    return { draws: [], totalOuts: [], totalOutCount: 0 };
  }

  const used = [...hand, ...board];
  const remaining = buildRemainingDeck(used);
  const draws: DrawInfo[] = [];

  const flush = detectFlushDraw(hand, board, remaining);
  if (flush) draws.push(flush);

  const oesd = detectOESD(hand, board, remaining);
  const gutshot = !oesd ? detectGutshot(hand, board, remaining) : null;
  if (oesd) draws.push(oesd);
  if (gutshot) draws.push(gutshot);

  const overcards = detectOvercards(hand, board);
  if (overcards) draws.push(overcards);

  if (!flush) {
    const backdoorFlush = detectBackdoorFlush(hand, board, remaining);
    if (backdoorFlush) draws.push(backdoorFlush);
  }

  const outKeys = new Set<string>();
  const totalOuts: Card[] = [];

  for (const draw of draws) {
    for (const card of draw.outs) {
      const k = cardKey(card);
      if (!outKeys.has(k)) {
        outKeys.add(k);
        totalOuts.push(card);
      }
    }
  }

  return {
    draws,
    totalOuts,
    totalOutCount: totalOuts.length,
  };
}
