CREATE TABLE IF NOT EXISTS wordquest.staff_accounts(id TEXT PRIMARY KEY,name TEXT NOT NULL,username TEXT UNIQUE NOT NULL,role TEXT NOT NULL,permissions TEXT NOT NULL,groups_json TEXT NOT NULL,active BIGINT NOT NULL DEFAULT 1,salt TEXT NOT NULL DEFAULT '',password_hash TEXT NOT NULL DEFAULT '',invite_hash TEXT UNIQUE,invite_expires BIGINT NOT NULL DEFAULT 0,created_at BIGINT NOT NULL);
ALTER TABLE wordquest.staff_accounts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON wordquest.staff_accounts FROM PUBLIC,anon,authenticated;
GRANT ALL ON wordquest.staff_accounts TO service_role;
