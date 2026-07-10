<script lang="ts">
	type BarPoint = { label: string; value: number };

	let {
		data = [],
		color = '#8b5cf6',
		height = 140,
		unit = '',
	}: {
		data?: BarPoint[];
		color?: string;
		height?: number;
		unit?: string;
	} = $props();

	const maxValue = $derived(Math.max(...data.map((d) => d.value), 1));

	function barHeightPct(value: number): number {
		return Math.max(3, Math.round((value / maxValue) * 100));
	}
</script>

<div class="bar-chart" style="height: {height}px;">
	{#each data as point}
		<div class="bar-col">
			<span class="bar-value" style="color: {color};">{point.value.toLocaleString('fr-FR')}{unit ? ' ' + unit : ''}</span>
			<div class="bar-track">
				<div class="bar-fill" style="height: {barHeightPct(point.value)}%; background: linear-gradient(to top, {color}, {color}80);"></div>
			</div>
			<span class="bar-label">{point.label}</span>
		</div>
	{/each}
</div>

<style>
	.bar-chart {
		display: flex;
		align-items: flex-end;
		gap: 0.6rem;
		padding-top: 1.5rem;
	}
	.bar-col {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		min-width: 0;
	}
	.bar-value {
		font-family: 'Rajdhani', sans-serif;
		font-size: 0.75rem;
		font-weight: 700;
		margin-bottom: 0.3rem;
		white-space: nowrap;
	}
	.bar-track {
		flex: 1;
		width: 100%;
		max-width: 34px;
		display: flex;
		align-items: flex-end;
		background: #1e1530;
		border-radius: 0.3rem 0.3rem 0.2rem 0.2rem;
		overflow: hidden;
	}
	.bar-fill {
		width: 100%;
		border-radius: 0.3rem 0.3rem 0 0;
		transition: height 0.3s;
	}
	.bar-label {
		font-family: 'Share Tech Mono', monospace;
		font-size: 0.6rem;
		color: #475569;
		margin-top: 0.35rem;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
	}
</style>
