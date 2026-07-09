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
	const admin = env.ADMIN_MINECRAFT_USERNAME;

	// Sessions valides (connectés dans les 30 derniers jours, session non expirée) — hors admin
	const activeSessions = (db.prepare('SELECT COUNT(*) as c FROM sessions WHERE expires_at > ? AND username != ?').get(now, admin) as { c: number }).c;
	// Total comptes uniques par UUID (résistant aux changements de pseudo) — hors admin
	const uniqueUsers    = (db.prepare('SELECT COUNT(DISTINCT uuid) as c FROM sessions WHERE username != ?').get(admin) as { c: number }).c;
	const totalDownloads = (db.prepare('SELECT COALESCE(SUM(count), 0) as c FROM download_stats').get() as { c: number }).c;
	const totalVotes     = (db.prepare('SELECT COUNT(*) as c FROM vote_history').get() as { c: number }).c;
	const totalLogins    = (db.prepare('SELECT COUNT(*) as c FROM login_events WHERE username != ?').get(admin) as { c: number }).c;

	// Actifs 7 derniers jours — hors admin
	const since7  = now - 7 * 86400000;
	const active7 = (db.prepare('SELECT COUNT(DISTINCT username) as c FROM login_events WHERE ts > ? AND username != ?').get(since7, admin) as { c: number }).c;

	// Liste des sessions actives avec détail — hors admin
	const SESSION_TTL = 30 * 86_400_000;
	const activeUsersList = db.prepare(`
		SELECT username, uuid, skin_url, expires_at,
		       (expires_at - ${SESSION_TTL}) as connected_at
		FROM sessions
		WHERE expires_at > ? AND username != ?
		ORDER BY expires_at DESC
		LIMIT 100
	`).all(now, admin) as { username: string; uuid: string; skin_url: string | null; expires_at: number; connected_at: number }[];

	const rawLogins = db.prepare(`
		SELECT date, COUNT(*) as count FROM login_events WHERE ts > ? AND username != ? GROUP BY date ORDER BY date ASC
	`).all(since14, admin) as { date: string; count: number }[];
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
	let onlinePlayers: { username: string; uuid: string; grade: string }[] = [];
	try {
		const res = await fetch('/api/stats');
		if (res.ok) {
			const data = await res.json();
			serverOnline  = data.status === 'online';
			serverPlayers = data.online ?? 0;
			serverDonjons = data.donjons ?? 0;
			serverFailles = data.failles ?? 0;
			onlinePlayers = (data.players ?? []) as { username: string; uuid: string; grade: string }[];
		}
	} catch { /* serveur offline */ }

	// Les pics journaliers et les connexions serveur sont enregistrés en continu
	// par le tracker ($lib/server/mcTracker), plus besoin d'une visite admin.
	const cutoffDate = new Date(since14).toISOString().slice(0, 10);
	const rawServerPeaks = db.prepare(`
		SELECT date, peak as count FROM server_daily_peaks WHERE date >= ? ORDER BY date ASC
	`).all(cutoffDate) as { date: string; count: number }[];
	const dailyServerPeaks = fillDays(rawServerPeaks, 14);

	// Téléchargements launcher - 14 jours
	const rawDownloads = db.prepare(`
		SELECT date, count FROM download_stats WHERE date >= ? ORDER BY date ASC
	`).all(cutoffDate) as { date: string; count: number }[];
	const dailyDownloads = fillDays(rawDownloads, 14);

	// Connexions au serveur MC par jour - 14 jours (alimenté par le tracker)
	const rawServerJoins = db.prepare(`
		SELECT date, COUNT(*) as count FROM mc_join_events WHERE date >= ? GROUP BY date ORDER BY date ASC
	`).all(cutoffDate) as { date: string; count: number }[];
	const dailyServerJoins = fillDays(rawServerJoins, 14);

	// Total de connexions serveur par joueur (uuid = '' → connexions anonymes du mode repli)
	const topServerPlayers = db.prepare(`
		SELECT username, uuid, COUNT(*) as count, MAX(ts) as last_ts
		FROM mc_join_events WHERE uuid != ''
		GROUP BY uuid ORDER BY count DESC LIMIT 8
	`).all() as { username: string; uuid: string; count: number; last_ts: number }[];
	const totalServerJoins = (db.prepare('SELECT COUNT(*) as c FROM mc_join_events').get() as { c: number }).c;

	// Votes par site - 30 jours
	const votesBySite = db.prepare(`
		SELECT site, COUNT(*) as count FROM vote_history
		WHERE voted_at > ? GROUP BY site ORDER BY count DESC
	`).all(since30) as { site: string; count: number }[];

	// Dernières connexions au site
	const recentLogins = db.prepare(`
		SELECT username, ts FROM login_events WHERE username != ? ORDER BY ts DESC LIMIT 15
	`).all(admin) as { username: string; ts: number }[];

	// Nouveaux joueurs cette semaine vs semaine précédente
	const weekStart     = now - 7  * 86400000;
	const prevWeekStart = now - 14 * 86400000;
	const newThisWeek = (db.prepare(`
		SELECT COUNT(*) as c FROM (
			SELECT username, MIN(ts) as first_login FROM login_events WHERE username != ?
			GROUP BY username HAVING first_login >= ?
		)
	`).get(admin, weekStart) as { c: number }).c;
	const newLastWeek = (db.prepare(`
		SELECT COUNT(*) as c FROM (
			SELECT username, MIN(ts) as first_login FROM login_events WHERE username != ?
			GROUP BY username HAVING first_login >= ? AND first_login < ?
		)
	`).get(admin, prevWeekStart, weekStart) as { c: number }).c;

	// Activité par heure - 30 jours
	const rawHourly = db.prepare(`
		SELECT CAST(strftime('%H', datetime(ts/1000, 'unixepoch', 'localtime')) AS INTEGER) as hour,
		       COUNT(*) as count
		FROM login_events WHERE ts > ? AND username != ?
		GROUP BY hour ORDER BY hour
	`).all(since30, admin) as { hour: number; count: number }[];
	const hourlyActivity = Array.from({ length: 24 }, (_, h) => ({
		hour: h,
		count: rawHourly.find(r => r.hour === h)?.count ?? 0,
	}));

	// Récompenses de vote en attente
	const pendingRewardsList = db.prepare(`
		SELECT username, kind FROM pending_rewards ORDER BY username ASC
	`).all() as { username: string; kind: string }[];

	return {
		adminUser: locals.user.username,
		maintenance: getMaintenanceConfig(),
		stats: { activeSessions, uniqueUsers, totalDownloads, totalVotes, totalLogins, active7, newThisWeek, newLastWeek },
		server: { online: serverOnline, players: serverPlayers, donjons: serverDonjons, failles: serverFailles },
		dailyLogins,
		dailyServerPeaks,
		dailyDownloads,
		dailyServerJoins,
		topServerPlayers,
		totalServerJoins,
		topVoters,
		votesBySite,
		activeUsersList,
		recentLogins,
		pendingRewardsList,
		hourlyActivity,
		onlinePlayers,
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
