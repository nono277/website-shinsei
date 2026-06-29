import type { PageServerLoad } from './$types';

export interface ClassChampion {
	username: string;
	uuid: string;
	xpTotal: number;
	gradeGameplay: string;
}

export const load: PageServerLoad = async () => {
	const champions: Record<string, ClassChampion> = {};

	try {
		const res = await fetch('http://play.playshinsei.fr:8080/leaderboard', {
			signal: AbortSignal.timeout(4000),
		});
		if (res.ok) {
			const raw: any[] = await res.json();
			const sorted = [...raw].sort(
				(a, b) => (b.xpTotal ?? b.xpCurrent ?? 0) - (a.xpTotal ?? a.xpCurrent ?? 0)
			);
			for (const p of sorted) {
				const classe = (p.classe ?? '').toLowerCase();
				if (classe && !champions[classe]) {
					champions[classe] = {
						username: p.username ?? '???',
						uuid: p.uuid ?? '',
						xpTotal: p.xpTotal ?? p.xpCurrent ?? 0,
						gradeGameplay: (p.grade ?? p.gradeGameplay ?? 'dormant').toLowerCase(),
					};
				}
			}
		}
	} catch {
		// backend indisponible
	}

	return { champions };
};
