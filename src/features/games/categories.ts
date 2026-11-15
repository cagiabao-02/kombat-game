import { GameCategoryId, LocalizedString } from '@/types/game';

export interface GameCategory {
  id: GameCategoryId;
  name: LocalizedString;
  tagline: LocalizedString;
  /** Gợi ý các game dự kiến, hiển thị trong ô "Sắp có" khi thể loại chưa có game. */
  upcoming: LocalizedString;
  /** Lớp màu Tailwind cho nhãn/biểu tượng của thể loại. */
  accentClass: string;
}

/**
 * Thứ tự trong mảng = thứ tự hiển thị tại sảnh.
 * Đổi tên, thêm hoặc bớt thể loại chỉ cần sửa file này (và kiểu `GameCategoryId`).
 */
export const GAME_CATEGORIES: GameCategory[] = [
  {
    id: 'strategy',
    name: { vi: 'Cờ chiến thuật', en: 'Strategy Board' },
    tagline: {
      vi: 'Đối kháng theo lượt — đấu Bot hoặc so tài với bạn bè',
      en: 'Turn-based duels — vs Bot or friends',
    },
    upcoming: { vi: 'Cờ vây, Othello', en: 'Go, Othello' },
    accentClass: 'bg-indigo-600 text-amber-300',
  },
  {
    id: 'puzzle',
    name: { vi: 'Giải đố', en: 'Puzzle' },
    tagline: {
      vi: 'Chơi một mình, rèn tư duy logic, không áp lực',
      en: 'Solo brain teasers, no pressure',
    },
    upcoming: { vi: '2048, Dò mìn, Nonogram', en: '2048, Minesweeper, Nonogram' },
    accentClass: 'bg-emerald-500 text-zinc-950',
  },
  {
    id: 'arcade',
    name: { vi: 'Phản xạ / Arcade', en: 'Arcade / Reflex' },
    tagline: {
      vi: 'Nhịp nhanh, tính điểm, cày kỷ lục',
      en: 'Fast-paced, score chasing, tryhard',
    },
    upcoming: { vi: 'Rắn săn mồi, Xếp gạch, Thử phản xạ', en: 'Snake, Block stacker, Reaction test' },
    accentClass: 'bg-rose-500 text-white',
  },
];
