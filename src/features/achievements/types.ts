import { GameId } from '@/types/game';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type AchievementCategory = 'general' | 'board' | 'puzzle' | 'arcade';

export interface Achievement {
  id: string;
  gameId: GameId | 'general';
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  title: {
    vi: string;
    en: string;
  };
  description: {
    vi: string;
    en: string;
  };
  /** Điều kiện kiểm tra xem thành tích đã đạt hay chưa dựa trên stats tổng hợp */
  checkCondition?: (allStats: Record<string, any>) => boolean;
}

export interface UnlockedAchievementData {
  unlockedAt: string; // ISO string
}

export type UnlockedAchievementsMap = Record<string, UnlockedAchievementData>;
