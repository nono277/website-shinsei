import db from './db';

export interface MaintenanceConfig {
	enabled: boolean;
	endDate: string;
	message: string;
}

function getConfig(key: string, fallback = ''): string {
	const row = db.prepare('SELECT value FROM site_config WHERE key = ?').get(key) as { value: string } | undefined;
	return row?.value ?? fallback;
}

export function recordDownload(): void {
	const date = new Date().toISOString().slice(0, 10);
	db.prepare(`
		INSERT INTO download_stats (date, count) VALUES (?, 1)
		ON CONFLICT(date) DO UPDATE SET count = count + 1
	`).run(date);
}

export function recordLogin(username: string): void {
	const now = Date.now();
	const date = new Date().toISOString().slice(0, 10);
	db.prepare('INSERT OR IGNORE INTO login_events (id, username, date, ts) VALUES (?, ?, ?, ?)').run(
		`${date}-${username}-${now}`, username, date, now
	);
}

export function setConfig(key: string, value: string): void {
	db.prepare('INSERT OR REPLACE INTO site_config (key, value) VALUES (?, ?)').run(key, value);
}

export function getMaintenanceConfig(): MaintenanceConfig {
	const storedEnabled = getConfig('maintenance_enabled', '0') === '1';
	const endDate = getConfig('maintenance_end', '');
	const message = getConfig('maintenance_message', 'Le serveur est actuellement en maintenance. Nous revenons très bientôt !');
	const expired = endDate ? new Date(endDate) <= new Date() : false;
	return {
		enabled: storedEnabled && !expired,
		endDate,
		message,
	};
}
