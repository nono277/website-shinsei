import {
	VOTE_SITES, REWARD_SITES,
	MINECRAFT_MP_API_KEY, TOP_SERVEURS_API_KEY, SERVEURS_MC_SERVER_ID, SERVEURS_MC_ORG_SERVER_ID,
	type SiteKey, type RewardSiteKey,
} from '$lib/data/vote-sites';

interface VoteRecord { votedAt: number; }

const voteStore      = new Map<string, Map<SiteKey, VoteRecord>>();
const pendingRewards = new Map<string, string[]>();

// Cache IP → { result, cachedAt } pour respecter le quota serveurs-minecraft.org (1 req/s)
const ipVoteCache = new Map<string, { votes: number; cachedAt: number }>();
const IP_CACHE_TTL = 30_000; // 30s

export function recordVote(username: string, site: SiteKey): void {
	const key = username.toLowerCase();
	if (!voteStore.has(key)) voteStore.set(key, new Map());
	voteStore.get(key)!.set(site, { votedAt: Date.now() });

	if (allRewardSitesVoted(key)) {
		const q = pendingRewards.get(key) ?? [];
		q.push(crypto.randomUUID());
		pendingRewards.set(key, q);
	}
}

// Vérifie minecraft-mp.com par username et l'enregistre si confirmé
export async function checkAndRecordMinecraftMpVote(username: string): Promise<boolean> {
	const siteKey: SiteKey = 'minecraft-mp';
	const userKey = username.toLowerCase();

	const userVotes = voteStore.get(userKey);
	if (userVotes) {
		const rec = userVotes.get(siteKey);
		if (rec && Date.now() < rec.votedAt + VOTE_SITES[siteKey].cooldownMs) return false;
	}

	try {
		const url = `https://minecraft-mp.com/api/?object=votes&element=claim&key=${MINECRAFT_MP_API_KEY}&username=${encodeURIComponent(username)}`;
		const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
		if (!res.ok) return false;
		const text = (await res.text()).trim();
		if (text !== '1') return false;
	} catch {
		return false;
	}

	recordVote(username, siteKey);
	return true;
}

// Vérifie top-serveurs.net par username et l'enregistre si confirmé
export async function checkAndRecordTopServeursVote(username: string): Promise<boolean> {
	const siteKey: SiteKey = 'top-serveurs';
	const userKey = username.toLowerCase();

	const userVotes = voteStore.get(userKey);
	if (userVotes) {
		const rec = userVotes.get(siteKey);
		if (rec && Date.now() < rec.votedAt + VOTE_SITES[siteKey].cooldownMs) return false;
	}

	try {
		const key    = encodeURIComponent(TOP_SERVEURS_API_KEY);
		const pseudo = encodeURIComponent(username);
		const url    = `https://api.top-serveurs.net/v1/votes/check?token=${key}&server_token=${key}&pseudo=${pseudo}&playername=${pseudo}`;
		const res    = await fetch(url, { signal: AbortSignal.timeout(5000) });
		if (!res.ok) return false;
		const data = await res.json();
		if (data.success !== true) return false;
	} catch {
		return false;
	}

	recordVote(username, siteKey);
	return true;
}

// Vérifie le vote serveurs-minecraft.org par IP et l'enregistre si confirmé
export async function checkAndRecordServeursMcVote(username: string, clientIp: string): Promise<boolean> {
	const siteKey: SiteKey = 'serveurs-minecraft';
	const userKey = username.toLowerCase();

	// Déjà voté récemment → pas besoin de re-vérifier
	const userVotes = voteStore.get(userKey);
	if (userVotes) {
		const rec = userVotes.get(siteKey);
		if (rec && Date.now() < rec.votedAt + VOTE_SITES[siteKey].cooldownMs) return false;
	}

	// Vérification via l'API (avec cache pour respecter le quota)
	const hasVoted = await checkServeursMcByIp(clientIp);
	if (!hasVoted) return false;

	recordVote(username, siteKey);
	return true;
}

async function checkServeursMcByIp(ip: string): Promise<boolean> {
	const cached = ipVoteCache.get(ip);
	if (cached && Date.now() - cached.cachedAt < IP_CACHE_TTL) {
		return cached.votes > 0;
	}

	try {
		const url = `http://www.serveurs-minecraft.org/api/is_valid_vote.php?id=${SERVEURS_MC_SERVER_ID}&ip=${encodeURIComponent(ip)}&duration=24&format=json`;
		const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
		if (!res.ok) return false;
		const data = await res.json();
		const votes = parseInt(data.votes ?? '0', 10);
		ipVoteCache.set(ip, { votes, cachedAt: Date.now() });
		return votes > 0;
	} catch {
		return false;
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
		countsForReward: boolean;
	}>;

	let rewardVotedCount = 0;
	const rewardSet = new Set(REWARD_SITES as readonly string[]);

	for (const siteKey of Object.keys(VOTE_SITES) as SiteKey[]) {
		const record         = userVotes.get(siteKey) ?? null;
		const lastVoteAt     = record?.votedAt ?? null;
		const nextVoteAt     = lastVoteAt != null ? lastVoteAt + VOTE_SITES[siteKey].cooldownMs : null;
		const canVote        = nextVoteAt == null || now >= nextVoteAt;
		const countsForReward = rewardSet.has(siteKey);
		if (!canVote && countsForReward) rewardVotedCount++;
		sites[siteKey] = { lastVoteAt, canVote, nextVoteAt, countsForReward };
	}

	return {
		sites,
		rewardVotedCount,
		rewardTotal: REWARD_SITES.length,
		pendingRewards: pendingRewards.get(key)?.length ?? 0,
	};
}

function allRewardSitesVoted(usernameKey: string): boolean {
	const userVotes = voteStore.get(usernameKey);
	if (!userVotes) return false;
	const now = Date.now();
	for (const siteKey of REWARD_SITES as readonly RewardSiteKey[]) {
		const record = userVotes.get(siteKey);
		if (!record) return false;
		if (now >= record.votedAt + VOTE_SITES[siteKey].cooldownMs) return false;
	}
	return true;
}

// Vérifie le vote serveursminecraft.org (sans tiret) par IP
// peutVoter renvoie "true" si peut encore voter, un nombre de secondes sinon → a voté
export async function checkAndRecordServeursMinecraftOrgVote(username: string, clientIp: string): Promise<boolean> {
	const siteKey: SiteKey = 'serveursminecraft';
	const userKey = username.toLowerCase();

	const userVotes = voteStore.get(userKey);
	if (userVotes) {
		const rec = userVotes.get(siteKey);
		if (rec && Date.now() < rec.votedAt + VOTE_SITES[siteKey].cooldownMs) return false;
	}

	try {
		const url = `https://www.serveursminecraft.org/sm_api/peutVoter.php?id=${SERVEURS_MC_ORG_SERVER_ID}&ip=${encodeURIComponent(clientIp)}`;
		const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
		if (!res.ok) return false;
		const text = (await res.text()).trim();
		// "true" = peut voter (n'a PAS voté), nombre de secondes = a déjà voté
		if (text === 'true') return false;
	} catch {
		return false;
	}

	recordVote(username, siteKey);
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
