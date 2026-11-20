import { DailyChallengeTemplate } from './types';

export const DAILY_CHALLENGE_POOL: DailyChallengeTemplate[] = [
  // === NHÓM CỜ CHIẾN THUẬT (STRATEGY) ===
  {
    id: 'chess_play_1',
    gameId: 'chess',
    category: 'strategy',
    titleVi: 'Kỳ Thủ Cờ Vua',
    titleEn: 'Chess Contender',
    descVi: 'Hoàn thành 1 ván Cờ Vua (Bot hoặc Online)',
    descEn: 'Finish 1 Chess match (Bot or Online)',
    storageKey: 'kombat_chess_stats',
    field: 'totalGames',
    target: 1,
    route: '/games/chess',
  },
  {
    id: 'caro_play_1',
    gameId: 'caro',
    category: 'strategy',
    titleVi: 'Cao Thủ Năm Quân',
    titleEn: 'Gomoku Duelist',
    descVi: 'Hoàn thành 1 ván Cờ Caro',
    descEn: 'Finish 1 Gomoku (Caro) match',
    storageKey: 'kombat_caro_stats',
    field: 'totalGames',
    target: 1,
    route: '/games/caro',
  },
  {
    id: 'xiangqi_play_1',
    gameId: 'xiangqi',
    category: 'strategy',
    titleVi: 'Tướng Soái Xuất Trận',
    titleEn: 'Xiangqi General',
    descVi: 'Hoàn thành 1 ván Cờ Tướng',
    descEn: 'Finish 1 Xiangqi match',
    storageKey: 'kombat_xiangqi_stats',
    field: 'totalGames',
    target: 1,
    route: '/games/xiangqi',
  },
  {
    id: 'go_play_1',
    gameId: 'go',
    category: 'strategy',
    titleVi: 'Thiền Định Bàn Cờ',
    titleEn: 'Zen Go Player',
    descVi: 'Hoàn thành 1 ván Cờ Vây',
    descEn: 'Finish 1 Go (Weiqi) match',
    storageKey: 'kombat_go_stats',
    field: 'totalGames',
    target: 1,
    route: '/games/go',
  },
  {
    id: 'go_capture_5',
    gameId: 'go',
    category: 'strategy',
    titleVi: 'Vây Bắt Tù Binh',
    titleEn: 'Stone Hunter',
    descVi: 'Bắt 5 quân cờ trong Cờ Vây',
    descEn: 'Capture 5 stones in Go',
    storageKey: 'kombat_go_stats',
    field: 'totalCaptures',
    target: 5,
    route: '/games/go',
  },

  // === NHÓM GIẢI ĐỐ (PUZZLE) ===
  {
    id: 'sudoku_win_1',
    gameId: 'sudoku',
    category: 'puzzle',
    titleVi: 'Bậc Thầy Số Học',
    titleEn: 'Sudoku Solver',
    descVi: 'Giải thắng 1 bàn Sudoku bất kỳ',
    descEn: 'Win 1 Sudoku puzzle at any difficulty',
    storageKey: 'kombat_sudoku_stats',
    field: 'wins',
    target: 1,
    route: '/games/sudoku',
  },
  {
    id: 'minesweeper_win_1',
    gameId: 'minesweeper',
    category: 'puzzle',
    titleVi: 'Chuyên Gia Gỡ Mìn',
    titleEn: 'Bomb Defuser',
    descVi: 'Phá đảo 1 bàn Dò Mìn an toàn',
    descEn: 'Win 1 Minesweeper board',
    storageKey: 'kombat_minesweeper_stats',
    field: 'wins',
    target: 1,
    route: '/games/minesweeper',
  },
  {
    id: 'game2048_play_2',
    gameId: 'game2048',
    category: 'puzzle',
    titleVi: 'Trượt Ô Hợp Nhất',
    titleEn: 'Tile Merger',
    descVi: 'Chơi 2 lượt 2048',
    descEn: 'Complete 2 runs of 2048',
    storageKey: 'kombat_2048_stats',
    field: 'totalGames',
    target: 2,
    route: '/games/game2048',
  },
  {
    id: 'block_blast_lines_10',
    gameId: 'block_blast',
    category: 'puzzle',
    titleVi: 'Công Phá Hàng Khối',
    titleEn: 'Block Blaster',
    descVi: 'Xóa 10 hàng/cột trong Block Blast',
    descEn: 'Clear 10 lines in Block Blast',
    storageKey: 'kombat_block_blast_stats_v1',
    field: 'totalLinesCleared',
    target: 10,
    route: '/games/block-blast',
  },
  {
    id: 'block_blast_play_2',
    gameId: 'block_blast',
    category: 'puzzle',
    titleVi: 'Thợ Xếp Khối 8x8',
    titleEn: '8x8 Architect',
    descVi: 'Hoàn thành 2 lượt Block Blast',
    descEn: 'Play 2 games of Block Blast',
    storageKey: 'kombat_block_blast_stats_v1',
    field: 'totalGames',
    target: 2,
    route: '/games/block-blast',
  },

  // === NHÓM ARCADE / PHẢN XẠ (ARCADE) ===
  {
    id: 'tetris_lines_6',
    gameId: 'tetris',
    category: 'arcade',
    titleVi: 'Xếp Gạch Siêu Tốc',
    titleEn: 'Tetris Sweeper',
    descVi: 'Xóa 6 dòng trong Tetris Cổ Điển',
    descEn: 'Clear 6 lines in Classic Tetris',
    storageKey: 'kombat_tetris_stats_v1',
    field: 'totalLines',
    target: 6,
    route: '/games/tetris',
  },
  {
    id: 'snake_apples_10',
    gameId: 'snake',
    category: 'arcade',
    titleVi: 'Chú Rắn Phàm Ăn',
    titleEn: 'Hungry Pixel Snake',
    descVi: 'Ăn 10 quả táo trong Rắn Săn Mồi',
    descEn: 'Eat 10 apples in Pixel Snake',
    storageKey: 'kombat_snake_stats',
    field: 'totalApples',
    target: 10,
    route: '/games/snake',
  },
  {
    id: 'flappy_pipes_8',
    gameId: 'flappy_bird',
    category: 'arcade',
    titleVi: 'Cánh Chim Vượt Ống',
    titleEn: 'Pipe Flyer',
    descVi: 'Bay qua 8 ống nước trong Flappy Bird',
    descEn: 'Pass 8 pipes in Flappy Bird',
    storageKey: 'kombat_flappy_stats',
    field: 'pipesPassed',
    target: 8,
    route: '/games/flappy-bird',
  },
  {
    id: 'brick_breaker_20',
    gameId: 'brick_breaker',
    category: 'arcade',
    titleVi: 'Tay Vợt Phá Gạch',
    titleEn: 'Brick Smasher',
    descVi: 'Phá vỡ 20 viên gạch trong Phá Gạch',
    descEn: 'Smash 20 bricks in Brick Breaker',
    storageKey: 'kombat_brick_breaker_stats',
    field: 'totalBricksBroken',
    target: 20,
    route: '/games/brick-breaker',
  },
  {
    id: 'trex_play_2',
    gameId: 't_rex_runner',
    category: 'arcade',
    titleVi: 'Khủng Long Sa Mạc',
    titleEn: 'Desert Sprinter',
    descVi: 'Chạy 2 lượt Khủng Long T-Rex',
    descEn: 'Complete 2 runs in T-Rex Runner',
    storageKey: 'kombat_t_rex_stats',
    field: 'totalGames',
    target: 2,
    route: '/games/t-rex-runner',
  },
];

export function getDailyTemplateById(
  id: string
): DailyChallengeTemplate | undefined {
  return DAILY_CHALLENGE_POOL.find((t) => t.id === id);
}

/**
 * Hash chuỗi ngày YYYY-MM-DD thành số nguyên dương để chia nhiệm vụ cố định theo từng ngày
 */
function hashDateKey(dateKey: string): number {
  let hash = 2166136261;
  for (let i = 0; i < dateKey.length; i++) {
    hash ^= dateKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Chọn ngẫu nhiên có kiểm soát 3 nhiệm vụ cho ngày hôm nay:
 * 1 Cờ chiến thuật + 1 Giải đố + 1 Arcade
 */
export function pickDailyTemplatesForDate(
  dateKey: string
): DailyChallengeTemplate[] {
  const seed = hashDateKey(dateKey);
  const strategies = DAILY_CHALLENGE_POOL.filter(
    (t) => t.category === 'strategy'
  );
  const puzzles = DAILY_CHALLENGE_POOL.filter((t) => t.category === 'puzzle');
  const arcades = DAILY_CHALLENGE_POOL.filter((t) => t.category === 'arcade');

  return [
    strategies[seed % strategies.length],
    puzzles[(seed >> 3) % puzzles.length],
    arcades[(seed >> 6) % arcades.length],
  ];
}
