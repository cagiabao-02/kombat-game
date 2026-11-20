import { GameId } from '@/types/game';

export type DailyCategory = 'strategy' | 'puzzle' | 'arcade';

export interface DailyChallengeTemplate {
  id: string;
  gameId: GameId;
  category: DailyCategory;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
  storageKey: string;
  field: string;
  target: number;
  route: string;
}

export interface DailyChallengeProgress {
  id: string;
  baseline: number;
  claimed: boolean;
}

export interface DailyChallengeViewItem {
  template: DailyChallengeTemplate;
  progress: number;
  target: number;
  isCompleted: boolean;
  claimed: boolean;
}

export interface DailyChallengesState {
  dateKey: string; // YYYY-MM-DD
  challenges: DailyChallengeProgress[];
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  totalCompletedDays: number;
  totalQuestsClaimed: number;
  lastUpdated: number;
}
