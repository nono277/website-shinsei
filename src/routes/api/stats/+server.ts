import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	let online = 0;
	let eveilles = 0;
	let donjons = 0;
	let failles = 0;

	try {
		const mcRes = await fetch('https://api.mcsrvstat.us/2/play.playshinsei.fr', {
			signal: AbortSignal.timeout(5000)
		});
		if (mcRes.ok) {
			const mc = await mcRes.json();
			online = mc.players?.online ?? 0;
		}
	} catch {}

	try {
		const statsRes = await fetch('http://play.playshinsei.fr:8080/stats', {
			signal: AbortSignal.timeout(5000)
		});
		if (statsRes.ok) {
			const stats = await statsRes.json();
			eveilles = stats.eveilles ?? 0;
			donjons = stats.donjons ?? 0;
			failles = stats.failles ?? 0;
		}
	} catch {}

	return json({ online, eveilles, donjons, failles });
};
