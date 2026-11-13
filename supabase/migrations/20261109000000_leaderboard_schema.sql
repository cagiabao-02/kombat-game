-- Migration: 20261109000000_leaderboard_schema.sql
-- Description: Create leaderboard_scores table with RLS for global ranking

CREATE TABLE IF NOT EXISTS public.leaderboard_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT NOT NULL DEFAULT '👑',
  game_id TEXT NOT NULL CHECK (game_id IN ('chess', 'caro', 'sudoku')),
  score_value NUMERIC NOT NULL DEFAULT 0,
  score_label TEXT NOT NULL,
  secondary_info TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_game UNIQUE (user_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_game_score ON public.leaderboard_scores (game_id, score_value DESC);

-- Enable RLS
ALTER TABLE public.leaderboard_scores ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/authenticated) to view the leaderboard
CREATE POLICY "Allow anyone to view leaderboard"
  ON public.leaderboard_scores
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to insert/update their own score
CREATE POLICY "Allow users to upsert their own score"
  ON public.leaderboard_scores
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

