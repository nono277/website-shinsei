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

function val(r: PromiseSettledResult<boolean>): string {
	return r.status === 'fulfilled' ? String(r.value) : `ERR(${r.reason})`;
}

export const GET: RequestHandler = async ({ locals, getClientAddress }) => {
	if (!locals.user) return json({ authenticated: false });

	const username = locals.user.username;

	let clientIp = '';
	try { clientIp = getClientAddress(); } catch (e) { console.warn('[VOTE] getClientAddress failed:', e); }
	// En dev, getClientAddress() retourne 127.0.0.1 — les sites de vote ont enregistré
	// la vraie IP publique, donc la vérification échoue. OVERRIDE_CLIENT_IP permet de tester.
	if (dev && env.OVERRIDE_CLIENT_IP) clientIp = env.OVERRIDE_CLIENT_IP;

	const [r1, r2, r3, r4] = await Promise.allSettled([
		checkAndRecordMinecraftMpVote(username),
		clientIp ? checkAndRecordTopServeursVote(username, clientIp) : Promise.resolve(false),
		clientIp ? checkAndRecordServeursMcVote(username, clientIp) : Promise.resolve(false),
		clientIp ? checkAndRecordServeursMinecraftOrgVote(username, clientIp) : Promise.resolve(false),
	]);
	console.log(`[VOTE] ${username} ip=${clientIp||'?'} mc-mp=${val(r1)} top-srv=${val(r2)} srv-mc=${val(r3)} srv-mc-org=${val(r4)}`);

	const status = getVoteStatus(username);
	console.log(`[VOTE] status → rewardVoted=${status.rewardVotedCount}/${status.rewardTotal} sites=${JSON.stringify(Object.fromEntries(Object.entries(status.sites).map(([k,v]) => [k, v.canVote ? 'can' : 'voted'])))}`);
	return json({ authenticated: true, ...status });
};
