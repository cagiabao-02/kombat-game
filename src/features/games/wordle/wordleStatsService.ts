export interface WordleStats {
  played: number;
  wins: number;
  currentStreak: number;
  bestStreak: number;
  guessDistribution: [number, number, number, number, number, number];
}

const STATS_KEY = 'kombat_wordle_stats';

const DEFAULT_STATS: WordleStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  bestStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0],
};

export function getWordleStats(): WordleStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      guessDistribution:
        Array.isArray(parsed.guessDistribution) && parsed.guessDistribution.length === 6
          ? parsed.guessDistribution
          : DEFAULT_STATS.guessDistribution,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function recordWordleResult(won: boolean, attemptsUsed: number): WordleStats {
  const current = getWordleStats();
  const nextDist = [...current.guessDistribution] as [
    number,
    number,
    number,
    number,
    number,
    number,
  ];

  let nextStreak = current.currentStreak;
  if (won) {
    nextStreak += 1;
    const idx = Math.min(Math.max(attemptsUsed - 1, 0), 5);
    nextDist[idx] += 1;
  } else {
    nextStreak = 0;
  }

  const next: WordleStats = {
    played: current.played + 1,
    wins: won ? current.wins + 1 : current.wins,
    currentStreak: nextStreak,
    bestStreak: Math.max(current.bestStreak, nextStreak),
    guessDistribution: nextDist,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(next));
    } catch {}
  }

  return next;
}
