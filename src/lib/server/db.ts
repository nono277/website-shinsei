import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';

const db = new Database(env.DB_PATH ?? 'votes.db');
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

db.exec(`
	CREATE TABLE IF NOT EXISTS site_config (
		key   TEXT PRIMARY KEY,
		value TEXT NOT NULL
	);
	CREATE TABLE IF NOT EXISTS download_stats (
		date  TEXT PRIMARY KEY,
		count INTEGER NOT NULL DEFAULT 0
	);
	CREATE TABLE IF NOT EXISTS login_events (
		id       TEXT PRIMARY KEY,
		username TEXT NOT NULL,
		date     TEXT NOT NULL,
		ts       INTEGER NOT NULL
	);
	CREATE TABLE IF NOT EXISTS sessions (
		id             TEXT PRIMARY KEY,
		minecraft_token TEXT NOT NULL,
		uuid           TEXT NOT NULL,
		username       TEXT NOT NULL,
		skin_url       TEXT,
		cape_url       TEXT,
		skin_variant   TEXT,
		expires_at     INTEGER NOT NULL
	);
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
	CREATE TABLE IF NOT EXISTS server_daily_peaks (
		date TEXT PRIMARY KEY,
		peak INTEGER NOT NULL DEFAULT 0
	);
	CREATE TABLE IF NOT EXISTS mc_join_events (
		id       TEXT PRIMARY KEY,
		uuid     TEXT NOT NULL,
		username TEXT NOT NULL,
		date     TEXT NOT NULL,
		ts       INTEGER NOT NULL
	);
	CREATE INDEX IF NOT EXISTS idx_mc_join_events_date ON mc_join_events(date);
	CREATE INDEX IF NOT EXISTS idx_mc_join_events_uuid ON mc_join_events(uuid);
	CREATE TABLE IF NOT EXISTS mc_player_samples (
		ts    INTEGER PRIMARY KEY,
		count INTEGER NOT NULL
	);
`);

// Migration : ajoute next_vote_at si la colonne n'existe pas encore
try { db.exec('ALTER TABLE vote_records ADD COLUMN next_vote_at INTEGER'); } catch { /* déjà présente */ }

// Migration : backfill vote_history depuis vote_records (ID déterministe = idempotent)
db.exec(`
	INSERT OR IGNORE INTO vote_history (id, username, site, voted_at)
	SELECT 'backfill-' || username || '-' || site, username, site, voted_at FROM vote_records;
`);

export default db;
