<script lang="ts">
	import type { ChurnAnalytics } from '$lib/types/analytics';

	let { churn }: { churn: ChurnAnalytics } = $props();

	const sorted = $derived([...churn.points].sort((a, b) => b.percent - a.percent));
	const maxPercent = $derived(Math.max(...churn.points.map((p) => p.percent), 1));

	function evolution(point: (typeof churn.points)[number]): number {
		return Math.round((point.percent - point.previousPercent) * 10) / 10;
	}
</script>

<div style="background: #0d0d15; border: 1px solid #1e1530; border-radius: 0.75rem; padding: 1.25rem;">
	<p style="font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 1rem;">Où les joueurs abandonnent</p>

	<div style="display: flex; flex-direction: column; gap: 0.6rem;">
		{#each sorted as point}
			{@const evo = evolution(point)}
			<div>
				<div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 0.25rem;">
					<span style="font-family:'Share Tech Mono',monospace; font-size: 0.7rem; color: #94a3b8;">{point.location}</span>
					<div style="display: flex; align-items: baseline; gap: 0.6rem;">
						<span style="font-family:'Share Tech Mono',monospace; font-size: 0.62rem; color: #475569;">{point.count} joueurs</span>
						<span style="font-family:'Rajdhani',sans-serif; font-size: 0.9rem; font-weight: 700; color: #f87171;">{point.percent}%</span>
						<span style="font-family:'Share Tech Mono',monospace; font-size: 0.6rem; color: {evo <= 0 ? '#4ade80' : '#f87171'};">
							{evo <= 0 ? '↓' : '↑'} {Math.abs(evo)}
						</span>
					</div>
				</div>
				<div style="height: 5px; background: #1e1530; border-radius: 9999px; overflow: hidden;">
					<div style="height: 100%; width: {Math.round((point.percent / maxPercent) * 100)}%; background: linear-gradient(to right, #7f1d1d, #ef4444);"></div>
				</div>
			</div>
		{/each}
	</div>
</div>
