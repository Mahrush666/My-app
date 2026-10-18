BEGIN;
SET LOCAL search_path=wordquest;
CREATE TABLE IF NOT EXISTS reward_events(id TEXT PRIMARY KEY, child_id TEXT NOT NULL REFERENCES children(id), source TEXT NOT NULL, kind TEXT NOT NULL, label TEXT NOT NULL, xp BIGINT NOT NULL, created_at BIGINT NOT NULL, revoked BIGINT NOT NULL DEFAULT 0, UNIQUE(child_id,source));
CREATE INDEX IF NOT EXISTS reward_events_child ON reward_events(child_id,created_at);
ALTER TABLE reward_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON reward_events FROM PUBLIC,anon,authenticated;
GRANT ALL ON reward_events TO service_role;
COMMIT;
