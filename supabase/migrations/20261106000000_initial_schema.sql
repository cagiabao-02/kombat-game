-- Migration: 20261106000000_initial_schema.sql
-- Description: Create rooms table with RLS for multiplayer rooms (Chess, etc.)

-- 1. Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  game_id TEXT NOT NULL DEFAULT 'chess',
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'abandoned')),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  host_name TEXT NOT NULL DEFAULT 'Người chơi 1',
  guest_name TEXT DEFAULT NULL,
  game_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast room code lookup
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms (code);
CREATE INDEX IF NOT EXISTS idx_rooms_host_guest ON public.rooms (host_id, guest_id);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Policy: Who can view a room?
CREATE POLICY "Allow members or joiners to view room"
  ON public.rooms
  FOR SELECT
  TO authenticated
  USING (
    status = 'waiting'
    OR auth.uid() = host_id
    OR auth.uid() = guest_id
  );

-- Policy: Who can create a room?
CREATE POLICY "Allow host to create room"
  ON public.rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = host_id
  );

-- Policy: Who can update a room?
CREATE POLICY "Allow participants to update room"
  ON public.rooms
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = host_id
    OR auth.uid() = guest_id
    OR (guest_id IS NULL AND status = 'waiting')
  )
  WITH CHECK (
    auth.uid() = host_id
    OR auth.uid() = guest_id
    OR (guest_id IS NULL AND status = 'waiting')
  );
