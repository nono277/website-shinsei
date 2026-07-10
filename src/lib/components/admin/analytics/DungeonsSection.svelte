<script lang="ts">
	import type { DungeonAnalytics } from '$lib/types/analytics';

	let { dungeons }: { dungeons: DungeonAnalytics } = $props();

	const tiles = $derived([
		{ label: 'Failles ouvertes', value: dungeons.totalOpened.toLocaleString('fr-FR'), color: '#38bdf8' },
		{ label: 'Avant ouverture', value: dungeons.avgTimeBeforeOpenMinutes + ' min', color: '#a78bfa' },
		{ label: 'Temps de complétion', value: dungeons.avgCompletionMinutes + ' min', color: '#eab308' },
		{ label: 'Taux de réussite', value: dungeons.successRatePercent + '%', color: '#4ade80' },
		{ label: 'Joueurs par faille', value: dungeons.avgPlayers, color: '#f472b6' },
	]);
</script>

<div style="background: #0d0d15; border: 1px solid #1e1530; border-radius: 0.75rem; padding: 1.25rem;">
	<p style="font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 1rem;">Failles</p>

	<div class="dungeons-tiles" style="display: grid; gap: 0.5rem;">
		{#each tiles as tile}
			<div style="background: #0a0a12; border: 1px solid #1e153060; border-radius: 0.5rem; padding: 0.6rem 0.75rem;">
				<div style="font-family:'Share Tech Mono',monospace; font-size: 0.6rem; color: #64748b; margin-bottom: 0.25rem;">{tile.label}</div>
				<div style="font-family:'Rajdhani',sans-serif; font-size: 1.25rem; font-weight: 900; color: {tile.color};">{tile.value}</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.dungeons-tiles {
		grid-template-columns: repeat(5, 1fr);
	}
	@media (max-width: 900px) {
		.dungeons-tiles {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	@media (max-width: 480px) {
		.dungeons-tiles {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
