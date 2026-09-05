CREATE EXTENSION IF NOT EXISTS uuid-ossp;
CREATE TABLE IF NOT EXISTS festival_state (id TEXT PRIMARY KEY DEFAULT single, payload JSONB NOT NULL DEFAULT {}, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE festival_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read ON festival_state FOR SELECT USING true;
CREATE POLICY public_write ON festival_state FOR UPDATE USING true WITH CHECK true;
INSERT INTO festival_state (id, payload) VALUES (single, {});
CREATE INDEX IF NOT EXISTS idx_festival_state_updated_at ON festival_state (updated_at DESC);