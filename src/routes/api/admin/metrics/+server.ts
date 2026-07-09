import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import db from '$lib/server/db';

/** Métriques temps réel du serveur MC pour le panel admin (échantillons du tracker). */
export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user || locals.user.username !== env.ADMIN_MINECRAFT_USERNAME) {
		return json({ error: 'Accès refusé' }, { status: 403 });
	}

	const hours = Math.min(24, Math.max(1, Number(url.searchParams.get('h')) || 3));
	const since = Date.now() - hours * 3_600_000;

	const samples = db.prepare(
		'SELECT ts, count FROM mc_player_samples WHERE ts >= ? ORDER BY ts ASC'
	).all(since) as { ts: number; count: number }[];

	const today = new Date().toISOString().slice(0, 10);
	const joinsToday = (db.prepare(
		'SELECT COUNT(*) as c FROM mc_join_events WHERE date = ?'
	).get(today) as { c: number }).c;

	return json({
		samples,
		joinsToday,
		current: samples.length > 0 ? samples[samples.length - 1].count : 0,
	});
};
