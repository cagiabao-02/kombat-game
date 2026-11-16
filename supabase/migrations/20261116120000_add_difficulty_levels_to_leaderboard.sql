-- Migration: 20261116120000_add_difficulty_levels_to_leaderboard.sql
-- Description: Cập nhật ràng buộc game_id trên bảng leaderboard_scores để hỗ trợ phân cấp độ (dễ, vừa, khó) cho Sudoku và Dò Mìn

ALTER TABLE leaderboard_scores DROP CONSTRAINT IF EXISTS leaderboard_scores_game_id_check;

ALTER TABLE leaderboard_scores ADD CONSTRAINT leaderboard_scores_game_id_check 
  CHECK (game_id IN (
    'chess', 'caro', 'xiangqi', 'snake', 'game2048', 'brick_breaker',
    'sudoku', 'sudoku_easy', 'sudoku_medium', 'sudoku_hard',
    'minesweeper', 'minesweeper_easy', 'minesweeper_medium', 'minesweeper_hard'
  ));
