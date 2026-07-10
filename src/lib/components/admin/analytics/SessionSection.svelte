<script lang="ts">
	import type { SessionAnalytics } from '$lib/types/analytics';
	import BarChart from '$lib/components/charts/BarChart.svelte';

	let { session }: { session: SessionAnalytics } = $props();

	const tiles = $derived([
		{ label: '1ère connexion', value: session.avgFirstSessionMinutes, color: '#06b6d4' },
		{ label: 'Joueurs fidèles', value: session.avgLoyalSessionMinutes, color: '#22c55e' },
		{ label: 'Avant déconnexion', value: session.avgBeforeDisconnectMinutes, color: '#f59e0b' },
	]);
</script>

<div style="background: #0d0d15; border: 1px solid #1e1530; border-radius: 0.75rem; padding: 1.25rem;">
	<p style="font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 1rem;">Temps de session</p>

	<div class="session-tiles" style="display: grid; gap: 0.5rem; margin-bottom: 1.25rem;">
		{#each tiles as tile}
			<div style="background: #0a0a12; border: 1px solid #1e153060; border-radius: 0.5rem; padding: 0.6rem 0.75rem;">
				<div style="font-family:'Share Tech Mono',monospace; font-size: 0.6rem; color: #64748b; margin-bottom: 0.25rem;">{tile.label}</div>
				<div style="font-family:'Rajdhani',sans-serif; font-size: 1.3rem; font-weight: 900; color: {tile.color};">{tile.value} min</div>
			</div>
		{/each}
	</div>

	<BarChart data={session.distribution.map((d) => ({ label: d.label, value: d.count }))} color="#8b5cf6" unit="joueurs" height={140} />
</div>

<style>
	.session-tiles {
		grid-template-columns: repeat(3, 1fr);
	}
	@media (max-width: 480px) {
		.session-tiles {
			grid-template-columns: 1fr;
		}
	}
</style>
