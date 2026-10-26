CREATE TABLE IF NOT EXISTS wordquest.daily_practice_groups(group_id TEXT PRIMARY KEY REFERENCES wordquest.groups(id) ON DELETE CASCADE,enabled BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS wordquest.daily_runs(id TEXT PRIMARY KEY,child_id TEXT NOT NULL REFERENCES wordquest.children(id) ON DELETE CASCADE,group_id TEXT NOT NULL REFERENCES wordquest.groups(id) ON DELETE CASCADE,day TEXT NOT NULL,tasks TEXT NOT NULL,created_at BIGINT NOT NULL,finished_at BIGINT NOT NULL DEFAULT 0,UNIQUE(child_id,group_id,day));
CREATE TABLE IF NOT EXISTS wordquest.daily_answers(id TEXT PRIMARY KEY,run_id TEXT NOT NULL REFERENCES wordquest.daily_runs(id) ON DELETE CASCADE,task_id TEXT NOT NULL,correct BIGINT NOT NULL,created_at BIGINT NOT NULL,answer TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS daily_answers_run ON wordquest.daily_answers(run_id);
ALTER TABLE wordquest.daily_practice_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordquest.daily_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordquest.daily_answers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON wordquest.daily_practice_groups,wordquest.daily_runs,wordquest.daily_answers FROM PUBLIC,anon,authenticated;
GRANT ALL ON wordquest.daily_practice_groups,wordquest.daily_runs,wordquest.daily_answers TO service_role;
