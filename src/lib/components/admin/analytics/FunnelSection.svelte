<script lang="ts">
	import type { FunnelAnalytics } from '$lib/types/analytics';
	import FunnelChart from '$lib/components/charts/FunnelChart.svelte';

	let { funnel }: { funnel: FunnelAnalytics } = $props();
</script>

<div style="background: #0d0d15; border: 1px solid #1e1530; border-radius: 0.75rem; padding: 1.25rem;">
	<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
		<p style="font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin: 0;">Entonnoir de rétention — nouveaux joueurs</p>
		<span style="font-family:'Share Tech Mono',monospace; font-size: 0.65rem; color: #374151;">{funnel.steps[0]?.count ?? 0} entrées</span>
	</div>
	<FunnelChart steps={funnel.steps} color="#7c3aed" />
</div>
