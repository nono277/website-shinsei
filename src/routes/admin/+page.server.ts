import type { Actions, PageServerLoad } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getMaintenanceConfig, setConfig } from '$lib/server/siteConfig';
import db from '$lib/server/db';

function fillDays(data: { date: string; count: number }[], days: number) {
	const result = [];
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date();
		d.setDate(d.getDate() - i);
		const dateStr = d.toISOString().slice(0, 10);
		const found = data.find(r => r.date === dateStr);
		result.push({
			date: dateStr,
			count: found?.count ?? 0,
			label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
		});
	}
	return result;
}

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (!locals.user || locals.user.username !== env.ADMIN_MINECRAFT_USERNAME) {
		throw redirect(302, '/');
	}

	const now = Date.now();
	const since14 = now - 14 * 86400000;
	const since30 = now - 30 * 86400000;

	const activeSessions = (db.prepare('SELECT COUNT(*) as c FROM sessions WHERE expires_at > ?').get(now) as { c: number }).c;
	const uniqueUsers    = (db.prepare('SELECT COUNT(DISTINCT username) as c FROM sessions').get() as { c: number }).c;
	const totalDownloads = (db.prepare('SELECT COALESCE(SUM(count), 0) as c FROM download_stats').get() as { c: number }).c;
	const totalVotes     = (db.prepare('SELECT COUNT(*) as c FROM vote_history').get() as { c: number }).c;
	const totalLogins    = (db.prepare('SELECT COUNT(*) as c FROM login_events').get() as { c: number }).c;

	const rawLogins = db.prepare(`
		SELECT date, COUNT(*) as count FROM login_events WHERE ts > ? GROUP BY date ORDER BY date ASC
	`).all(since14) as { date: string; count: number }[];
	const dailyLogins = fillDays(rawLogins, 14);

	const topVoters = db.prepare(`
		SELECT username, COUNT(*) as count FROM vote_history
		WHERE voted_at > ? GROUP BY username ORDER BY count DESC LIMIT 5
	`).all(since30) as { username: string; count: number }[];

	// Statut serveur Minecraft
	let serverOnline = false;
	let serverPlayers = 0;
	let serverDonjons = 0;
	let serverFailles = 0;
	try {
		const res = await fetch('/api/stats');
		if (res.ok) {
			const data = await res.json();
			serverOnline  = data.status === 'online';
			serverPlayers = data.online ?? 0;
			serverDonjons = data.donjons ?? 0;
			serverFailles = data.failles ?? 0;
		}
	} catch { /* serveur offline */ }

	return {
		adminUser: locals.user.username,
		maintenance: getMaintenanceConfig(),
		stats: { activeSessions, uniqueUsers, totalDownloads, totalVotes, totalLogins },
		server: { online: serverOnline, players: serverPlayers, donjons: serverDonjons, failles: serverFailles },
		dailyLogins,
		topVoters,
	};
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		if (!locals.user || locals.user.username !== env.ADMIN_MINECRAFT_USERNAME) {
			return fail(403, { error: 'Accès refusé' });
		}
		const data = await request.formData();
		const enabled = data.get('enabled') === 'on';
		const endDate = (data.get('endDate') as string) ?? '';
		const message = (data.get('message') as string) ?? '';

		setConfig('maintenance_enabled', enabled ? '1' : '0');
		setConfig('maintenance_end', endDate);
		setConfig('maintenance_message', message);

		return { success: true };
	},
};
