-- Migration: 20261115000000_add_xiangqi_to_leaderboard.sql
-- Description: Allow 'xiangqi' and 'snake' in leaderboard_scores game_id check constraint & allow both anon and authenticated to upsert their own score

ALTER TABLE public.leaderboard_scores 
  DROP CONSTRAINT IF EXISTS leaderboard_scores_game_id_check;

ALTER TABLE public.leaderboard_scores 
  ADD CONSTRAINT leaderboard_scores_game_id_check 
  CHECK (game_id IN ('chess', 'caro', 'sudoku', 'xiangqi', 'snake'));

-- Allow both authenticated and anonymous guest users to upsert their own score
DROP POLICY IF EXISTS "Allow users to upsert their own score" ON public.leaderboard_scores;

CREATE POLICY "Allow users to upsert their own score"
  ON public.leaderboard_scores
  FOR ALL
  TO authenticated, anon
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
