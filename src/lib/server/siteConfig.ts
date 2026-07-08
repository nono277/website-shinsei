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
