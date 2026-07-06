import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import {
	getVoteStatus,
	checkAndRecordMinecraftMpVote,
	checkAndRecordTopServeursVote,
	checkAndRecordServeursMcVote,
	checkAndRecordServeursMinecraftOrgVote,
} from '$lib/server/votes';

export const GET: RequestHandler = async ({ locals, getClientAddress }) => {
	if (!locals.user) return json({ authenticated: false });

	const username = locals.user.username;

	let clientIp = '';
	try { clientIp = getClientAddress(); } catch { /* ignore */ }
	// En dev, getClientAddress() retourne 127.0.0.1 — les sites de vote ont enregistré
	// la vraie IP publique, donc la vérification échoue. OVERRIDE_CLIENT_IP permet de tester.
	if (dev && env.OVERRIDE_CLIENT_IP) clientIp = env.OVERRIDE_CLIENT_IP;

	await Promise.allSettled([
		checkAndRecordMinecraftMpVote(username),
		checkAndRecordTopServeursVote(username),
		clientIp ? checkAndRecordServeursMcVote(username, clientIp) : Promise.resolve(false),
		clientIp ? checkAndRecordServeursMinecraftOrgVote(username, clientIp) : Promise.resolve(false),
	]);

	return json({ authenticated: true, ...getVoteStatus(username) });
};
