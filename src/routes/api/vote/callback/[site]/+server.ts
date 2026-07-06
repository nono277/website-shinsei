import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { recordVote } from '$lib/server/votes';
import {
	VOTE_SITES, VOTE_TOKENS,
	MINECRAFT_MP_API_KEY, TOP_SERVEURS_API_KEY,
	type SiteKey
} from '$lib/data/vote-sites';

// Sites avec vérification via leur API officielle (aucun token custom nécessaire)
const API_VERIFIED_SITES = new Set(['minecraft-mp', 'top-serveurs']);

async function verifyViaApi(site: SiteKey, username: string): Promise<boolean> {
	try {
		let url: string;

		if (site === 'minecraft-mp') {
			url = `https://minecraft-mp.com/api/?object=votes&element=claim&key=${MINECRAFT_MP_API_KEY}&username=${encodeURIComponent(username)}`;
			const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
			if (!res.ok) return false;
			return (await res.text()).trim() === '1';
		}

		if (site === 'top-serveurs') {
			const key = encodeURIComponent(TOP_SERVEURS_API_KEY);
			const pseudo = encodeURIComponent(username);
			url = `https://api.top-serveurs.net/v1/votes/check?token=${key}&server_token=${key}&pseudo=${pseudo}&playername=${pseudo}`;
			const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
			if (!res.ok) return false;
			const data = await res.json();
			return data.success === true;
		}

		return false;
	} catch {
		return false;
	}
}

function validateToken(site: string, url: URL): boolean {
	const expected = VOTE_TOKENS[site];
	if (!expected) return false;
	return url.searchParams.get('token') === expected;
}

function extractUsername(data: Record<string, unknown>): string | null {
	for (const field of ['username', 'user', 'pseudo', 'player', 'player_name', 'name', 'voter']) {
		if (typeof data[field] === 'string' && data[field]) return data[field] as string;
	}
	return null;
}

async function handleCallback(site: SiteKey, username: string): Promise<Response> {
	if (API_VERIFIED_SITES.has(site)) {
		const verified = await verifyViaApi(site, username);
		if (!verified) {
			console.warn(`[VOTE] ${site} : vote non confirmé par l'API pour ${username}`);
			return json({ error: 'vote not verified' }, { status: 400 });
		}
	}

	recordVote(username, site);
	console.log(`[VOTE] ✓ ${username} → ${site}`);
	return new Response('OK');
}

export const GET: RequestHandler = async ({ params, url }) => {
	const site = params.site as SiteKey;
	if (!(site in VOTE_SITES)) return json({ error: 'unknown site' }, { status: 404 });

	if (!API_VERIFIED_SITES.has(site) && !validateToken(site, url)) {
		console.warn(`[VOTE] Token invalide pour ${site} (GET)`);
		return json({ error: 'unauthorized' }, { status: 401 });
	}

	const obj: Record<string, string> = {};
	url.searchParams.forEach((v, k) => { if (k !== 'token') obj[k] = v; });
	const username = extractUsername(obj);
	if (!username) return json({ error: 'no username' }, { status: 400 });

	return handleCallback(site, username);
};

export const POST: RequestHandler = async ({ params, request, url }) => {
	const site = params.site as SiteKey;
	if (!(site in VOTE_SITES)) return json({ error: 'unknown site' }, { status: 404 });

	if (!API_VERIFIED_SITES.has(site) && !validateToken(site, url)) {
		console.warn(`[VOTE] Token invalide pour ${site} (POST)`);
		return json({ error: 'unauthorized' }, { status: 401 });
	}

	let data: Record<string, unknown> = {};
	const ct = request.headers.get('content-type') ?? '';
	try {
		if (ct.includes('json')) {
			data = await request.json();
		} else {
			const form = await request.formData();
			form.forEach((v, k) => { data[k] = v; });
		}
	} catch { /* ignore */ }

	const username = extractUsername(data);
	if (!username) return json({ error: 'no username' }, { status: 400 });

	return handleCallback(site, username);
};
