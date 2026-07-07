import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { getTopVoters } from '$lib/server/votes';

export interface LeaderboardEntry {
	rank: number;
	username: string;
	uuid: string;
	gradeGameplay: string;
	classe: string | null;
	faction: string | null;
	xpTotal: number;
	pvpKills: number;
	dungeonsCompleted: number;
	faillesFermees: number;
}

export interface LeaderboardData {
	xp: LeaderboardEntry[];
	pvp: LeaderboardEntry[];
	donjons: LeaderboardEntry[];
	failles: LeaderboardEntry[];
}

export const load: PageServerLoad = async () => {
	let data: LeaderboardData | null = null;

	try {
		const res = await fetch('http://play.playshinsei.fr:8080/leaderboard', {
			signal: AbortSignal.timeout(4000),
		});
		if (res.ok) {
			const raw: unknown[] = await res.json();
			const entries: LeaderboardEntry[] = raw.map((p: any, i) => ({
				rank: i + 1,
				username: p.username ?? '???',
				uuid: p.uuid ?? '',
				gradeGameplay: (p.grade ?? p.gradeGameplay ?? 'dormant').toLowerCase(),
				classe: (p.classe ?? '').toLowerCase() || null,
				faction: (p.faction ?? '').toLowerCase() || null,
				xpTotal: p.xpTotal ?? p.xpCurrent ?? 0,
				pvpKills: p.pvpKills ?? 0,
				dungeonsCompleted: p.dungeonsCompleted ?? 0,
				faillesFermees: p.faillesFermees ?? 0,
			}));

			const sort = (key: keyof LeaderboardEntry) =>
				[...entries]
					.sort((a, b) => (b[key] as number) - (a[key] as number))
					.map((e, i) => ({ ...e, rank: i + 1 }));

			data = {
				xp: sort('xpTotal'),
				pvp: sort('pvpKills'),
				donjons: sort('dungeonsCompleted'),
				failles: sort('faillesFermees'),
			};
		}
	} catch {
		// backend indisponible
	}

	const topVoters = getTopVoters(30);

	return { leaderboard: data, topVoters };
};
