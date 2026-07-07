import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { getVoteStatus, claimReward, requeueReward } from '$lib/server/votes';

// Backend Minecraft : endpoint POST /vote/reward (shinsei-core StatsHttpServer).
const REWARD_URL   = env.VOTE_REWARD_URL   ?? 'http://play.playshinsei.fr:8080/vote/reward';
const REWARD_TOKEN = env.VOTE_REWARD_TOKEN ?? '';

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ error: 'not authenticated' }, { status: 401 });

	const status = getVoteStatus(locals.user.username);
	if (status.pendingRewards === 0) return json({ error: 'no pending rewards' }, { status: 400 });

	const rewardId = claimReward(locals.user.username);
	if (!rewardId) return json({ error: 'claim failed' }, { status: 500 });

	// Crédite les récompenses en jeu via le backend Minecraft.
	try {
		const res = await fetch(REWARD_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(REWARD_TOKEN ? { 'X-Vote-Token': REWARD_TOKEN } : {}),
			},
			body: JSON.stringify({ username: locals.user.username, rewardId }),
			signal: AbortSignal.timeout(4000),
		});
		if (!res.ok) throw new Error(`backend ${res.status}`);
	} catch (e) {
		// Échec réseau/backend → on remet la récompense en file (le rewardId est idempotent
		// côté serveur, donc pas de double crédit si le crédit avait en fait abouti).
		requeueReward(locals.user.username, rewardId);
		console.error(`[VOTE] Crédit backend échoué pour ${locals.user.username} :`, e);
		return json({ error: 'reward delivery failed', retry: true }, { status: 502 });
	}

	console.log(`[VOTE] Récompenses réclamées par ${locals.user.username} (${rewardId})`);
	return json({ ok: true, rewardId });
};
