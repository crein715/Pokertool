const PROGRESS_KEY = "poker-progress";

export interface LearningProgress {
  handRankings: boolean;
  positions: boolean;
  concepts: boolean;
  ranges: boolean;
  trainer: boolean;
}

export function loadProgress(): LearningProgress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...JSON.parse(raw) };
  } catch {
    return defaultProgress();
  }
}

export function markComplete(key: keyof LearningProgress): void {
  const progress = loadProgress();
  progress[key] = true;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function getCompletionPercent(): number {
  const p = loadProgress();
  const done = [p.handRankings, p.positions, p.concepts, p.ranges, p.trainer].filter(Boolean).length;
  return Math.round((done / 5) * 100);
}

export function getCompletedCount(): number {
  const p = loadProgress();
  return [p.handRankings, p.positions, p.concepts, p.ranges, p.trainer].filter(Boolean).length;
}

function defaultProgress(): LearningProgress {
  return { handRankings: false, positions: false, concepts: false, ranges: false, trainer: false };
}
