CREATE TABLE IF NOT EXISTS wordquest.class_meetings(id TEXT PRIMARY KEY,group_id TEXT NOT NULL REFERENCES wordquest.groups(id),day TEXT NOT NULL,time TEXT NOT NULL,duration BIGINT NOT NULL,UNIQUE(group_id,day,time));
CREATE INDEX IF NOT EXISTS class_meetings_day ON wordquest.class_meetings(day);
CREATE TABLE IF NOT EXISTS wordquest.attendance(meeting_id TEXT NOT NULL REFERENCES wordquest.class_meetings(id),child_id TEXT NOT NULL REFERENCES wordquest.children(id),status TEXT NOT NULL,PRIMARY KEY(meeting_id,child_id));
ALTER TABLE wordquest.class_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordquest.attendance ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON wordquest.class_meetings,wordquest.attendance FROM PUBLIC,anon,authenticated;
GRANT ALL ON wordquest.class_meetings,wordquest.attendance TO service_role;
