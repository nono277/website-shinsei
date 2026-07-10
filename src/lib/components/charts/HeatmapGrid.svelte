<script lang="ts">
	import type { HeatmapCell } from '$lib/types/analytics';

	let {
		grid = [],
		gridWidth = 10,
		gridHeight = 6,
	}: {
		grid?: HeatmapCell[];
		gridWidth?: number;
		gridHeight?: number;
	} = $props();

	type Metric = 'deaths' | 'exits' | 'visits';

	const metrics: { id: Metric; label: string; color: string }[] = [
		{ id: 'deaths', label: 'Morts', color: '#ef4444' },
		{ id: 'exits', label: 'Sorties', color: '#f59e0b' },
		{ id: 'visits', label: 'Visites', color: '#06b6d4' },
	];

	let activeMetric = $state<Metric>('deaths');
	let hovered = $state<HeatmapCell | null>(null);

	const activeColor = $derived(metrics.find((m) => m.id === activeMetric)?.color ?? '#ef4444');
	const maxValue = $derived(Math.max(...grid.map((c) => c[activeMetric]), 1));

	function cellOpacity(cell: HeatmapCell): number {
		return Math.max(0.08, Math.min(1, cell[activeMetric] / maxValue));
	}
</script>

<div class="heatmap">
	<div class="heatmap-toggle">
		{#each metrics as m}
			<button
				onclick={() => (activeMetric = m.id)}
				class="heatmap-btn"
				style="
					background: {activeMetric === m.id ? m.color + '20' : '#0a0a12'};
					border-color: {activeMetric === m.id ? m.color + '60' : '#1e1530'};
					color: {activeMetric === m.id ? m.color : '#64748b'};
				"
			>{m.label}</button>
		{/each}
	</div>

	<div class="heatmap-grid" style="grid-template-columns: repeat({gridWidth}, 1fr);">
		{#each grid as cell}
			<div
				class="heatmap-cell"
				style="background: {activeColor}; opacity: {cellOpacity(cell)};"
				onmouseenter={() => (hovered = cell)}
				onmouseleave={() => (hovered = null)}
				role="presentation"
			></div>
		{/each}
	</div>

	<div class="heatmap-info">
		{#if hovered}
			<span class="heatmap-zone">{hovered.zoneName}</span>
			<span class="heatmap-stat">Visites: <strong>{hovered.visits}</strong></span>
			<span class="heatmap-stat">Morts: <strong>{hovered.deaths}</strong></span>
			<span class="heatmap-stat">Sorties: <strong>{hovered.exits}</strong></span>
		{:else}
			<span class="heatmap-hint">Survoler une case pour le détail de la zone</span>
		{/if}
	</div>
</div>

<style>
	.heatmap {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.heatmap-toggle {
		display: flex;
		gap: 0.4rem;
	}
	.heatmap-btn {
		font-family: 'Share Tech Mono', monospace;
		font-size: 0.65rem;
		padding: 0.25rem 0.7rem;
		border-radius: 0.35rem;
		border: 1px solid;
		cursor: pointer;
		transition: all 0.15s;
	}
	.heatmap-grid {
		display: grid;
		gap: 3px;
		width: 100%;
	}
	.heatmap-cell {
		aspect-ratio: 1;
		border-radius: 2px;
		transition: opacity 0.2s;
		cursor: pointer;
	}
	.heatmap-info {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
		min-height: 1.2rem;
		font-family: 'Share Tech Mono', monospace;
		font-size: 0.65rem;
		color: #94a3b8;
	}
	.heatmap-zone {
		font-family: 'Rajdhani', sans-serif;
		font-weight: 700;
		font-size: 0.8rem;
		color: #e2e8f0;
	}
	.heatmap-hint {
		color: #374151;
	}
	.heatmap-stat strong {
		color: #e2e8f0;
	}
</style>
