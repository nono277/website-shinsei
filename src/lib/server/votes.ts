import { VOTE_SITES, type SiteKey } from '$lib/data/vote-sites';

interface VoteRecord { votedAt: number; }

// username (lowercase) → siteKey → VoteRecord
const voteStore = new Map<string, Map<SiteKey, VoteRecord>>();
// username (lowercase) → pending reward IDs
const pendingRewards = new Map<string, string[]>();

export function recordVote(username: string, site: SiteKey): void {
	const key = username.toLowerCase();
	if (!voteStore.has(key)) voteStore.set(key, new Map());
	voteStore.get(key)!.set(site, { votedAt: Date.now() });

	if (allVotedCheck(key)) {
		const q = pendingRewards.get(key) ?? [];
		q.push(crypto.randomUUID());
		pendingRewards.set(key, q);
	}
}

export function getVoteStatus(username: string) {
	const key = username.toLowerCase();
	const userVotes = voteStore.get(key) ?? new Map<SiteKey, VoteRecord>();
	const now = Date.now();

	const sites = {} as Record<SiteKey, {
		lastVoteAt: number | null;
		canVote: boolean;
		nextVoteAt: number | null;
	}>;

	let votedCount = 0;
	for (const siteKey of Object.keys(VOTE_SITES) as SiteKey[]) {
		const record = userVotes.get(siteKey) ?? null;
		const lastVoteAt = record?.votedAt ?? null;
		const nextVoteAt = lastVoteAt != null ? lastVoteAt + VOTE_SITES[siteKey].cooldownMs : null;
		const canVote = nextVoteAt == null || now >= nextVoteAt;
		if (!canVote) votedCount++;
		sites[siteKey] = { lastVoteAt, canVote, nextVoteAt };
	}

	return {
		sites,
		votedCount,
		pendingRewards: pendingRewards.get(key)?.length ?? 0,
	};
}

function allVotedCheck(usernameKey: string): boolean {
	const userVotes = voteStore.get(usernameKey);
	if (!userVotes) return false;
	const now = Date.now();
	for (const siteKey of Object.keys(VOTE_SITES) as SiteKey[]) {
		const record = userVotes.get(siteKey);
		if (!record) return false;
		if (now >= record.votedAt + VOTE_SITES[siteKey].cooldownMs) return false;
	}
	return true;
}

export function claimReward(username: string): string | null {
	const key = username.toLowerCase();
	const q = pendingRewards.get(key);
	if (!q?.length) return null;
	const id = q.shift()!;
	if (!q.length) pendingRewards.delete(key);
	return id;
}
