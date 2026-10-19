CREATE TABLE IF NOT EXISTS wordquest.campuses(id TEXT PRIMARY KEY,name TEXT NOT NULL);
INSERT INTO wordquest.campuses(id,name) VALUES('main','Main campus') ON CONFLICT(id) DO NOTHING;
CREATE TABLE IF NOT EXISTS wordquest.group_campuses(group_id TEXT PRIMARY KEY REFERENCES wordquest.groups(id) ON DELETE CASCADE,campus_id TEXT NOT NULL REFERENCES wordquest.campuses(id));
CREATE TABLE IF NOT EXISTS wordquest.staff_campuses(staff_id TEXT PRIMARY KEY REFERENCES wordquest.staff_accounts(id) ON DELETE CASCADE,campus_id TEXT NOT NULL REFERENCES wordquest.campuses(id));
ALTER TABLE wordquest.campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordquest.group_campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordquest.staff_campuses ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON wordquest.campuses,wordquest.group_campuses,wordquest.staff_campuses FROM PUBLIC,anon,authenticated;
GRANT ALL ON wordquest.campuses,wordquest.group_campuses,wordquest.staff_campuses TO service_role;
