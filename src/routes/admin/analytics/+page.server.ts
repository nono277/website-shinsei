import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import db from '$lib/server/db';
import type { ComparisonRange, FunnelAnalytics } from '$lib/types/analytics';
import { generateSessionStats, generateChurn, generateQuests, generateHeatmap } from '$lib/server/analytics/mock';
import { computeRetention, computeFunnel, fetchClassStats, fetchDungeonStats } from '$lib/server/analytics/real';
import {
	fetchPluginAnalytics, mapSession, mapQuests, mapHeatmap, mapDungeons,
	computeClassesFromPlayers, computeChurn, computeMcFunnel,
} from '$lib/server/analytics/plugin';
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

	// Historique complet des connexions site (hors admin) : base réelle de la rétention.
	const loginRows = db.prepare(`
		SELECT username, date FROM login_events WHERE username != ?
	`).all(admin) as { username: string; date: string }[];

	const retention = computeRetention(loginRows, range);

	// Source réelle : GET /analytics du plugin ShinseiCore (sessions, quêtes, failles, heatmap,
	// progression des joueurs MC). Si le serveur MC est injoignable, on retombe sur les
	// structures à zéro (mock.ts) et sur le funnel « connexions site ».
	const pa = await fetchPluginAnalytics(fetch);

	let funnel: FunnelAnalytics;
	let session, churn, quests, heatmap, classes, dungeons;
	if (pa) {
		// Retours J+1 / J+7 du funnel : jours de connexion MC par joueur (tracker du site).
		const joinRows = db.prepare(`
			SELECT DISTINCT uuid, date FROM mc_join_events WHERE uuid != ''
		`).all() as { uuid: string; date: string }[];

		funnel = { steps: computeMcFunnel(pa.players, range, joinRows) };
		session = mapSession(pa);
		churn = computeChurn(pa.players);
		quests = mapQuests(pa);
		heatmap = mapHeatmap(pa);
		classes = computeClassesFromPlayers(pa.players);
		dungeons = mapDungeons(pa);
	} else {
		funnel = { steps: computeFunnel(loginRows, range) };
		session = generateSessionStats();
		churn = generateChurn();
		quests = generateQuests();
		heatmap = generateHeatmap();
		classes = { classes: await fetchClassStats(fetch), deletionsRecreations: 0 };
		dungeons = await fetchDungeonStats(fetch);
	}

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
