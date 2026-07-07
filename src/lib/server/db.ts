import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';

const db = new Database(env.DB_PATH ?? 'votes.db');
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

db.exec(`
	CREATE TABLE IF NOT EXISTS vote_records (
		username     TEXT    NOT NULL,
		site         TEXT    NOT NULL,
		voted_at     INTEGER NOT NULL,
		next_vote_at INTEGER,
		PRIMARY KEY (username, site)
	);
	CREATE TABLE IF NOT EXISTS pending_rewards (
		id       TEXT PRIMARY KEY,
		username TEXT NOT NULL,
		kind     TEXT NOT NULL CHECK(kind IN ('vote','bonus'))
	);
	CREATE TABLE IF NOT EXISTS vote_history (
		id        TEXT    PRIMARY KEY,
		username  TEXT    NOT NULL,
		site      TEXT    NOT NULL,
		voted_at  INTEGER NOT NULL
	);
	CREATE INDEX IF NOT EXISTS idx_vote_history_username ON vote_history(username);
	CREATE INDEX IF NOT EXISTS idx_vote_history_voted_at ON vote_history(voted_at);
`);

// Migration : ajoute next_vote_at si la colonne n'existe pas encore
try { db.exec('ALTER TABLE vote_records ADD COLUMN next_vote_at INTEGER'); } catch { /* déjà présente */ }

export default db;
