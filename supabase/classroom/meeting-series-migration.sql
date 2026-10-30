CREATE TABLE IF NOT EXISTS wordquest.meeting_series(id TEXT PRIMARY KEY,group_id TEXT NOT NULL REFERENCES wordquest.groups(id) ON DELETE CASCADE,start_day TEXT NOT NULL,end_day TEXT,time TEXT NOT NULL,duration BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS wordquest.meeting_exceptions(series_id TEXT NOT NULL REFERENCES wordquest.meeting_series(id) ON DELETE CASCADE,day TEXT NOT NULL,PRIMARY KEY(series_id,day));
ALTER TABLE wordquest.meeting_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordquest.meeting_exceptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON wordquest.meeting_series,wordquest.meeting_exceptions FROM PUBLIC,anon,authenticated;
GRANT ALL ON wordquest.meeting_series,wordquest.meeting_exceptions TO service_role;
