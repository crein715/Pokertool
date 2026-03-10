import type { Card, Rank, Suit } from "./poker-data";

const RANK_VALUES: Record<Rank, number> = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8,
  "9": 9, "T": 10, "J": 11, "Q": 12, "K": 13, "A": 14,
};

export interface HandRank {
  category: number;
  ranks: number[];
  name: string;
}

const CATEGORY_NAMES = [
  "High Card", "One Pair", "Two Pair", "Three of a Kind",
  "Straight", "Flush", "Full House", "Four of a Kind",
  "Straight Flush", "Royal Flush",
];

function rankValue(r: Rank): number {
  return RANK_VALUES[r];
}

function evaluate5(cards: Card[]): HandRank {
  const vals = cards.map((c) => rankValue(c.rank)).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);

  const isFlush = suits.every((s) => s === suits[0]);

  let isStraight = false;
  let straightHigh = 0;

  if (vals[0] - vals[4] === 4 && new Set(vals).size === 5) {
    isStraight = true;
    straightHigh = vals[0];
  }
  if (
    vals[0] === 14 &&
    vals[1] === 5 &&
    vals[2] === 4 &&
    vals[3] === 3 &&
    vals[4] === 2
  ) {
    isStraight = true;
    straightHigh = 5;
  }

  const counts: Map<number, number> = new Map();
  for (const v of vals) counts.set(v, (counts.get(v) || 0) + 1);

  const groups = Array.from(counts.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return b[0] - a[0];
  });

  if (isFlush && isStraight) {
    if (straightHigh === 14) {
      return { category: 9, ranks: [14], name: "Royal Flush" };
    }
    return {
      category: 8,
      ranks: [straightHigh],
      name: `Straight Flush (${straightHigh} high)`,
    };
  }

  if (groups[0][1] === 4) {
    return {
      category: 7,
      ranks: [groups[0][0], groups[1][0]],
      name: `Four of a Kind (${rankName(groups[0][0])}s)`,
    };
  }

  if (groups[0][1] === 3 && groups[1][1] === 2) {
    return {
      category: 6,
      ranks: [groups[0][0], groups[1][0]],
      name: `Full House (${rankName(groups[0][0])}s full of ${rankName(groups[1][0])}s)`,
    };
  }

  if (isFlush) {
    return {
      category: 5,
      ranks: vals,
      name: `Flush (${rankName(vals[0])} high)`,
    };
  }

  if (isStraight) {
    return {
      category: 4,
      ranks: [straightHigh],
      name: `Straight (${rankName(straightHigh)} high)`,
    };
  }

  if (groups[0][1] === 3) {
    const kickers = groups.slice(1).map((g) => g[0]).sort((a, b) => b - a);
    return {
      category: 3,
      ranks: [groups[0][0], ...kickers],
      name: `Three of a Kind (${rankName(groups[0][0])}s)`,
    };
  }

  if (groups[0][1] === 2 && groups[1][1] === 2) {
    const pairs = [groups[0][0], groups[1][0]].sort((a, b) => b - a);
    const kicker = groups[2][0];
    return {
      category: 2,
      ranks: [...pairs, kicker],
      name: `Two Pair (${rankName(pairs[0])}s and ${rankName(pairs[1])}s)`,
    };
  }

  if (groups[0][1] === 2) {
    const kickers = groups.slice(1).map((g) => g[0]).sort((a, b) => b - a);
    return {
      category: 1,
      ranks: [groups[0][0], ...kickers],
      name: `Pair of ${rankName(groups[0][0])}s`,
    };
  }

  return {
    category: 0,
    ranks: vals,
    name: `${rankName(vals[0])} High`,
  };
}

function rankName(v: number): string {
  const names: Record<number, string> = {
    14: "Ace", 13: "King", 12: "Queen", 11: "Jack", 10: "Ten",
    9: "Nine", 8: "Eight", 7: "Seven", 6: "Six", 5: "Five",
    4: "Four", 3: "Three", 2: "Two",
  };
  return names[v] || String(v);
}

function combinations5(cards: Card[]): Card[][] {
  const result: Card[][] = [];
  const n = cards.length;
  for (let i = 0; i < n - 4; i++)
    for (let j = i + 1; j < n - 3; j++)
      for (let k = j + 1; k < n - 2; k++)
        for (let l = k + 1; l < n - 1; l++)
          for (let m = l + 1; m < n; m++)
            result.push([cards[i], cards[j], cards[k], cards[l], cards[m]]);
  return result;
}

export function evaluateHand(cards: Card[]): HandRank {
  if (cards.length < 5) {
    return { category: -1, ranks: [], name: "Incomplete" };
  }
  if (cards.length === 5) return evaluate5(cards);

  let best: HandRank | null = null;
  for (const combo of combinations5(cards)) {
    const rank = evaluate5(combo);
    if (!best || compareHands(rank, best) > 0) {
      best = rank;
    }
  }
  return best!;
}

export function compareHands(a: HandRank, b: HandRank): number {
  if (a.category !== b.category) return a.category - b.category;
  for (let i = 0; i < Math.min(a.ranks.length, b.ranks.length); i++) {
    if (a.ranks[i] !== b.ranks[i]) return a.ranks[i] - b.ranks[i];
  }
  return 0;
}

export function getCategoryName(category: number): string {
  return CATEGORY_NAMES[category] || "Unknown";
}

export { RANK_VALUES, rankValue };
