CREATE TABLE IF NOT EXISTS wordquest.homework_time(id TEXT PRIMARY KEY,child_id TEXT NOT NULL REFERENCES wordquest.children(id) ON DELETE CASCADE,assignment_id TEXT NOT NULL REFERENCES wordquest.assignments(id) ON DELETE CASCADE,assignment_version BIGINT NOT NULL,session_id TEXT NOT NULL,started_at BIGINT NOT NULL,ended_at BIGINT NOT NULL,CHECK(ended_at>started_at AND ended_at-started_at<=60000));
CREATE INDEX IF NOT EXISTS homework_time_report ON wordquest.homework_time(child_id,assignment_id,assignment_version);
ALTER TABLE wordquest.homework_time ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON wordquest.homework_time FROM PUBLIC,anon,authenticated;
GRANT ALL ON wordquest.homework_time TO service_role;
