import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getVoteStatus, claimReward } from '$lib/server/votes';

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ error: 'not authenticated' }, { status: 401 });

	const status = getVoteStatus(locals.user.username);
	if (status.pendingRewards === 0) return json({ error: 'no pending rewards' }, { status: 400 });

	const rewardId = claimReward(locals.user.username);
	if (!rewardId) return json({ error: 'claim failed' }, { status: 500 });

	// TODO: Appeler le backend Minecraft pour donner les récompenses en jeu
	// await fetch(`http://play.playshinsei.fr:8080/vote/reward`, {
	//   method: 'POST',
	//   headers: { 'Content-Type': 'application/json' },
	//   body: JSON.stringify({ username: locals.user.username, rewardId }),
	//   signal: AbortSignal.timeout(4000),
	// });

	console.log(`[VOTE] Récompenses réclamées par ${locals.user.username} (${rewardId})`);
	return json({ ok: true, rewardId });
};
