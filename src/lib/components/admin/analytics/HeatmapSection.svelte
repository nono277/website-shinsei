<script lang="ts">
	import type { HeatmapAnalytics } from '$lib/types/analytics';
	import HeatmapGrid from '$lib/components/charts/HeatmapGrid.svelte';

	let { heatmap }: { heatmap: HeatmapAnalytics } = $props();
</script>

<div style="background: #0d0d15; border: 1px solid #1e1530; border-radius: 0.75rem; padding: 1.25rem;">
	<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
		<p style="font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin: 0;">Heatmap — morts, sorties, zones visitées</p>
		<span style="font-family:'Share Tech Mono',monospace; font-size: 0.6rem; color: #374151;">architecture prête pour coordonnées réelles</span>
	</div>
	<HeatmapGrid grid={heatmap.grid} gridWidth={heatmap.gridWidth} gridHeight={heatmap.gridHeight} />
</div>
