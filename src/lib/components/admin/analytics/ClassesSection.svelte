<script lang="ts">
	import type { ClassAnalytics } from '$lib/types/analytics';
	import BarChart from '$lib/components/charts/BarChart.svelte';

	let { classes }: { classes: ClassAnalytics } = $props();

	const sorted = $derived([...classes.classes].sort((a, b) => b.picks - a.picks));
	const mostPicked = $derived(sorted[0]);
	const leastPicked = $derived(sorted[sorted.length - 1]);
</script>

<div style="background: #0d0d15; border: 1px solid #1e1530; border-radius: 0.75rem; padding: 1.25rem;">
	<p style="font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 1rem;">Classes jouées</p>

	<div class="classes-tiles" style="display: grid; gap: 0.5rem; margin-bottom: 1.25rem;">
		<div style="background: #0a0a12; border: 1px solid #1e153060; border-radius: 0.5rem; padding: 0.6rem 0.75rem;">
			<div style="font-family:'Share Tech Mono',monospace; font-size: 0.6rem; color: #64748b; margin-bottom: 0.25rem;">Classe la plus choisie</div>
			<div style="font-family:'Rajdhani',sans-serif; font-size: 1.15rem; font-weight: 900; color: #4ade80;">{mostPicked?.name} <span style="font-size:0.7rem; color:#64748b;">({mostPicked?.picks})</span></div>
		</div>
		<div style="background: #0a0a12; border: 1px solid #1e153060; border-radius: 0.5rem; padding: 0.6rem 0.75rem;">
			<div style="font-family:'Share Tech Mono',monospace; font-size: 0.6rem; color: #64748b; margin-bottom: 0.25rem;">Classe la moins choisie</div>
			<div style="font-family:'Rajdhani',sans-serif; font-size: 1.15rem; font-weight: 900; color: #f87171;">{leastPicked?.name} <span style="font-size:0.7rem; color:#64748b;">({leastPicked?.picks})</span></div>
		</div>
		<div style="background: #0a0a12; border: 1px solid #1e153060; border-radius: 0.5rem; padding: 0.6rem 0.75rem;">
			<div style="font-family:'Share Tech Mono',monospace; font-size: 0.6rem; color: #64748b; margin-bottom: 0.25rem;">Suppr. / recréations</div>
			<div style="font-family:'Rajdhani',sans-serif; font-size: 1.15rem; font-weight: 900; color: #f59e0b;">{classes.deletionsRecreations}</div>
		</div>
	</div>

	<BarChart data={sorted.map((c) => ({ label: c.name, value: c.picks }))} color="#a78bfa" unit="picks" height={120} />

	<div style="display: flex; flex-direction: column; gap: 0.35rem; margin-top: 1rem;">
		{#each sorted as cls}
			<div style="display: flex; align-items: center; justify-content: space-between; padding: 0.35rem 0.5rem; background: #0a0a12; border-radius: 0.35rem; border: 1px solid #1e153050; gap: 0.5rem; flex-wrap: wrap;">
				<span style="font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; color: #e2e8f0; min-width: 80px;">{cls.name}</span>
				<span style="font-family:'Share Tech Mono',monospace; font-size: 0.62rem; color: #64748b;">temps moyen <strong style="color:#94a3b8;">{cls.avgPlaytimeMinutes}min</strong></span>
				<span style="font-family:'Share Tech Mono',monospace; font-size: 0.62rem; color: #64748b;">morts <strong style="color:#f87171;">{cls.deaths}</strong></span>
				<span style="font-family:'Share Tech Mono',monospace; font-size: 0.62rem; color: #64748b;">XP moy. <strong style="color:#4ade80;">{cls.avgXp.toLocaleString('fr-FR')}</strong></span>
			</div>
		{/each}
	</div>
</div>

<style>
	.classes-tiles {
		grid-template-columns: repeat(3, 1fr);
	}
	@media (max-width: 640px) {
		.classes-tiles {
			grid-template-columns: 1fr;
		}
	}
</style>
