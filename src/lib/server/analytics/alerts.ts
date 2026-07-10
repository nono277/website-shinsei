import type { AnalyticsAlert, ChurnAnalytics, ClassAnalytics, QuestAnalytics, RetentionAnalytics, SessionAnalytics } from '$lib/types/analytics';

export function computeAlerts(data: {
	retention: RetentionAnalytics;
	quests: QuestAnalytics;
	classes: ClassAnalytics;
	session: SessionAnalytics;
	churn: ChurnAnalytics;
}): AnalyticsAlert[] {
	const alerts: AnalyticsAlert[] = [];

	const d1Drop = data.retention.previousD1 > 0
		? (1 - data.retention.d1 / data.retention.previousD1) * 100
		: 0;
	if (d1Drop >= 20) {
		alerts.push({
			id: 'retention-d1-drop',
			severity: 'critical',
			message: `La rétention J+1 chute de ${Math.round(d1Drop)} % par rapport à la période précédente`,
		});
	}

	for (const quest of data.quests.quests) {
		const abandonRate = quest.startedCount > 0 ? (quest.abandonedCount / quest.startedCount) * 100 : 0;
		if (abandonRate >= 80) {
			alerts.push({
				id: `quest-abandon-${quest.name}`,
				severity: 'warning',
				message: `La quête "${quest.name}" possède ${Math.round(abandonRate)} % d'abandon`,
			});
		}
	}

	const totalPicks = data.classes.classes.reduce((sum, c) => sum + c.picks, 0);
	for (const cls of data.classes.classes) {
		const share = totalPicks > 0 ? (cls.picks / totalPicks) * 100 : 0;
		if (share >= 75) {
			alerts.push({
				id: `class-share-${cls.name}`,
				severity: 'warning',
				message: `La classe "${cls.name}" est choisie par ${Math.round(share)} % des joueurs`,
			});
		}
	}

	if (data.session.avgFirstSessionMinutes > 0 && data.session.avgFirstSessionMinutes < 10) {
		alerts.push({
			id: 'session-too-short',
			severity: 'critical',
			message: `Temps moyen de première session inférieur à 10 minutes (${data.session.avgFirstSessionMinutes} min)`,
		});
	}

	for (const point of data.churn.points) {
		if (point.percent >= 25) {
			alerts.push({
				id: `churn-${point.location}`,
				severity: 'warning',
				message: `${Math.round(point.percent)} % des abandons se produisent à l'étape "${point.location}"`,
			});
		}
	}

	return alerts;
}
