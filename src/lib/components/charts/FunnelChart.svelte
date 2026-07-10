<script lang="ts">
	import type { FunnelStep } from '$lib/types/analytics';

	let { steps, color = '#7c3aed' }: { steps: FunnelStep[]; color?: string } = $props();

	const maxCount = $derived(Math.max(...steps.map((s) => s.count), 1));

	function widthPct(count: number): number {
		return Math.max(2, Math.round((count / maxCount) * 100));
	}

	function dropPct(i: number): number | null {
		if (i === 0) return null;
		const prev = steps[i - 1].count;
		if (prev <= 0) return 0;
		return Math.round((1 - steps[i].count / prev) * 1000) / 10;
	}

	function vsLastPeriodPct(step: FunnelStep): number {
		if (step.previousCount <= 0) return 0;
		return Math.round((step.count / step.previousCount - 1) * 1000) / 10;
	}
</script>

<div class="funnel">
	{#each steps as step, i}
		{@const drop = dropPct(i)}
		{@const vs = vsLastPeriodPct(step)}
		<div class="funnel-row">
			<div class="funnel-row-top">
				<span class="funnel-label">{step.name}</span>
				<div class="funnel-values">
					<span class="funnel-count" style="color: {color};">{step.count.toLocaleString('fr-FR')}</span>
					<span class="funnel-vs" style="color: {vs >= 0 ? '#4ade80' : '#f87171'};">
						{vs >= 0 ? '↑' : '↓'} {Math.abs(vs)}% vs sem. préc.
					</span>
				</div>
			</div>
			<div class="funnel-bar-wrap">
				<div class="funnel-bar" style="width: {widthPct(step.count)}%; background: linear-gradient(to right, {color}, {color}cc);"></div>
			</div>
			{#if drop !== null}
				<div class="funnel-drop">↓ perte de {drop}%</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.funnel {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.funnel-row-top {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}
	.funnel-label {
		font-family: 'Share Tech Mono', monospace;
		font-size: 0.7rem;
		color: #94a3b8;
	}
	.funnel-values {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		flex-shrink: 0;
	}
	.funnel-count {
		font-family: 'Rajdhani', sans-serif;
		font-size: 1rem;
		font-weight: 700;
	}
	.funnel-vs {
		font-family: 'Share Tech Mono', monospace;
		font-size: 0.6rem;
		white-space: nowrap;
	}
	.funnel-bar-wrap {
		height: 10px;
		background: #1e1530;
		border-radius: 9999px;
		overflow: hidden;
	}
	.funnel-bar {
		height: 100%;
		border-radius: 9999px;
		transition: width 0.3s;
	}
	.funnel-drop {
		font-family: 'Share Tech Mono', monospace;
		font-size: 0.62rem;
		color: #f87171;
		text-align: center;
		padding: 0.15rem 0 0.1rem;
	}
</style>
