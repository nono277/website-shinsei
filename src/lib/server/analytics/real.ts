// Calculs basés sur de vraies données : login_events (connexions site) pour la rétention
// et l'entonnoir "nouveaux joueurs", et le plugin Minecraft (mêmes endpoints que
// /classement, /classes, /profil) pour les classes et les failles.
// Tout ce qui n'a pas de source réelle correspondante retourne 0 (voir mock.ts).

import type { ClassStat, DungeonAnalytics, FunnelStep, PlayerHistoryEvent, RetentionAnalytics, RetentionPoint, ComparisonRange } from '$lib/types/analytics';
import { classes as gameClasses } from '$lib/data/classes';

const DAY_MS = 86_400_000;
const PLUGIN_BASE = 'http://play.playshinsei.fr:8080';

function dayIndex(dateStr: string): number {
	return Math.floor(new Date(dateStr + 'T00:00:00Z').getTime() / DAY_MS);
}

interface UserDays {
	dayMap: Map<string, Set<number>>;
	firstDay: Map<string, number>;
}

export function buildUserDayMap(rows: { username: string; date: string }[]): UserDays {
	const dayMap = new Map<string, Set<number>>();
	for (const r of rows) {
		const d = dayIndex(r.date);
		if (!dayMap.has(r.username)) dayMap.set(r.username, new Set());
		dayMap.get(r.username)!.add(d);
	}
	const firstDay = new Map<string, number>();
	for (const [user, days] of dayMap) {
		firstDay.set(user, Math.min(...days));
	}
	return { dayMap, firstDay };
}

function windowFor(range: ComparisonRange, todayIdx: number): { start: number; end: number } {
	switch (range) {
		case 'today': return { start: todayIdx, end: todayIdx };
		case 'yesterday': return { start: todayIdx - 1, end: todayIdx - 1 };
		case '7d': return { start: todayIdx - 6, end: todayIdx };
		case '30d': return { start: todayIdx - 29, end: todayIdx };
		case '90d': return { start: todayIdx - 89, end: todayIdx };
	}
}

function previousWindowFor(range: ComparisonRange, todayIdx: number): { start: number; end: number } {
	const { start, end } = windowFor(range, todayIdx);
	const length = end - start + 1;
	return { start: start - length, end: start - 1 };
}

function newPlayersInWindow({ firstDay }: UserDays, start: number, end: number): string[] {
	return [...firstDay.entries()].filter(([, d]) => d >= start && d <= end).map(([u]) => u);
}

function retainedCount({ dayMap, firstDay }: UserDays, users: string[], offset: number, todayIdx: number): { eligible: number; retained: number } {
	let eligible = 0;
	let retained = 0;
	for (const user of users) {
		const first = firstDay.get(user);
		if (first === undefined || first + offset > todayIdx) continue;
		eligible++;
		if (dayMap.get(user)?.has(first + offset)) retained++;
	}
	return { eligible, retained };
}

function retentionRate(userDays: UserDays, start: number, end: number, offset: number, todayIdx: number): number {
	const users = newPlayersInWindow(userDays, start, end);
	const { eligible, retained } = retainedCount(userDays, users, offset, todayIdx);
	return eligible > 0 ? Math.round((retained / eligible) * 1000) / 10 : 0;
}

export function computeRetention(rows: { username: string; date: string }[], range: ComparisonRange): RetentionAnalytics {
	const userDays = buildUserDayMap(rows);
	const todayIdx = dayIndex(new Date().toISOString().slice(0, 10));

	const current = windowFor(range, todayIdx);
	const previous = previousWindowFor(range, todayIdx);

	const d1 = retentionRate(userDays, current.start, current.end, 1, todayIdx);
	const d7 = retentionRate(userDays, current.start, current.end, 7, todayIdx);
	const d30 = retentionRate(userDays, current.start, current.end, 30, todayIdx);
	const previousD1 = retentionRate(userDays, previous.start, previous.end, 1, todayIdx);
	const previousD7 = retentionRate(userDays, previous.start, previous.end, 7, todayIdx);
	const previousD30 = retentionRate(userDays, previous.start, previous.end, 30, todayIdx);

	const points = 14;
	const history: RetentionPoint[] = Array.from({ length: points }, (_, i) => {
		const dayIdx = todayIdx - (points - 1 - i);
		const d = new Date(dayIdx * DAY_MS);
		return {
			date: d.toISOString().slice(0, 10),
			label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
			d1: retentionRate(userDays, dayIdx, dayIdx, 1, todayIdx),
			d7: retentionRate(userDays, dayIdx, dayIdx, 7, todayIdx),
			d30: retentionRate(userDays, dayIdx, dayIdx, 30, todayIdx),
		};
	});

	return { d1, d7, d30, previousD1, previousD7, previousD30, history };
}

const FUNNEL_STEP_NAMES = [
	'Nouveaux joueurs',
	'Ont choisi une classe',
	'Ont terminé le tutoriel',
	'Ont terminé la première quête',
	'Ont ouvert une faille',
	'Ont atteint le niveau 10',
	'Revenus le lendemain',
	'Revenus après 7 jours',
];

export function computeFunnel(rows: { username: string; date: string }[], range: ComparisonRange): FunnelStep[] {
	const userDays = buildUserDayMap(rows);
	const todayIdx = dayIndex(new Date().toISOString().slice(0, 10));
	const current = windowFor(range, todayIdx);
	const previous = previousWindowFor(range, todayIdx);

	const currentUsers = newPlayersInWindow(userDays, current.start, current.end);
	const previousUsers = newPlayersInWindow(userDays, previous.start, previous.end);

	const currentD1 = retainedCount(userDays, currentUsers, 1, todayIdx).retained;
	const currentD7 = retainedCount(userDays, currentUsers, 7, todayIdx).retained;
	const previousD1 = retainedCount(userDays, previousUsers, 1, todayIdx).retained;
	const previousD7 = retainedCount(userDays, previousUsers, 7, todayIdx).retained;

	const counts = [currentUsers.length, 0, 0, 0, 0, 0, currentD1, currentD7];
	const previousCounts = [previousUsers.length, 0, 0, 0, 0, 0, previousD1, previousD7];

	return FUNNEL_STEP_NAMES.map((name, i) => ({ name, count: counts[i], previousCount: previousCounts[i] }));
}

export async function fetchClassStats(fetchFn: typeof fetch): Promise<ClassStat[]> {
	const totals = new Map(gameClasses.map((c) => [c.id, { picks: 0, xpSum: 0 }]));

	try {
		const res = await fetchFn(`${PLUGIN_BASE}/leaderboard`, { signal: AbortSignal.timeout(4000) });
		if (res.ok) {
			const raw = (await res.json()) as unknown[];
			for (const p of raw as Record<string, unknown>[]) {
				const classeId = String(p.classe ?? '').toLowerCase();
				const entry = totals.get(classeId);
				if (!entry) continue;
				entry.picks++;
				entry.xpSum += Number(p.xpTotal ?? p.xpCurrent ?? 0);
			}
		}
	} catch {
		// plugin indisponible — picks/avgXp restent à 0
	}

	return gameClasses.map((c) => {
		const entry = totals.get(c.id)!;
		return {
			name: c.name,
			picks: entry.picks,
			avgPlaytimeMinutes: 0,
			deaths: 0,
			avgXp: entry.picks > 0 ? Math.round(entry.xpSum / entry.picks) : 0,
		};
	});
}

export async function fetchDungeonStats(fetchFn: typeof fetch): Promise<DungeonAnalytics> {
	let totalOpened = 0;
	try {
		const res = await fetchFn('/api/stats');
		if (res.ok) {
			const d = (await res.json()) as { failles?: number };
			totalOpened = d.failles ?? 0;
		}
	} catch {
		// plugin indisponible
	}

	return {
		totalOpened,
		avgTimeBeforeOpenMinutes: 0,
		avgCompletionMinutes: 0,
		successRatePercent: 0,
		avgPlayers: 0,
	};
}

export function buildPlayerEvents(siteLogins: { ts: number }[], mcJoins: { ts: number }[]): PlayerHistoryEvent[] {
	const events: PlayerHistoryEvent[] = [
		...siteLogins.map((l) => ({ type: 'login_site', label: 'Connexion au site', ts: l.ts })),
		...mcJoins.map((j) => ({ type: 'login_mc', label: 'Connexion serveur Minecraft', ts: j.ts })),
	];
	return events.sort((a, b) => a.ts - b.ts).slice(-30);
}

export async function fetchPlayerProfile(fetchFn: typeof fetch, username: string) {
	try {
		const res = await fetchFn(`${PLUGIN_BASE}/player/${encodeURIComponent(username)}`, { signal: AbortSignal.timeout(4000) });
		if (res.ok) {
			const raw = (await res.json()) as Record<string, unknown>;
			if (!raw.error) {
				return {
					classe: (raw.classe as string) ? (raw.classe as string).toLowerCase() : null,
					faction: (raw.faction as string) ? (raw.faction as string).toLowerCase() : null,
					grade: (raw.grade as string) ?? (raw.gradeGameplay as string) ?? null,
					level: Number(raw.level ?? 0),
					xpTotal: Number(raw.xp ?? 0),
					pvpKills: Number(raw.pvpKills ?? 0),
					dungeonsCompleted: Number(raw.dungeonsCompleted ?? 0),
					faillesFermees: Number(raw.faillesFermees ?? 0),
					totalTimeMinutes: Number(raw.playTimeMinutes ?? raw.playTime ?? 0),
				};
			}
		}
	} catch {
		// plugin indisponible
	}
	return {
		classe: null,
		faction: null,
		grade: null,
		level: 0,
		xpTotal: 0,
		pvpKills: 0,
		dungeonsCompleted: 0,
		faillesFermees: 0,
		totalTimeMinutes: 0,
	};
}
