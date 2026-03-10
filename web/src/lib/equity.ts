import type { Card, Rank, Suit } from "./poker-data";
import { evaluateHand, compareHands } from "./hand-evaluator";

export interface EquityResult {
  hand1WinPct: number;
  hand2WinPct: number;
  tiePct: number;
  sampleSize: number;
  hand1Best: string;
  hand2Best: string;
}

const ALL_SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
const ALL_RANKS: Rank[] = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of ALL_SUITS) {
    for (const rank of ALL_RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

function cardKey(c: Card): string {
  return `${c.rank}${c.suit}`;
}

function shuffle(arr: Card[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export function calculateEquity(
  hand1: [Card, Card],
  hand2: [Card, Card],
  board: Card[],
  iterations: number = 10000
): EquityResult {
  const usedKeys = new Set<string>();
  for (const c of [...hand1, ...hand2, ...board]) usedKeys.add(cardKey(c));

  const remaining = buildDeck().filter((c) => !usedKeys.has(cardKey(c)));
  const cardsNeeded = 5 - board.length;

  let h1Wins = 0;
  let h2Wins = 0;
  let ties = 0;
  let h1BestName = "";
  let h2BestName = "";

  for (let i = 0; i < iterations; i++) {
    shuffle(remaining);
    const dealtBoard = [...board, ...remaining.slice(0, cardsNeeded)];

    const h1Cards = [...hand1, ...dealtBoard];
    const h2Cards = [...hand2, ...dealtBoard];

    const rank1 = evaluateHand(h1Cards);
    const rank2 = evaluateHand(h2Cards);

    if (i === 0) {
      h1BestName = rank1.name;
      h2BestName = rank2.name;
    }

    const cmp = compareHands(rank1, rank2);
    if (cmp > 0) h1Wins++;
    else if (cmp < 0) h2Wins++;
    else ties++;
  }

  if (board.length === 5) {
    const finalH1 = evaluateHand([...hand1, ...board]);
    const finalH2 = evaluateHand([...hand2, ...board]);
    h1BestName = finalH1.name;
    h2BestName = finalH2.name;
  }

  return {
    hand1WinPct: (h1Wins / iterations) * 100,
    hand2WinPct: (h2Wins / iterations) * 100,
    tiePct: (ties / iterations) * 100,
    sampleSize: iterations,
    hand1Best: h1BestName,
    hand2Best: h2BestName,
  };
}
