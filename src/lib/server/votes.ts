import db from './db';
import {
	VOTE_SITES, REWARD_SITES,
	MINECRAFT_MP_API_KEY, TOP_SERVEURS_API_KEY, SERVEURS_MC_SERVER_ID, SERVEURS_MC_ORG_SERVER_ID,
	type SiteKey, type RewardSiteKey,
} from '$lib/data/vote-sites';

export type PendingReward = { id: string; kind: 'vote' | 'bonus' };

// Prepared statements
const stmtGetRecord   = db.prepare<[string, string], { voted_at: number }>('SELECT voted_at FROM vote_records WHERE username = ? AND site = ?');
const stmtGetAllVotes = db.prepare<[string], { site: string; voted_at: number }>('SELECT site, voted_at FROM vote_records WHERE username = ?');
const stmtUpsertVote  = db.prepare<[string, string, number]>('INSERT OR REPLACE INTO vote_records (username, site, voted_at) VALUES (?, ?, ?)');
const stmtInsertPending = db.prepare<[string, string, string]>('INSERT OR IGNORE INTO pending_rewards (id, username, kind) VALUES (?, ?, ?)');
const stmtGetPending    = db.prepare<[string], { id: string; kind: string }>('SELECT id, kind FROM pending_rewards WHERE username = ?');
const stmtCountPending  = db.prepare<[string], { n: number }>('SELECT COUNT(*) AS n FROM pending_rewards WHERE username = ?');

// Cache IP → { result, cachedAt } pour respecter le quota serveurs-minecraft.org (1 req/s)
const ipVoteCache = new Map<string, { votes: number; cachedAt: number }>();
const IP_CACHE_TTL = 30_000;

function userKey(username: string) { return username.toLowerCase(); }

export function recordVote(username: string, site: SiteKey): void {
	const key = userKey(username);
	const wasComplete = allRewardSitesVoted(key);

	stmtUpsertVote.run(key, site, Date.now());

	if ((REWARD_SITES as readonly string[]).includes(site)) {
		stmtInsertPending.run(crypto.randomUUID(), key, 'vote');
	}
	if (!wasComplete && allRewardSitesVoted(key)) {
		stmtInsertPending.run(crypto.randomUUID(), key, 'bonus');
	}
}

export async function checkAndRecordMinecraftMpVote(username: string): Promise<boolean> {
	const siteKey: SiteKey = 'minecraft-mp';
	const key = userKey(username);

	const rec = stmtGetRecord.get(key, siteKey);
	if (rec && Date.now() < rec.voted_at + VOTE_SITES[siteKey].cooldownMs) return false;

	try {
		const url = `https://minecraft-mp.com/api/?object=votes&element=claim&key=${MINECRAFT_MP_API_KEY}&username=${encodeURIComponent(username)}`;
		const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
		if (!res.ok) return false;
		if ((await res.text()).trim() !== '1') return false;
	} catch { return false; }

	recordVote(username, siteKey);
	return true;
}

export async function checkAndRecordTopServeursVote(username: string): Promise<boolean> {
	const siteKey: SiteKey = 'top-serveurs';
	const key = userKey(username);

	const rec = stmtGetRecord.get(key, siteKey);
	if (rec && Date.now() < rec.voted_at + VOTE_SITES[siteKey].cooldownMs) return false;

	try {
		const token  = encodeURIComponent(TOP_SERVEURS_API_KEY);
		const pseudo = encodeURIComponent(username);
		const url    = `https://api.top-serveurs.net/v1/votes/check?token=${token}&server_token=${token}&pseudo=${pseudo}&playername=${pseudo}`;
		const res    = await fetch(url, { signal: AbortSignal.timeout(5000) });
		if (!res.ok) return false;
		if ((await res.json()).success !== true) return false;
	} catch { return false; }

	recordVote(username, siteKey);
	return true;
}

export async function checkAndRecordServeursMcVote(username: string, clientIp: string): Promise<boolean> {
	const siteKey: SiteKey = 'serveurs-minecraft';
	const key = userKey(username);

	const rec = stmtGetRecord.get(key, siteKey);
	if (rec && Date.now() < rec.voted_at + VOTE_SITES[siteKey].cooldownMs) return false;

	if (!(await checkServeursMcByIp(clientIp))) return false;

	recordVote(username, siteKey);
	return true;
}

async function checkServeursMcByIp(ip: string): Promise<boolean> {
	const cached = ipVoteCache.get(ip);
	if (cached && Date.now() - cached.cachedAt < IP_CACHE_TTL) return cached.votes > 0;

	try {
		const url = `http://www.serveurs-minecraft.org/api/is_valid_vote.php?id=${SERVEURS_MC_SERVER_ID}&ip=${encodeURIComponent(ip)}&duration=24&format=json`;
		const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
		if (!res.ok) return false;
		const data = await res.json();
		const votes = parseInt(data.votes ?? '0', 10);
		ipVoteCache.set(ip, { votes, cachedAt: Date.now() });
		return votes > 0;
	} catch { return false; }
}

export async function checkAndRecordServeursMinecraftOrgVote(username: string, clientIp: string): Promise<boolean> {
	const siteKey: SiteKey = 'serveursminecraft';
	const key = userKey(username);

	const rec = stmtGetRecord.get(key, siteKey);
	if (rec && Date.now() < rec.voted_at + VOTE_SITES[siteKey].cooldownMs) return false;

	try {
		const url = `https://www.serveursminecraft.org/sm_api/peutVoter.php?id=${SERVEURS_MC_ORG_SERVER_ID}&ip=${encodeURIComponent(clientIp)}`;
		const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
		if (!res.ok) return false;
		if ((await res.text()).trim() === 'true') return false; // "true" = peut encore voter = n'a pas voté
	} catch { return false; }

	recordVote(username, siteKey);
	return true;
}

export function getVoteStatus(username: string) {
	const key = userKey(username);
	const rows = stmtGetAllVotes.all(key);
	const recordMap = new Map(rows.map(r => [r.site, r.voted_at]));
	const now = Date.now();

	const sites = {} as Record<SiteKey, {
		lastVoteAt: number | null;
		canVote: boolean;
		nextVoteAt: number | null;
		countsForReward: boolean;
	}>;

	const rewardSet = new Set(REWARD_SITES as readonly string[]);
	let rewardVotedCount = 0;

	for (const siteKey of Object.keys(VOTE_SITES) as SiteKey[]) {
		const lastVoteAt  = recordMap.get(siteKey) ?? null;
		const nextVoteAt  = lastVoteAt != null ? lastVoteAt + VOTE_SITES[siteKey].cooldownMs : null;
		const canVote     = nextVoteAt == null || now >= nextVoteAt;
		const countsForReward = rewardSet.has(siteKey);
		if (!canVote && countsForReward) rewardVotedCount++;
		sites[siteKey] = { lastVoteAt, canVote, nextVoteAt, countsForReward };
	}

	return {
		sites,
		rewardVotedCount,
		rewardTotal: REWARD_SITES.length,
		pendingRewards: stmtCountPending.get(key)?.n ?? 0,
	};
}

function allRewardSitesVoted(usernameKey: string): boolean {
	const now = Date.now();
	for (const siteKey of REWARD_SITES as readonly RewardSiteKey[]) {
		const rec = stmtGetRecord.get(usernameKey, siteKey);
		if (!rec) return false;
		if (now >= rec.voted_at + VOTE_SITES[siteKey].cooldownMs) return false;
	}
	return true;
}

export function getPendingRewards(username: string): PendingReward[] {
	return stmtGetPending.all(userKey(username)) as PendingReward[];
}

export function removePendingRewards(username: string, ids: string[]): void {
	if (!ids.length) return;
	const placeholders = ids.map(() => '?').join(',');
	db.prepare(`DELETE FROM pending_rewards WHERE username = ? AND id IN (${placeholders})`).run(userKey(username), ...ids);
}
