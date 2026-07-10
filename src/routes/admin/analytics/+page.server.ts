import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import db from '$lib/server/db';
import type { ComparisonRange, FunnelAnalytics } from '$lib/types/analytics';
import { generateSessionStats, generateChurn, generateQuests, generateHeatmap } from '$lib/server/analytics/mock';
import { computeRetention, computeFunnel, fetchClassStats, fetchDungeonStats } from '$lib/server/analytics/real';
import { computeAlerts } from '$lib/server/analytics/alerts';

const VALID_RANGES: ComparisonRange[] = ['today', 'yesterday', '7d', '30d', '90d'];

export const load: PageServerLoad = async ({ locals, url, fetch }) => {
	if (!locals.user || locals.user.username !== env.ADMIN_MINECRAFT_USERNAME) {
		throw redirect(302, '/');
	}

	const requested = url.searchParams.get('range') as ComparisonRange | null;
	const range: ComparisonRange = requested && VALID_RANGES.includes(requested) ? requested : '7d';

	const admin = env.ADMIN_MINECRAFT_USERNAME;
	const players = db.prepare(`
		SELECT DISTINCT username, uuid FROM sessions WHERE username != ? ORDER BY username ASC
	`).all(admin) as { username: string; uuid: string }[];

	// Historique complet des connexions site (hors admin) : sert de base réelle
	// à la rétention (login_events) et à l'entonnoir (nouveaux joueurs / retours).
	const loginRows = db.prepare(`
		SELECT username, date FROM login_events WHERE username != ?
	`).all(admin) as { username: string; date: string }[];

	const retention = computeRetention(loginRows, range);
	const funnel: FunnelAnalytics = { steps: computeFunnel(loginRows, range) };
	const session = generateSessionStats();
	const churn = generateChurn();
	const quests = generateQuests();
	const heatmap = generateHeatmap();

	const [classesList, dungeons] = await Promise.all([
		fetchClassStats(fetch),
		fetchDungeonStats(fetch),
	]);
	const classes = { classes: classesList, deletionsRecreations: 0 };

	const alerts = computeAlerts({ retention, quests, classes, session, churn });

	return {
		range,
		funnel,
		session,
		retention,
		churn,
		classes,
		quests,
		dungeons,
		heatmap,
		alerts,
		players,
	};
};
