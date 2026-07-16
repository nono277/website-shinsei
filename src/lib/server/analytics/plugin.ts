// Consommation de l'endpoint GET /analytics du plugin ShinseiCore (StatsHttpServer) :
// sessions réelles (durées join→quit), quêtes (timestamps _meta), failles (durée/participants/
// expirations), heatmap (grille 10×6 échantillonnée en jeu) et la liste des joueurs MC avec
// leur progression (classe, tutoriel, quêtes, failles, niveau max, morts, playtime).
// Le funnel, le churn et les stats de classes sont dérivés ici de cette liste.

import type {
	ChurnAnalytics, ClassAnalytics, ComparisonRange, DungeonAnalytics, FunnelStep,
	HeatmapAnalytics, QuestAnalytics, SessionAnalytics,
} from '$lib/types/analytics';
import { classes as gameClasses } from '$lib/data/classes';

const PLUGIN_BASE = 'http://play.playshinsei.fr:8080';
const DAY_MS = 86_400_000;

export interface PluginPlayer {
	uuid: string;
	username: string;
	classe: string | null;
	difficulte: string | null;
	level: number;
	maxLevel: number;
	xp: number;
	firstQuestDone: boolean;
	questsCompleted: number;
	deaths: number;
	pvpDeaths: number;
	playTimeMinutes: number;
	faillesFermees: number;
	firstJoin: number;   // epoch ms, 0 = inconnu
	lastSeen: number;    // epoch ms, 0 = inconnu
}

export interface PluginAnalytics {
	sessions: SessionAnalytics;
	failles: {
		opened: number;
		closed: number;
		expired: number;
		avgCompletionMinutes: number;
		avgPlayers: number;
		avgTimeBeforeOpenMinutes: number;
		successRatePercent: number;
	};
	heatmap: {
		gridWidth: number;
		gridHeight: number;
		world: string;
		cells: { x: number; y: number; zoneName: string; visits: number; deaths: number; exits: number }[];
	};
	players: PluginPlayer[];
	quests: {
		id: string;
		name: string;
		type: string;
		started: number;
		completed: number;
		claimed: number;
		abandoned: number;
		avgCompletionMinutes: number;
		avgProgressPercent: number;
	}[];
}

export async function fetchPluginAnalytics(fetchFn: typeof fetch): Promise<PluginAnalytics | null> {
	try {
		const res = await fetchFn(`${PLUGIN_BASE}/analytics`, { signal: AbortSignal.timeout(6000) });
		if (!res.ok) return null;
		const data = (await res.json()) as PluginAnalytics;
		if (!data || !Array.isArray(data.players)) return null;
		return data;
	} catch {
		return null;   // plugin injoignable → l'appelant retombe sur les structures à zéro
	}
}

export function mapSession(pa: PluginAnalytics): SessionAnalytics {
	return pa.sessions;
}

export function mapQuests(pa: PluginAnalytics): QuestAnalytics {
	return {
		quests: pa.quests.map((q) => ({
			name: q.name,
			startedCount: q.started,
			abandonedCount: q.abandoned,
			avgCompletionMinutes: q.avgCompletionMinutes,
			avgProgressPercent: q.avgProgressPercent,
		})),
	};
}

export function mapHeatmap(pa: PluginAnalytics): HeatmapAnalytics {
	return {
		gridWidth: pa.heatmap.gridWidth,
		gridHeight: pa.heatmap.gridHeight,
		grid: pa.heatmap.cells.map((c) => ({
			x: c.x, y: c.y, zoneName: c.zoneName, visits: c.visits, deaths: c.deaths, exits: c.exits,
		})),
	};
}

export function mapDungeons(pa: PluginAnalytics): DungeonAnalytics {
	return {
		totalOpened: pa.failles.opened,
		avgTimeBeforeOpenMinutes: pa.failles.avgTimeBeforeOpenMinutes,
		avgCompletionMinutes: pa.failles.avgCompletionMinutes,
		successRatePercent: pa.failles.successRatePercent,
		avgPlayers: pa.failles.avgPlayers,
	};
}

/** Stats par classe dérivées des joueurs MC (picks, playtime moyen, morts, XP moyen). */
export function computeClassesFromPlayers(players: PluginPlayer[]): ClassAnalytics {
	const byId = new Map(gameClasses.map((c) => [c.id, { picks: 0, playtime: 0, deaths: 0, xp: 0 }]));
	for (const p of players) {
		const entry = p.classe ? byId.get(p.classe.toLowerCase()) : undefined;
		if (!entry) continue;
		entry.picks++;
		entry.playtime += p.playTimeMinutes;
		entry.deaths += p.deaths;
		entry.xp += p.xp;
	}
	return {
		classes: gameClasses.map((c) => {
			const e = byId.get(c.id)!;
			return {
				name: c.name,
				picks: e.picks,
				avgPlaytimeMinutes: e.picks > 0 ? Math.round(e.playtime / e.picks) : 0,
				deaths: e.deaths,
				avgXp: e.picks > 0 ? Math.round(e.xp / e.picks) : 0,
			};
		}),
		deletionsRecreations: 0,
	};
}

// Étape de progression la plus avancée ATTEINTE par un joueur — le churn compte où les
// joueurs partis (14 j sans connexion MC) se sont arrêtés.
const CHURN_STAGES = [
	'Arrivée (intro)',
	'Choix de classe',
	'Tutoriel (Premiers pas)',
	'Première quête',
	'Première faille',
	'Avant le niveau 10',
	'Niveau 10+',
] as const;

function churnStage(p: PluginPlayer): number {
	if (p.difficulte == null) return 0;
	if (p.classe == null) return 1;
	if (!p.firstQuestDone) return 2;
	if (p.questsCompleted === 0) return 3;
	if (p.faillesFermees === 0) return 4;
	if (p.maxLevel < 10) return 5;
	return 6;
}

export function computeChurn(players: PluginPlayer[]): ChurnAnalytics {
	const now = Date.now();
	const cutoff14 = now - 14 * DAY_MS;
	const cutoff28 = now - 28 * DAY_MS;

	const counts = new Array(CHURN_STAGES.length).fill(0);
	const prevCounts = new Array(CHURN_STAGES.length).fill(0);
	let total = 0;
	let prevTotal = 0;
	for (const p of players) {
		if (p.lastSeen <= 0) continue;
		if (p.lastSeen < cutoff14) { counts[churnStage(p)]++; total++; }
		// Cohorte « période précédente » : partis il y a 14 à 28 jours.
		if (p.lastSeen < cutoff14 && p.lastSeen >= cutoff28) { prevCounts[churnStage(p)]++; prevTotal++; }
	}

	return {
		points: CHURN_STAGES.map((location, i) => ({
			location,
			count: counts[i],
			percent: total > 0 ? Math.round((counts[i] / total) * 1000) / 10 : 0,
			previousPercent: prevTotal > 0 ? Math.round((prevCounts[i] / prevTotal) * 1000) / 10 : 0,
		})),
	};
}

// ── Funnel basé sur les VRAIS joueurs MC ─────────────────────────────────────
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

function dayIdx(ms: number): number {
	return Math.floor(ms / DAY_MS);
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

function funnelCounts(
	cohort: PluginPlayer[],
	joinDays: Map<string, Set<number>>,
): number[] {
	let classe = 0, tuto = 0, quete = 0, faille = 0, lvl10 = 0, d1 = 0, d7 = 0;
	for (const p of cohort) {
		if (p.classe != null) classe++;
		if (p.firstQuestDone) tuto++;
		if (p.questsCompleted > 0) quete++;
		if (p.faillesFermees > 0) faille++;
		if (p.maxLevel >= 10) lvl10++;
		const days = joinDays.get(p.uuid);
		if (days && p.firstJoin > 0) {
			const first = dayIdx(p.firstJoin);
			if (days.has(first + 1)) d1++;
			for (const d of days) if (d >= first + 7) { d7++; break; }
		}
	}
	return [cohort.length, classe, tuto, quete, faille, lvl10, d1, d7];
}

/**
 * Funnel sur les nouveaux joueurs MC de la période (firstJoin plugin). Les retours J+1/J+7
 * viennent de la table mc_join_events du site (tracker), jointe par uuid.
 */
export function computeMcFunnel(
	players: PluginPlayer[],
	range: ComparisonRange,
	joinRows: { uuid: string; date: string }[],
): FunnelStep[] {
	const todayIdx = dayIdx(Date.now());
	const current = windowFor(range, todayIdx);
	const length = current.end - current.start + 1;
	const previous = { start: current.start - length, end: current.start - 1 };

	const joinDays = new Map<string, Set<number>>();
	for (const r of joinRows) {
		const d = dayIdx(new Date(r.date + 'T00:00:00Z').getTime());
		if (!joinDays.has(r.uuid)) joinDays.set(r.uuid, new Set());
		joinDays.get(r.uuid)!.add(d);
	}

	const inWindow = (p: PluginPlayer, w: { start: number; end: number }) =>
		p.firstJoin > 0 && dayIdx(p.firstJoin) >= w.start && dayIdx(p.firstJoin) <= w.end;

	const counts = funnelCounts(players.filter((p) => inWindow(p, current)), joinDays);
	const previousCounts = funnelCounts(players.filter((p) => inWindow(p, previous)), joinDays);

	return FUNNEL_STEP_NAMES.map((name, i) => ({ name, count: counts[i], previousCount: previousCounts[i] }));
}
