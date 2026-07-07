import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';

const db = new Database(env.DB_PATH ?? 'votes.db');
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

db.exec(`
	CREATE TABLE IF NOT EXISTS vote_records (
		username  TEXT    NOT NULL,
		site      TEXT    NOT NULL,
		voted_at  INTEGER NOT NULL,
		PRIMARY KEY (username, site)
	);
	CREATE TABLE IF NOT EXISTS pending_rewards (
		id       TEXT PRIMARY KEY,
		username TEXT NOT NULL,
		kind     TEXT NOT NULL CHECK(kind IN ('vote','bonus'))
	);
`);

export default db;
