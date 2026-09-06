-- Migration: festival_state table for multi-device sync
-- Uses: id=main, state (JSONB)

CREATE TABLE IF NOT EXISTS festival_state (
  id TEXT PRIMARY KEY DEFAULT 'main',
  state JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE festival_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read" ON festival_state FOR SELECT USING (true);
CREATE POLICY "Anyone can update" ON festival_state FOR UPDATE USING (true);

INSERT INTO festival_state (id, state) VALUES ('main', '{}')
ON CONFLICT (id) DO NOTHING;