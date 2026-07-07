import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

// Classement des voteurs depuis le backend Minecraft (persistant).
const TOP_URL = env.VOTE_TOP_URL ?? 'http://play.playshinsei.fr:8080/vote/top?limit=10';

export const GET: RequestHandler = async () => {
	try {
		const res = await fetch(TOP_URL, { signal: AbortSignal.timeout(4000) });
		if (res.ok) {
			const top = await res.json();
			return json({ top: Array.isArray(top) ? top : [] });
		}
	} catch {
		/* backend indisponible → liste vide */
	}
	return json({ top: [] });
};
