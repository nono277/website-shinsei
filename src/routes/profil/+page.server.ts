import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

function normalizeFaction(raw: string): string | null {
	const s = raw.toLowerCase().replace(/[^a-z]/g, '');
	if (s.includes('ordre'))    return 'ordre';
	if (s.includes('fracture')) return 'fractures';
	if (s.includes('nomade'))   return 'nomades';
	return null;
}

export interface PlayerProfile {
	username: string;
	uuid: string;
	gradeShop: string;
	gradeGameplay: string;
	gradeColor: string | null;
	level: number;
	xpTotal: number;
	faction: string;
	classe: string;
	playTime: number;
	dungeonsCompleted: number;
	pvpKills: number;
	faillesFermees: number;
	xpCurrent: number;
	xpForNext: number;
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/connexion');

	let profile: PlayerProfile | null = null;
	try {
		const res = await fetch(
			`http://play.playshinsei.fr:8080/player/${encodeURIComponent(locals.user.username)}`,
			{ signal: AbortSignal.timeout(4000) }
		);
		if (res.ok) {
			const raw = await res.json();
			if (!raw.error) {
				profile = {
					username:          raw.username ?? locals.user.username,
					uuid:              raw.uuid     ?? locals.user.uuid,
					gradeGameplay:     (raw.grade ?? raw.gradeGameplay ?? 'dormant').toLowerCase(),
					gradeShop:         (raw.gradeBoutique ?? raw.gradeShop ?? '').toLowerCase() || null,
					gradeColor:        raw.gradeColor ?? null,
					level:             raw.level ?? 0,
					xpTotal:           raw.xp ?? 0,
					faction:           normalizeFaction(raw.faction ?? raw.faction ?? ''),
					classe:            (raw.classe ?? '').toLowerCase() || null,
					playTime:          raw.playTimeMinutes ?? raw.playTime ?? 0,
					dungeonsCompleted: raw.dungeonsCompleted ?? 0,
					faillesFermees:    raw.faillesFermees ?? 0,
					pvpKills:          raw.pvpKills ?? 0,
					xpCurrent:         raw.xpInGrade   ?? raw.xpCurrent  ?? 0,
					xpForNext:         raw.xpForNextGrade ?? raw.xpForNext ?? 0,
				} as PlayerProfile;
			}
		}
	} catch {
		// backend indisponible — on affiche les placeholders
	}

	return {
		user: {
			uuid:        locals.user.uuid,
			username:    locals.user.username,
			skinUrl:     locals.user.skinUrl,
			capeUrl:     locals.user.capeUrl,
			skinVariant: locals.user.skinVariant ?? 'classic',
		},
		profile,
	};
};
