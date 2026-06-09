import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export interface OnlinePlayer {
	username: string;
	uuid: string;
	grade: string; // 'eveille' | 'briseur' | 'fleau' | 'transcendant' | 'souverain' | 'abyssal'
}

const GRADE_ORDER = ['dormant', 'eveille', 'briseur', 'fleau', 'transcendant', 'souverain', 'abyssal'];

export const GET: RequestHandler = async () => {
	let online   = 0;
	let eveilles = 0;
	let donjons  = 0;
	let failles  = 0;
	let serverOnline = false;
	let players: OnlinePlayer[] = [];

	// Stats globales depuis le backend Shinsei (source de vérité)
	try {
		const statsRes = await fetch('http://play.playshinsei.fr:8080/stats', {
			signal: AbortSignal.timeout(5000)
		});
		if (statsRes.ok) {
			const stats = await statsRes.json();
			online       = stats.players  ?? 0;
			eveilles     = stats.eveilles ?? 0;
			donjons      = stats.donjons  ?? 0;
			failles      = stats.failles  ?? 0;
			serverOnline = true;
		}
	} catch {}

	// Joueurs en ligne (pour la liste live)
	try {
		const playersRes = await fetch('http://play.playshinsei.fr:8080/players/online', {
			signal: AbortSignal.timeout(3000)
		});
		if (playersRes.ok) {
			const raw: OnlinePlayer[] = await playersRes.json();
			players = raw.filter(p =>
				GRADE_ORDER.indexOf(p.grade?.toLowerCase()) >= GRADE_ORDER.indexOf('eveille')
			);
		}
	} catch {}

	// Compte total des Éveillés (online + offline) via le leaderboard
	try {
		const lbRes = await fetch('http://play.playshinsei.fr:8080/leaderboard', {
			signal: AbortSignal.timeout(4000)
		});
		if (lbRes.ok) {
			const raw: { grade?: string; gradeGameplay?: string }[] = await lbRes.json();
			eveilles = raw.filter(p => {
				const g = (p.grade ?? p.gradeGameplay ?? '').toLowerCase();
				return GRADE_ORDER.indexOf(g) >= GRADE_ORDER.indexOf('eveille');
			}).length;
		}
	} catch {}

	return json({
		status: serverOnline ? 'online' : 'offline',
		online,
		eveilles,
		donjons,
		failles,
		players,
	});
};
