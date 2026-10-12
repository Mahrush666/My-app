CREATE TABLE IF NOT EXISTS student_links(child_id TEXT PRIMARY KEY REFERENCES children(id),access_hash TEXT UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS student_sessions(session_hash TEXT PRIMARY KEY REFERENCES sessions(hash),child_id TEXT NOT NULL REFERENCES children(id),access_hash TEXT NOT NULL);
