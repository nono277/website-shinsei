import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { getPendingRewards, removePendingRewards, getVoteStatus } from '$lib/server/votes';

// Backend Minecraft : endpoint POST /vote/reward (shinsei-core StatsHttpServer).
const REWARD_URL   = env.VOTE_REWARD_URL   ?? 'http://play.playshinsei.fr:8080/vote/reward';
const REWARD_TOKEN = env.VOTE_REWARD_TOKEN ?? '';

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ error: 'not authenticated' }, { status: 401 });

	const username = locals.user.username;
	const pending  = getPendingRewards(username);
	if (pending.length === 0) return json({ error: 'no pending rewards' }, { status: 400 });

	// On crédite chaque récompense en attente (chacune a son propre rewardId idempotent côté backend).
	const delivered: string[] = [];
	for (const reward of pending) {
		try {
			const res = await fetch(REWARD_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(REWARD_TOKEN ? { 'X-Vote-Token': REWARD_TOKEN } : {}),
				},
				body: JSON.stringify({ username, rewardId: reward.id, kind: reward.kind }),
				signal: AbortSignal.timeout(4000),
			});
			if (res.ok) delivered.push(reward.id);
			else console.error(`[VOTE] backend ${res.status} pour ${username} (${reward.kind})`);
		} catch (e) {
			console.error(`[VOTE] crédit backend échoué pour ${username} (${reward.kind}) :`, e);
			// on s'arrête au 1er échec réseau : les suivants restent réclamables au prochain essai
			break;
		}
	}

	// Retire uniquement les récompenses effectivement créditées ; les autres restent en file.
	removePendingRewards(username, delivered);

	if (delivered.length === 0)
		return json({ error: 'reward delivery failed', retry: true }, { status: 502 });

	console.log(`[VOTE] ${username} : ${delivered.length}/${pending.length} récompense(s) créditée(s).`);
	return json({ ok: true, claimed: delivered.length, remaining: getVoteStatus(username).pendingRewards });
};
