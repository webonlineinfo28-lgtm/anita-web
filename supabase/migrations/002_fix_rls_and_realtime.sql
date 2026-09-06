-- Migration 002: Fix RLS to allow INSERT/upsert writes and enable realtime.
-- Context: the app (src/lib/sync.js) writes via REST POST with
--   Prefer: "resolution=merge-duplicates,return=minimal"
-- PostgREST turns that into an UPSERT (INSERT ... ON CONFLICT). The original
-- 001 migration only created SELECT + UPDATE policies, so every upsert was
-- rejected with 42501 (new row violates row-level security). This migration
-- adds the missing INSERT/ALL policies.

-- 1) Drop the old UPDATE-only policy (replaced by a full-write policy).
DROP POLICY IF EXISTS "Anyone can update festival_state" ON public.festival_state;

-- 2) Full read for anyone (guests need the shared state).
DROP POLICY IF EXISTS "Anyone can read festival_state" ON public.festival_state;
CREATE POLICY "Anyone can read festival_state"
  ON public.festival_state
  FOR SELECT
  USING (true);

-- 3) Full write (INSERT/UPDATE/UPSERT) for anyone. This app is a public
--    party room: there is no auth, so the trust model is "expose state"
--    (the payloads only contain catalog keys + sanitized chat, see chat-core).
CREATE POLICY "Anyone can write festival_state"
  ON public.festival_state
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4) Enable Realtime for festival_state so a future WebSocket upgrade works.
ALTER PUBLICATION supabase_realtime ADD TABLE public.festival_state;

-- 5) Seed the domain rows used by the sync layer (main=bingo, room=social,
--    avatars, stats). Pre-seeding avoids rows being created with dated values.
INSERT INTO festival_state (id, state)
VALUES
  ('main', '{}'),
  ('room', '{}'),
  ('avatars', '{}'),
  ('stats', '{}')
ON CONFLICT (id) DO NOTHING;