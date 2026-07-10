<script lang="ts">
	import type { AnalyticsData } from '$lib/types/analytics';
	import { exportCSV, exportJSON, exportExcel, type ExportRow } from '$lib/utils/export';

	let { data }: { data: AnalyticsData } = $props();

	function flatten(): ExportRow[] {
		const rows: ExportRow[] = [];

		for (const step of data.funnel.steps) {
			rows.push({ section: 'Entonnoir', metrique: step.name, valeur: step.count, periode_precedente: step.previousCount });
		}
		for (const bucket of data.session.distribution) {
			rows.push({ section: 'Session', metrique: bucket.label, valeur: bucket.count, periode_precedente: '' });
		}
		rows.push({ section: 'Session', metrique: 'Temps moyen 1ère connexion (min)', valeur: data.session.avgFirstSessionMinutes, periode_precedente: '' });
		rows.push({ section: 'Session', metrique: 'Temps moyen joueurs fidèles (min)', valeur: data.session.avgLoyalSessionMinutes, periode_precedente: '' });
		rows.push({ section: 'Rétention', metrique: 'J+1 (%)', valeur: data.retention.d1, periode_precedente: data.retention.previousD1 });
		rows.push({ section: 'Rétention', metrique: 'J+7 (%)', valeur: data.retention.d7, periode_precedente: data.retention.previousD7 });
		rows.push({ section: 'Rétention', metrique: 'J+30 (%)', valeur: data.retention.d30, periode_precedente: data.retention.previousD30 });
		for (const point of data.churn.points) {
			rows.push({ section: 'Abandon', metrique: point.location, valeur: point.percent, periode_precedente: point.previousPercent });
		}
		for (const cls of data.classes.classes) {
			rows.push({ section: 'Classes', metrique: cls.name + ' — picks', valeur: cls.picks, periode_precedente: '' });
			rows.push({ section: 'Classes', metrique: cls.name + ' — morts', valeur: cls.deaths, periode_precedente: '' });
		}
		for (const quest of data.quests.quests) {
			rows.push({ section: 'Quêtes', metrique: quest.name + ' — démarrées', valeur: quest.startedCount, periode_precedente: '' });
			rows.push({ section: 'Quêtes', metrique: quest.name + ' — abandonnées', valeur: quest.abandonedCount, periode_precedente: '' });
		}
		rows.push({ section: 'Failles', metrique: 'Total ouvertes', valeur: data.dungeons.totalOpened, periode_precedente: '' });
		rows.push({ section: 'Failles', metrique: 'Taux de réussite (%)', valeur: data.dungeons.successRatePercent, periode_precedente: '' });

		return rows;
	}

	function handleCSV() {
		exportCSV(flatten(), `shinsei-analytics-${data.range}.csv`);
	}
	function handleExcel() {
		exportExcel(flatten(), `shinsei-analytics-${data.range}.xls`);
	}
	function handleJSON() {
		exportJSON(data, `shinsei-analytics-${data.range}.json`);
	}
</script>

<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
	<button onclick={handleCSV} style="font-family:'Share Tech Mono',monospace; font-size: 0.68rem; padding: 0.4rem 0.9rem; border-radius: 0.4rem; background: #0f0f1a; border: 1px solid #1e1530; color: #94a3b8; cursor: pointer;">⬇ CSV</button>
	<button onclick={handleJSON} style="font-family:'Share Tech Mono',monospace; font-size: 0.68rem; padding: 0.4rem 0.9rem; border-radius: 0.4rem; background: #0f0f1a; border: 1px solid #1e1530; color: #94a3b8; cursor: pointer;">⬇ JSON</button>
	<button onclick={handleExcel} style="font-family:'Share Tech Mono',monospace; font-size: 0.68rem; padding: 0.4rem 0.9rem; border-radius: 0.4rem; background: #0f0f1a; border: 1px solid #1e1530; color: #94a3b8; cursor: pointer;">⬇ Excel</button>
</div>
