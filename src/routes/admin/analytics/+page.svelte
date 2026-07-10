<script lang="ts">
	import AdminTabs from '$lib/components/admin/AdminTabs.svelte';
	import ComparisonBar from '$lib/components/admin/analytics/ComparisonBar.svelte';
	import ExportBar from '$lib/components/admin/analytics/ExportBar.svelte';
	import AlertsBanner from '$lib/components/admin/analytics/AlertsBanner.svelte';
	import FunnelSection from '$lib/components/admin/analytics/FunnelSection.svelte';
	import SessionSection from '$lib/components/admin/analytics/SessionSection.svelte';
	import RetentionSection from '$lib/components/admin/analytics/RetentionSection.svelte';
	import ChurnSection from '$lib/components/admin/analytics/ChurnSection.svelte';
	import ClassesSection from '$lib/components/admin/analytics/ClassesSection.svelte';
	import QuestsSection from '$lib/components/admin/analytics/QuestsSection.svelte';
	import DungeonsSection from '$lib/components/admin/analytics/DungeonsSection.svelte';
	import HeatmapSection from '$lib/components/admin/analytics/HeatmapSection.svelte';
	import PlayerLookupSection from '$lib/components/admin/analytics/PlayerLookupSection.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Analytics — Panel Admin — SHINSEI</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="admin-wrap">
	<AdminTabs active="analytics" />

	<!-- Header -->
	<div style="margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
		<div>
			<h1 class="analytics-title">ANALYTICS</h1>
			<div style="font-family:'Share Tech Mono',monospace; font-size: 0.72rem; color: #64748b;">
				Comportement joueurs &amp; rétention — données simulées, prêtes pour l'API Minecraft
			</div>
		</div>
		<ExportBar {data} />
	</div>

	<div style="margin-bottom: 1.25rem;">
		<ComparisonBar range={data.range} />
	</div>

	<AlertsBanner alerts={data.alerts} />

	<div style="margin-bottom: 0.75rem;">
		<FunnelSection funnel={data.funnel} />
	</div>

	<div class="analytics-grid-2" style="display: grid; gap: 0.75rem; margin-bottom: 0.75rem;">
		<SessionSection session={data.session} />
		<RetentionSection retention={data.retention} />
	</div>

	<div class="analytics-grid-2" style="display: grid; gap: 0.75rem; margin-bottom: 0.75rem;">
		<ChurnSection churn={data.churn} />
		<ClassesSection classes={data.classes} />
	</div>

	<div class="analytics-grid-2" style="display: grid; gap: 0.75rem; margin-bottom: 0.75rem;">
		<QuestsSection quests={data.quests} />
		<DungeonsSection dungeons={data.dungeons} />
	</div>

	<div style="margin-bottom: 0.75rem;">
		<HeatmapSection heatmap={data.heatmap} />
	</div>

	<div style="margin-bottom: 1.5rem;">
		<PlayerLookupSection players={data.players} />
	</div>

	<p style="font-family:'Share Tech Mono',monospace; font-size: 0.6rem; color: #1f2937; text-align: center; margin-top: 1.5rem;">
		/admin/analytics · accès restreint
	</p>
</div>

<style>
	.admin-wrap {
		min-height: 80vh;
		padding: 2rem 1.25rem;
		max-width: 64rem;
		margin: 0 auto;
	}

	.analytics-title {
		font-family: 'Rajdhani', sans-serif;
		font-size: 1.6rem;
		font-weight: 900;
		color: #7c3aed;
		text-shadow: 0 0 20px #7c3aed50;
		letter-spacing: 0.05em;
		margin: 0 0 0.3rem;
	}

	.analytics-grid-2 {
		grid-template-columns: 1fr 1fr;
	}

	@media (max-width: 640px) {
		.admin-wrap {
			padding: 1rem 0.75rem;
		}
		.analytics-title {
			font-size: 1.1rem;
		}
		.analytics-grid-2 {
			grid-template-columns: 1fr;
		}
	}
</style>
