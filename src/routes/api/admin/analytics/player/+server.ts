import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import db from '$lib/server/db';
import { fetchPlayerProfile, buildPlayerEvents } from '$lib/server/analytics/real';
import type { PlayerAnalytics } from '$lib/types/analytics';

export const GET: RequestHandler = async ({ locals, url, fetch }) => {
	if (!locals.user || locals.user.username !== env.ADMIN_MINECRAFT_USERNAME) {
		throw error(403, 'Accès refusé');
	}

	const username = url.searchParams.get('username');
	const uuid = url.searchParams.get('uuid');
	if (!username || !uuid) {
		throw error(400, 'username et uuid requis');
	}

	const siteLogins = db.prepare('SELECT ts FROM login_events WHERE username = ?').all(username) as { ts: number }[];
	const mcJoins = db.prepare('SELECT ts FROM mc_join_events WHERE uuid = ?').all(uuid) as { ts: number }[];
	const events = buildPlayerEvents(siteLogins, mcJoins);

	const profile = await fetchPlayerProfile(fetch, username);

	const player: PlayerAnalytics = {
		username,
		uuid,
		events,
		distanceTraveled: 0,
		damageDealt: 0,
		...profile,
	};

	return json(player);
};
