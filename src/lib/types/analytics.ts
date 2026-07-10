// Contrats de données pour l'onglet Analytics du panel admin.
// Ces interfaces sont volontairement découplées de toute source concrète :
// aujourd'hui elles sont remplies par des générateurs simulés
// ($lib/server/analytics/mock.ts), demain par le plugin Minecraft / son API.

export type ComparisonRange = 'today' | 'yesterday' | '7d' | '30d' | '90d';

export interface FunnelStep {
	name: string;
	count: number;
	previousCount: number;
}

export interface FunnelAnalytics {
	steps: FunnelStep[];
}

export interface SessionBucket {
	label: string;
	count: number;
}

export interface SessionAnalytics {
	avgFirstSessionMinutes: number;
	avgLoyalSessionMinutes: number;
	avgBeforeDisconnectMinutes: number;
	distribution: SessionBucket[];
}

export interface RetentionPoint {
	date: string;
	label: string;
	d1: number;
	d7: number;
	d30: number;
}

export interface RetentionAnalytics {
	d1: number;
	d7: number;
	d30: number;
	previousD1: number;
	previousD7: number;
	previousD30: number;
	history: RetentionPoint[];
}

export interface ChurnPoint {
	location: string;
	count: number;
	percent: number;
	previousPercent: number;
}

export interface ChurnAnalytics {
	points: ChurnPoint[];
}

export interface ClassStat {
	name: string;
	picks: number;
	avgPlaytimeMinutes: number;
	deaths: number;
	avgXp: number;
}

export interface ClassAnalytics {
	classes: ClassStat[];
	deletionsRecreations: number;
}

export interface QuestStat {
	name: string;
	startedCount: number;
	abandonedCount: number;
	avgCompletionMinutes: number;
	avgProgressPercent: number;
}

export interface QuestAnalytics {
	quests: QuestStat[];
}

export interface DungeonAnalytics {
	totalOpened: number;
	avgTimeBeforeOpenMinutes: number;
	avgCompletionMinutes: number;
	successRatePercent: number;
	avgPlayers: number;
}

export interface HeatmapCell {
	x: number;
	y: number;
	deaths: number;
	exits: number;
	visits: number;
	zoneName: string;
}

export interface HeatmapAnalytics {
	grid: HeatmapCell[];
	gridWidth: number;
	gridHeight: number;
}

export interface PlayerHistoryEvent {
	type: string;
	label: string;
	ts: number;
}

export interface PlayerAnalytics {
	username: string;
	uuid: string;
	events: PlayerHistoryEvent[];
	totalTimeMinutes: number;
	distanceTraveled: number;
	damageDealt: number;
	deaths: number;
	// Champs réels, remontés par le plugin Minecraft (/player/:username) quand disponible.
	classe: string | null;
	faction: string | null;
	grade: string | null;
	level: number;
	xpTotal: number;
	pvpKills: number;
	dungeonsCompleted: number;
	faillesFermees: number;
}

export interface AnalyticsAlert {
	id: string;
	severity: 'warning' | 'critical';
	message: string;
}

export interface AnalyticsPlayerRef {
	username: string;
	uuid: string;
}

export interface AnalyticsData {
	range: ComparisonRange;
	funnel: FunnelAnalytics;
	session: SessionAnalytics;
	retention: RetentionAnalytics;
	churn: ChurnAnalytics;
	classes: ClassAnalytics;
	quests: QuestAnalytics;
	dungeons: DungeonAnalytics;
	heatmap: HeatmapAnalytics;
	alerts: AnalyticsAlert[];
	players: AnalyticsPlayerRef[];
}
