<script lang="ts">
	import type { RetentionAnalytics } from '$lib/types/analytics';
	import LineChart from '$lib/components/LineChart.svelte';

	let { retention }: { retention: RetentionAnalytics } = $props();

	function delta(current: number, previous: number): number {
		return Math.round((current - previous) * 10) / 10;
	}

	const cohorts = $derived([
		{ key: 'd1' as const, label: 'Rétention J+1', value: retention.d1, previous: retention.previousD1, color: '#06b6d4' },
		{ key: 'd7' as const, label: 'Rétention J+7', value: retention.d7, previous: retention.previousD7, color: '#7c3aed' },
		{ key: 'd30' as const, label: 'Rétention J+30', value: retention.d30, previous: retention.previousD30, color: '#22c55e' },
	]);
</script>

<div style="background: #0d0d15; border: 1px solid #1e1530; border-radius: 0.75rem; padding: 1.25rem;">
	<p style="font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 1rem;">Rétention joueurs</p>

	<div class="retention-grid" style="display: grid; gap: 0.75rem;">
		{#each cohorts as cohort}
			{@const d = delta(cohort.value, cohort.previous)}
			<div>
				<div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 0.4rem;">
					<span style="font-family:'Share Tech Mono',monospace; font-size: 0.65rem; color: #64748b;">{cohort.label}</span>
					<span style="font-family:'Share Tech Mono',monospace; font-size: 0.6rem; color: {d >= 0 ? '#4ade80' : '#f87171'};">
						{d >= 0 ? '↑' : '↓'} {Math.abs(d)} pts
					</span>
				</div>
				<div style="font-family:'Rajdhani',sans-serif; font-size: 1.6rem; font-weight: 900; color: {cohort.color}; margin-bottom: 0.5rem;">{cohort.value}%</div>
				<LineChart
					points={retention.history.map((h) => ({ label: h.label, value: h[cohort.key] }))}
					color={cohort.color}
					unit="%"
					labelEvery={4}
					height={80}
					ariaLabel={cohort.label + ' — évolution'}
				/>
			</div>
		{/each}
	</div>
</div>

<style>
	.retention-grid {
		grid-template-columns: repeat(3, 1fr);
	}
	@media (max-width: 640px) {
		.retention-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
