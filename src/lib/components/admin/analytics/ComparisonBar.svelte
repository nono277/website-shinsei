<script lang="ts">
	import type { ComparisonRange } from '$lib/types/analytics';

	let { range }: { range: ComparisonRange } = $props();

	const options: { id: ComparisonRange; label: string }[] = [
		{ id: 'today', label: "Aujourd'hui" },
		{ id: 'yesterday', label: 'Hier' },
		{ id: '7d', label: '7 jours' },
		{ id: '30d', label: '30 jours' },
		{ id: '90d', label: '90 jours' },
	];
</script>

<div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
	{#each options as opt}
		<a
			href="/admin/analytics?range={opt.id}"
			style="
				font-family:'Share Tech Mono',monospace; font-size: 0.68rem; font-weight: 700;
				padding: 0.4rem 0.85rem; border-radius: 0.4rem; cursor: pointer; transition: all 0.15s;
				text-decoration: none;
				background: {range === opt.id ? '#7c3aed' : '#0f0f1a'};
				color: {range === opt.id ? 'white' : '#64748b'};
				border: 1px solid {range === opt.id ? '#9f67ff' : '#1e1530'};
			"
		>{opt.label}</a>
	{/each}
</div>
