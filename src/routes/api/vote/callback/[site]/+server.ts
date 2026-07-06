import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { recordVote } from '$lib/server/votes';
import { VOTE_SITES, MINECRAFT_MP_API_KEY, TOP_SERVEURS_API_KEY, type SiteKey } from '$lib/data/vote-sites';

// minecraft-mp et top-serveurs : vérification directe via leur API officielle
async function verifyViaApi(site: SiteKey, username: string): Promise<boolean> {
	try {
		if (site === 'minecraft-mp') {
			const url = `https://minecraft-mp.com/api/?object=votes&element=claim&key=${MINECRAFT_MP_API_KEY}&username=${encodeURIComponent(username)}`;
			const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
			return res.ok && (await res.text()).trim() === '1';
		}
		if (site === 'top-serveurs') {
			const key    = encodeURIComponent(TOP_SERVEURS_API_KEY);
			const pseudo = encodeURIComponent(username);
			const url    = `https://api.top-serveurs.net/v1/votes/check?token=${key}&server_token=${key}&pseudo=${pseudo}&playername=${pseudo}`;
			const res    = await fetch(url, { signal: AbortSignal.timeout(5000) });
			if (!res.ok) return false;
			return (await res.json()).success === true;
		}
		return false;
	} catch {
		return false;
	}
}

function extractUsername(data: Record<string, unknown>): string | null {
	for (const field of ['username', 'user', 'pseudo', 'player', 'player_name', 'name', 'voter']) {
		if (typeof data[field] === 'string' && data[field]) return data[field] as string;
	}
	return null;
}

async function handleCallback(site: SiteKey, username: string): Promise<Response> {
	// serveurs-minecraft.org est vérifié par IP côté /api/vote/status — pas de callback
	if (!['minecraft-mp', 'top-serveurs'].includes(site)) {
		return json({ error: 'site does not use callbacks' }, { status: 400 });
	}

	const verified = await verifyViaApi(site, username);
	if (!verified) {
		console.warn(`[VOTE] ${site} : vote non confirmé par l'API pour ${username}`);
		return json({ error: 'vote not verified' }, { status: 400 });
	}

	recordVote(username, site);
	console.log(`[VOTE] ✓ ${username} → ${site}`);
	return new Response('OK');
}

export const GET: RequestHandler = async ({ params, url }) => {
	const site = params.site as SiteKey;
	if (!(site in VOTE_SITES)) return json({ error: 'unknown site' }, { status: 404 });

	const obj: Record<string, string> = {};
	url.searchParams.forEach((v, k) => { obj[k] = v; });
	const username = extractUsername(obj);
	if (!username) return json({ error: 'no username' }, { status: 400 });

	return handleCallback(site, username);
};

export const POST: RequestHandler = async ({ params, request }) => {
	const site = params.site as SiteKey;
	if (!(site in VOTE_SITES)) return json({ error: 'unknown site' }, { status: 404 });

	let data: Record<string, unknown> = {};
	const ct = request.headers.get('content-type') ?? '';
	try {
		if (ct.includes('json')) data = await request.json();
		else { const form = await request.formData(); form.forEach((v, k) => { data[k] = v; }); }
	} catch { /* ignore */ }

	const username = extractUsername(data);
	if (!username) return json({ error: 'no username' }, { status: 400 });

	return handleCallback(site, username);
};
