import { Achievement } from './types';

export const ACHIEVEMENTS: Achievement[] = [
  // ==========================================
  // 1. GENERAL ACHIEVEMENTS
  // ==========================================
  {
    id: 'welcome_kombat',
    gameId: 'general',
    category: 'general',
    tier: 'bronze',
    icon: '🎮',
    title: {
      vi: 'Tân Binh Kombat',
      en: 'Welcome to Kombat',
    },
    description: {
      vi: 'Hoàn thành ván chơi đầu tiên trong bất kỳ trò chơi nào tại sảnh.',
      en: 'Complete your very first game in any arcade room.',
    },
    checkCondition: (stats) => {
      const totalGames =
        (stats.chess?.wins || 0) + (stats.chess?.losses || 0) + (stats.chess?.draws || 0) +
        (stats.caro?.wins || 0) + (stats.caro?.losses || 0) + (stats.caro?.draws || 0) +
        (stats.xiangqi?.wins || 0) + (stats.xiangqi?.losses || 0) + (stats.xiangqi?.draws || 0) +
        (stats.sudoku?.easyGamesWon || 0) + (stats.sudoku?.mediumGamesWon || 0) + (stats.sudoku?.hardGamesWon || 0) +
        (stats.snake?.totalGames || 0) +
        (stats.game2048?.totalGames || 0) +
        (stats.minesweeper?.easyWins || 0) + (stats.minesweeper?.mediumWins || 0) + (stats.minesweeper?.hardWins || 0) +
        (stats.brick_breaker?.totalGames || 0) +
        (stats.t_rex?.totalGames || 0) +
        (stats.flappy?.totalGames || 0);
      return totalGames >= 1;
    },
  },
  {
    id: 'arcade_warrior',
    gameId: 'general',
    category: 'general',
    tier: 'silver',
    icon: '⚔️',
    title: {
      vi: 'Chiến Binh Arcade',
      en: 'Arcade Warrior',
    },
    description: {
      vi: 'Tham gia thi đấu tổng cộng từ 10 ván chơi trở lên trên nền tảng.',
      en: 'Play a total of 10 or more games across the platform.',
    },
    checkCondition: (stats) => {
      const totalGames =
        (stats.chess?.wins || 0) + (stats.chess?.losses || 0) + (stats.chess?.draws || 0) +
        (stats.caro?.wins || 0) + (stats.caro?.losses || 0) + (stats.caro?.draws || 0) +
        (stats.xiangqi?.wins || 0) + (stats.xiangqi?.losses || 0) + (stats.xiangqi?.draws || 0) +
        (stats.sudoku?.easyGamesWon || 0) + (stats.sudoku?.mediumGamesWon || 0) + (stats.sudoku?.hardGamesWon || 0) +
        (stats.snake?.totalGames || 0) +
        (stats.game2048?.totalGames || 0) +
        (stats.minesweeper?.easyWins || 0) + (stats.minesweeper?.mediumWins || 0) + (stats.minesweeper?.hardWins || 0) +
        (stats.brick_breaker?.totalGames || 0) +
        (stats.t_rex?.totalGames || 0) +
        (stats.flappy?.totalGames || 0);
      return totalGames >= 10;
    },
  },
  {
    id: 'game_explorer',
    gameId: 'general',
    category: 'general',
    tier: 'gold',
    icon: '🧭',
    title: {
      vi: 'Nhà Khám Phá',
      en: 'Game Explorer',
    },
    description: {
      vi: 'Trải nghiệm ít nhất 5 tựa game khác nhau trong sảnh Kombat.',
      en: 'Play at least 5 different games in the Kombat arcade lobby.',
    },
    checkCondition: (stats) => {
      let activeCount = 0;
      if (((stats.chess?.wins || 0) + (stats.chess?.losses || 0) + (stats.chess?.draws || 0)) > 0) activeCount++;
      if (((stats.caro?.wins || 0) + (stats.caro?.losses || 0) + (stats.caro?.draws || 0)) > 0) activeCount++;
      if (((stats.xiangqi?.wins || 0) + (stats.xiangqi?.losses || 0) + (stats.xiangqi?.draws || 0)) > 0) activeCount++;
      if (((stats.sudoku?.easyGamesWon || 0) + (stats.sudoku?.mediumGamesWon || 0) + (stats.sudoku?.hardGamesWon || 0)) > 0) activeCount++;
      if ((stats.snake?.totalGames || 0) > 0) activeCount++;
      if ((stats.game2048?.totalGames || 0) > 0) activeCount++;
      if (((stats.minesweeper?.easyWins || 0) + (stats.minesweeper?.mediumWins || 0) + (stats.minesweeper?.hardWins || 0)) > 0) activeCount++;
      if ((stats.brick_breaker?.totalGames || 0) > 0) activeCount++;
      if ((stats.t_rex?.totalGames || 0) > 0) activeCount++;
      if ((stats.flappy?.totalGames || 0) > 0) activeCount++;
      return activeCount >= 5;
    },
  },

  // ==========================================
  // 2. BOARD GAMES (CỜ VUA, CỜ CARO, CỜ TƯỚNG)
  // ==========================================
  {
    id: 'chess_first_win',
    gameId: 'chess',
    category: 'board',
    tier: 'bronze',
    icon: '♟️',
    title: {
      vi: 'Kỳ Thủ Nhập Môn',
      en: 'First Checkmate',
    },
    description: {
      vi: 'Giành chiến thắng ván cờ vua đầu tiên.',
      en: 'Win your first chess match.',
    },
    checkCondition: (stats) => (stats.chess?.wins || 0) >= 1,
  },
  {
    id: 'chess_five_wins',
    gameId: 'chess',
    category: 'board',
    tier: 'gold',
    icon: '👑',
    title: {
      vi: 'Đại Kiện Tướng',
      en: 'Grandmaster',
    },
    description: {
      vi: 'Chiến thắng 5 ván cờ vua trước đối thủ hoặc bot AI.',
      en: 'Win 5 chess games against opponents or AI bots.',
    },
    checkCondition: (stats) => (stats.chess?.wins || 0) >= 5,
  },
  {
    id: 'caro_first_win',
    gameId: 'caro',
    category: 'board',
    tier: 'bronze',
    icon: '❌',
    title: {
      vi: 'Bắt Đầu Liên Chuỗi',
      en: 'Caro First Win',
    },
    description: {
      vi: 'Xếp thành công 5 quân cờ thẳng hàng để thắng ván Caro đầu tiên.',
      en: 'Connect 5 stones in a row to win your first Caro match.',
    },
    checkCondition: (stats) => (stats.caro?.wins || 0) >= 1,
  },
  {
    id: 'caro_five_wins',
    gameId: 'caro',
    category: 'board',
    tier: 'gold',
    icon: '⚡',
    title: {
      vi: 'Bất Khả Chiến Bại',
      en: 'Invincible Caro',
    },
    description: {
      vi: 'Đạt thành tích 5 ván thắng cờ Caro.',
      en: 'Achieve 5 victorious Caro matches.',
    },
    checkCondition: (stats) => (stats.caro?.wins || 0) >= 5,
  },
  {
    id: 'xiangqi_first_win',
    gameId: 'xiangqi',
    category: 'board',
    tier: 'bronze',
    icon: '帥',
    title: {
      vi: 'Tướng Soái Xuất Quân',
      en: 'Xiangqi Strategist',
    },
    description: {
      vi: 'Chiếu bí và giành thắng lợi trong một ván Cờ Tướng.',
      en: 'Checkmate the enemy General and win a Xiangqi game.',
    },
    checkCondition: (stats) => (stats.xiangqi?.wins || 0) >= 1,
  },
  {
    id: 'xiangqi_five_wins',
    gameId: 'xiangqi',
    category: 'board',
    tier: 'gold',
    icon: '🐉',
    title: {
      vi: 'Kỳ Vương Xuất Thế',
      en: 'King of Xiangqi',
    },
    description: {
      vi: 'Thắng 5 ván Cờ Tướng khẳng định đẳng cấp cao thủ.',
      en: 'Win 5 Xiangqi games to assert your mastery of the board.',
    },
    checkCondition: (stats) => (stats.xiangqi?.wins || 0) >= 5,
  },

  // ==========================================
  // 3. PUZZLE & LOGIC (SUDOKU, 2048, DÒ MÌN)
  // ==========================================
  {
    id: 'sudoku_solve_any',
    gameId: 'sudoku',
    category: 'puzzle',
    tier: 'bronze',
    icon: '🧩',
    title: {
      vi: 'Khởi Động Não Bộ',
      en: 'Brain Warmup',
    },
    description: {
      vi: 'Điền chính xác toàn bộ 81 ô số và giải thành công 1 ván Sudoku.',
      en: 'Successfully solve a Sudoku puzzle.',
    },
    checkCondition: (stats) => {
      const won = (stats.sudoku?.easyGamesWon || 0) + (stats.sudoku?.mediumGamesWon || 0) + (stats.sudoku?.hardGamesWon || 0);
      return won >= 1;
    },
  },
  {
    id: 'sudoku_solve_hard',
    gameId: 'sudoku',
    category: 'puzzle',
    tier: 'gold',
    icon: '🧠',
    title: {
      vi: 'Bậc Thầy Trí Tuệ',
      en: 'Sudoku Mastermind',
    },
    description: {
      vi: 'Giải thành công bảng Sudoku cấp độ Khó mà không bị phạm quá 3 lỗi.',
      en: 'Conquer a Hard level Sudoku board without exceeding 3 errors.',
    },
    checkCondition: (stats) => (stats.sudoku?.hardGamesWon || 0) >= 1,
  },
  {
    id: 'game2048_tile_512',
    gameId: 'game2048',
    category: 'puzzle',
    tier: 'bronze',
    icon: '🔢',
    title: {
      vi: 'Đột Phá Số Học',
      en: 'Number Fusion',
    },
    description: {
      vi: 'Ghép các ô số đạt điểm kỷ lục từ 3.000 điểm trở lên trong 2048.',
      en: 'Score 3,000 or more points in 2048.',
    },
    checkCondition: (stats) => (stats.game2048?.highScore || 0) >= 3000,
  },
  {
    id: 'game2048_tile_2048',
    gameId: 'game2048',
    category: 'puzzle',
    tier: 'platinum',
    icon: '✨',
    title: {
      vi: 'Huyền Thoại 2048',
      en: '2048 Legend',
    },
    description: {
      vi: 'Đạt cột mốc 15.000 điểm hoặc tạo thành công khối số 2048.',
      en: 'Score 15,000 points or form the glorious 2048 tile.',
    },
    checkCondition: (stats) => (stats.game2048?.highScore || 0) >= 15000,
  },
  {
    id: 'minesweeper_first_clear',
    gameId: 'minesweeper',
    category: 'puzzle',
    tier: 'bronze',
    icon: '💣',
    title: {
      vi: 'Gỡ Bom An Toàn',
      en: 'Bomb Squad',
    },
    description: {
      vi: 'Dọn sạch mọi ô trống mà không kích nổ mìn trong một ván Dò Mìn.',
      en: 'Clear an entire minefield safely in Minesweeper.',
    },
    checkCondition: (stats) => {
      const wins = (stats.minesweeper?.easyWins || 0) + (stats.minesweeper?.mediumWins || 0) + (stats.minesweeper?.hardWins || 0);
      return wins >= 1;
    },
  },
  {
    id: 'minesweeper_hard_clear',
    gameId: 'minesweeper',
    category: 'puzzle',
    tier: 'gold',
    icon: '🎖️',
    title: {
      vi: 'Thợ Săn Mìn Chuyên Nghiệp',
      en: 'Minesweeper Expert',
    },
    description: {
      vi: 'Chiến thắng màn Dò Mìn cấp độ Khó (bản đồ 16x30 với 99 quả mìn).',
      en: 'Win a Hard level Minesweeper board (16x30 with 99 mines).',
    },
    checkCondition: (stats) => (stats.minesweeper?.hardWins || 0) >= 1,
  },

  // ==========================================
  // 4. ARCADE GAMES (RẮN, GẠCH, T-REX, FLAPPY)
  // ==========================================
  {
    id: 'snake_score_30',
    gameId: 'snake',
    category: 'arcade',
    tier: 'bronze',
    icon: '🐍',
    title: {
      vi: 'Rắn Trưởng Thành',
      en: 'Growing Viper',
    },
    description: {
      vi: 'Ăn táo và đạt từ 30 điểm trở lên trong Rắn Săn Mồi.',
      en: 'Munch apples and reach 30 points in Snake.',
    },
    checkCondition: (stats) => (stats.snake?.highScore || 0) >= 30,
  },
  {
    id: 'snake_score_100',
    gameId: 'snake',
    category: 'arcade',
    tier: 'gold',
    icon: '🪐',
    title: {
      vi: 'Rồng Thần Vũ Trụ',
      en: 'Cosmic Dragon',
    },
    description: {
      vi: 'Kéo dài thân rắn và chinh phục mốc 100 điểm.',
      en: 'Conquer the 100-point milestone in Snake.',
    },
    checkCondition: (stats) => (stats.snake?.highScore || 0) >= 100,
  },
  {
    id: 'brick_breaker_score_500',
    gameId: 'brick_breaker',
    category: 'arcade',
    tier: 'bronze',
    icon: '🧱',
    title: {
      vi: 'Phá Vỡ Giới Hạn',
      en: 'Wall Breaker',
    },
    description: {
      vi: 'Bắn bóng phá vỡ các khối gạch đạt từ 500 điểm trở lên.',
      en: 'Smash bricks and score 500 points in Brick Breaker.',
    },
    checkCondition: (stats) => (stats.brick_breaker?.highScore || 0) >= 500,
  },
  {
    id: 'brick_breaker_score_1500',
    gameId: 'brick_breaker',
    category: 'arcade',
    tier: 'gold',
    icon: '🏓',
    title: {
      vi: 'Tay Vợt Sấm Sét',
      en: 'Lightning Paddle',
    },
    description: {
      vi: 'Ghi trên 1.500 điểm và làm chủ các quả bóng năng lượng.',
      en: 'Score over 1,500 points and master power-ups in Brick Breaker.',
    },
    checkCondition: (stats) => (stats.brick_breaker?.highScore || 0) >= 1500,
  },
  {
    id: 't_rex_distance_500',
    gameId: 't_rex_runner',
    category: 'arcade',
    tier: 'bronze',
    icon: '🦖',
    title: {
      vi: 'Khủng Long Tăng Tốc',
      en: 'Desert Sprinter',
    },
    description: {
      vi: 'Vượt qua sa mạc và đạt quãng đường chạy 500 mét.',
      en: 'Dash across the desert and run 500 meters in T-Rex Runner.',
    },
    checkCondition: (stats) => (stats.t_rex?.highScore || 0) >= 500,
  },
  {
    id: 't_rex_distance_1500',
    gameId: 't_rex_runner',
    category: 'arcade',
    tier: 'gold',
    icon: '☄️',
    title: {
      vi: 'Kỷ Jura Bất Diệt',
      en: 'Jurassic Survivor',
    },
    description: {
      vi: 'Chạy qua chu kỳ ngày đêm vô tận và đạt từ 1.500m trở lên.',
      en: 'Survive the endless day-night cycle and reach 1,500 meters.',
    },
    checkCondition: (stats) => (stats.t_rex?.highScore || 0) >= 1500,
  },
  {
    id: 'flappy_score_10',
    gameId: 'flappy_bird',
    category: 'arcade',
    tier: 'bronze',
    icon: '🥉',
    title: {
      vi: 'Đôi Cánh Bền Bỉ',
      en: 'Resilient Wings',
    },
    description: {
      vi: 'Bay qua 10 cặp cột ống nước và nhận Huy chương Đồng.',
      en: 'Fly past 10 pipe columns and earn the Bronze Medal.',
    },
    checkCondition: (stats) => (stats.flappy?.highScore || 0) >= 10,
  },
  {
    id: 'flappy_score_30',
    gameId: 'flappy_bird',
    category: 'arcade',
    tier: 'gold',
    icon: '🥇',
    title: {
      vi: 'Đôi Cánh Hoàng Kim',
      en: 'Golden Wings',
    },
    description: {
      vi: 'Bay qua 30 cặp cột ống nước và chạm tay vào Huy chương Vàng.',
      en: 'Fly past 30 pipe columns and unlock the prestigious Gold Medal.',
    },
    checkCondition: (stats) => (stats.flappy?.highScore || 0) >= 30,
  },

  // ==========================================
  // 5. ULTIMATE PLATINUM
  // ==========================================
  {
    id: 'trophy_collector',
    gameId: 'general',
    category: 'general',
    tier: 'platinum',
    icon: '🏆',
    title: {
      vi: 'Nhà Sưu Tập Huyền Thoại',
      en: 'Legendary Collector',
    },
    description: {
      vi: 'Mở khóa thành công ít nhất 10 huy hiệu thành tựu trong sảnh.',
      en: 'Unlock at least 10 achievement badges in the Kombat arcade.',
    },
    // Sẽ được tính động dựa trên số huy hiệu đã mở
  },
];

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
