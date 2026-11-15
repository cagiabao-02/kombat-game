-- Migration: 20261115120000_add_game2048_to_leaderboard.sql
-- Description: Allow 'game2048' in leaderboard_scores game_id check constraint

ALTER TABLE public.leaderboard_scores 
  DROP CONSTRAINT IF EXISTS leaderboard_scores_game_id_check;

ALTER TABLE public.leaderboard_scores 
  ADD CONSTRAINT leaderboard_scores_game_id_check 
  CHECK (game_id IN ('chess', 'caro', 'sudoku', 'xiangqi', 'snake', 'game2048'));
