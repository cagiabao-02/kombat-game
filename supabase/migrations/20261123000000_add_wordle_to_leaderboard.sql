-- Cập nhật ràng buộc game_id trên bảng leaderboard_scores để hỗ trợ thêm trò Wordle (wordle)

ALTER TABLE leaderboard_scores DROP CONSTRAINT IF EXISTS leaderboard_scores_game_id_check;

ALTER TABLE leaderboard_scores ADD CONSTRAINT leaderboard_scores_game_id_check
  CHECK (game_id IN (
    'chess',
    'caro',
    'sudoku',
    'xiangqi',
    'go',
    'othello',
    'snake',
    'game2048',
    'minesweeper',
    'brick_breaker',
    't_rex_runner',
    'flappy_bird',
    'block_blast',
    'tetris',
    'wordle'
  ));
