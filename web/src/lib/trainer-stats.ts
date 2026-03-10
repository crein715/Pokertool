export interface TrainerStats {
  totalHands: number;
  totalCorrect: number;
  bestStreak: number;
  currentStreak: number;
  byPosition: Record<string, { total: number; correct: number }>;
  byAction: Record<string, { total: number; correct: number }>;
  history: Array<{ date: string; hands: number; correct: number }>;
}

const STORAGE_KEY = "pokertrainer-stats";

export function defaultStats(): TrainerStats {
  return {
    totalHands: 0,
    totalCorrect: 0,
    bestStreak: 0,
    currentStreak: 0,
    byPosition: {},
    byAction: {},
    history: [],
  };
}

export function loadStats(): TrainerStats {
  if (typeof window === "undefined") return defaultStats();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStats();
    return { ...defaultStats(), ...JSON.parse(raw) };
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats: TrainerStats): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}

export function recordHand(
  stats: TrainerStats,
  position: string,
  correctAction: string,
  isCorrect: boolean
): TrainerStats {
  const next = { ...stats };
  next.totalHands += 1;
  if (isCorrect) {
    next.totalCorrect += 1;
    next.currentStreak += 1;
    if (next.currentStreak > next.bestStreak) next.bestStreak = next.currentStreak;
  } else {
    next.currentStreak = 0;
  }

  const bp = { ...next.byPosition };
  if (!bp[position]) bp[position] = { total: 0, correct: 0 };
  bp[position] = {
    total: bp[position].total + 1,
    correct: bp[position].correct + (isCorrect ? 1 : 0),
  };
  next.byPosition = bp;

  const ba = { ...next.byAction };
  if (!ba[correctAction]) ba[correctAction] = { total: 0, correct: 0 };
  ba[correctAction] = {
    total: ba[correctAction].total + 1,
    correct: ba[correctAction].correct + (isCorrect ? 1 : 0),
  };
  next.byAction = ba;

  return next;
}

export function addSessionToHistory(
  stats: TrainerStats,
  hands: number,
  correct: number
): TrainerStats {
  const next = { ...stats };
  const date = new Date().toISOString().slice(0, 10);
  next.history = [...next.history, { date, hands, correct }];
  return next;
}

export function getWeakestPosition(
  byPosition: Record<string, { total: number; correct: number }>
): { position: string; accuracy: number } | null {
  let worst: { position: string; accuracy: number } | null = null;
  for (const [pos, data] of Object.entries(byPosition)) {
    if (data.total < 3) continue;
    const acc = Math.round((data.correct / data.total) * 100);
    if (!worst || acc < worst.accuracy) worst = { position: pos, accuracy: acc };
  }
  return worst;
}
