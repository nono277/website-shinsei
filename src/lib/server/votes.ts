import db from './db';
import {
	VOTE_SITES, REWARD_SITES,
	MINECRAFT_MP_API_KEY, TOP_SERVEURS_API_KEY, SERVEURS_MC_ORG_SERVER_ID,
	type SiteKey, type RewardSiteKey,
} from '$lib/data/vote-sites';

export type PendingReward = { id: string; kind: 'vote' | 'bonus' };

// Prepared statements
const stmtGetRecord      = db.prepare<[string, string], { voted_at: number; next_vote_at: number | null }>('SELECT voted_at, next_vote_at FROM vote_records WHERE username = ? AND site = ?');
const stmtGetAllVotes    = db.prepare<[string], { site: string; voted_at: number; next_vote_at: number | null }>('SELECT site, voted_at, next_vote_at FROM vote_records WHERE username = ?');
const stmtUpsertVote     = db.prepare<[string, string, number, number]>('INSERT OR REPLACE INTO vote_records (username, site, voted_at, next_vote_at) VALUES (?, ?, ?, ?)');
const stmtInsertHistory  = db.prepare<[string, string, string, number]>('INSERT INTO vote_history (id, username, site, voted_at) VALUES (?, ?, ?, ?)');
const stmtInsertPending  = db.prepare<[string, string, string]>('INSERT OR IGNORE INTO pending_rewards (id, username, kind) VALUES (?, ?, ?)');
const stmtGetPending     = db.prepare<[string], { id: string; kind: string }>('SELECT id, kind FROM pending_rewards WHERE username = ?');
const stmtCountPending   = db.prepare<[string], { n: number }>('SELECT COUNT(*) AS n FROM pending_rewards WHERE username = ?');
const stmtTopVoters      = db.prepare<[number], { username: string; votes: number }>(
	'SELECT username, COUNT(*) AS votes FROM vote_history WHERE voted_at >= ? GROUP BY username ORDER BY votes DESC LIMIT 10'
);

function userKey(username: string) { return username.toLowerCase(); }

function isExpired(rec: { voted_at: number; next_vote_at: number | null }, siteKey: SiteKey): boolean {
	const nextVoteAt = rec.next_vote_at ?? rec.voted_at + VOTE_SITES[siteKey].cooldownMs;
	return Date.now() >= nextVoteAt;
}

export function recordVote(username: string, site: SiteKey, nextVoteAt?: number): void {
	const key = userKey(username);
	const wasComplete = allRewardSitesVoted(key);
	const now = Date.now();
	const next = nextVoteAt ?? now + VOTE_SITES[site].cooldownMs;

	stmtUpsertVote.run(key, site, now, next);
	stmtInsertHistory.run(crypto.randomUUID(), key, site, now);

	if ((REWARD_SITES as readonly string[]).includes(site)) {
		stmtInsertPending.run(crypto.randomUUID(), key, 'vote');
	}
	if (!wasComplete && allRewardSitesVoted(key)) {
		stmtInsertPending.run(crypto.randomUUID(), key, 'bonus');
	}
}

export function getTopVoters(limitDays = 30): { username: string; votes: number }[] {
	const since = Date.now() - limitDays * 24 * 60 * 60 * 1000;
	return stmtTopVoters.all(since);
}

export async function checkAndRecordMinecraftMpVote(username: string): Promise<boolean> {
	const siteKey: SiteKey = 'minecraft-mp';
	const key = userKey(username);

	const rec = stmtGetRecord.get(key, siteKey);
	if (rec && !isExpired(rec, siteKey)) return false;

	try {
		const url = `https://minecraft-mp.com/api/?object=votes&element=claim&key=${MINECRAFT_MP_API_KEY}&username=${encodeURIComponent(username)}`;
		const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
		if (!res.ok) return false;
		if ((await res.text()).trim() !== '1') return false;
	} catch { return false; }

	recordVote(username, siteKey);
	return true;
}

export async function checkAndRecordTopServeursVote(username: string, clientIp: string): Promise<boolean> {
	const siteKey: SiteKey = 'top-serveurs';
	const key = userKey(username);

	const rec = stmtGetRecord.get(key, siteKey);
	if (rec && !isExpired(rec, siteKey)) return false;

	try {
		const token = encodeURIComponent(TOP_SERVEURS_API_KEY);
		const ip    = encodeURIComponent(clientIp);
		const url   = `https://api.top-serveurs.net/v1/votes/check-ip?server_token=${token}&ip=${ip}`;
		const res   = await fetch(url, { signal: AbortSignal.timeout(5000) });
		const body  = await res.text();
		console.log(`[top-serveurs] ip=${clientIp} → HTTP ${res.status} : ${body}`);
		if (!res.ok) return false;
		const json = JSON.parse(body);
		if (json.success !== true) return false;
		// duration = minutes restantes avant prochain vote
		const nextVoteAt = typeof json.duration === 'number'
			? Date.now() + json.duration * 60_000
			: undefined;
		recordVote(username, siteKey, nextVoteAt);
	} catch (e) { console.error(`[top-serveurs] ip=${clientIp} → FETCH ERROR:`, e); return false; }

	return true;
}

export async function checkAndRecordServeursMinecraftOrgVote(username: string, clientIp: string): Promise<boolean> {
	const siteKey: SiteKey = 'serveursminecraft';
	const key = userKey(username);

	const rec = stmtGetRecord.get(key, siteKey);
	if (rec && !isExpired(rec, siteKey)) return false;

	try {
		const url = `https://www.serveursminecraft.org/sm_api/peutVoter.php?id=${SERVEURS_MC_ORG_SERVER_ID}&ip=${encodeURIComponent(clientIp)}`;
		const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
		const body = await res.text();
		console.log(`[srv-mc-org] ip=${clientIp} → HTTP ${res.status} : ${body}`);
		if (!res.ok) return false;
		const trimmed = body.trim();
		if (trimmed === 'true') return false; // peut encore voter = n'a pas voté
		// Si c'est un nombre → secondes restantes avant prochain vote
		const secsRemaining = parseInt(trimmed, 10);
		const nextVoteAt = !isNaN(secsRemaining) && secsRemaining > 0
			? Date.now() + secsRemaining * 1_000
			: undefined;
		recordVote(username, siteKey, nextVoteAt);
	} catch (e) { console.error(`[srv-mc-org] ip=${clientIp} → FETCH ERROR:`, e); return false; }

	return true;
}

export function getVoteStatus(username: string) {
	const key = userKey(username);
	const rows = stmtGetAllVotes.all(key);
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
		const row         = rows.find(r => r.site === siteKey) ?? null;
		const lastVoteAt  = row?.voted_at ?? null;
		const nextVoteAt  = row ? (row.next_vote_at ?? row.voted_at + VOTE_SITES[siteKey].cooldownMs) : null;
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
	for (const siteKey of REWARD_SITES as readonly RewardSiteKey[]) {
		const rec = stmtGetRecord.get(usernameKey, siteKey);
		if (!rec) return false;
		if (isExpired(rec, siteKey)) return false;
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
