-- Cập nhật ràng buộc game_id trên bảng leaderboard_scores để hỗ trợ thêm trò Khủng Long T-Rex (t_rex_runner)

ALTER TABLE leaderboard_scores DROP CONSTRAINT IF EXISTS leaderboard_scores_game_id_check;

ALTER TABLE leaderboard_scores ADD CONSTRAINT leaderboard_scores_game_id_check 
  CHECK (game_id IN ('chess', 'caro', 'sudoku', 'xiangqi', 'snake', 'game2048', 'minesweeper', 'brick_breaker', 't_rex_runner'));
