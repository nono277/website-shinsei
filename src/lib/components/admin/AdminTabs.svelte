<script lang="ts">
	let { active }: { active: 'overview' | 'analytics' } = $props();

	const tabs: { id: 'overview' | 'analytics'; label: string; icon: string; href: string }[] = [
		{ id: 'overview', label: "Vue d'ensemble", icon: '📊', href: '/admin' },
		{ id: 'analytics', label: 'Analytics', icon: '📈', href: '/admin/analytics' },
	];
</script>

<div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap;">
	{#each tabs as tab}
		<a
			href={tab.href}
			style="
				font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.06em;
				padding: 0.5rem 1.25rem; border-radius: 0.375rem; cursor: pointer; transition: all 0.18s;
				text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;
				background: {active === tab.id ? '#7c3aed' : '#0f0f1a'};
				color: {active === tab.id ? 'white' : '#64748b'};
				border: 1px solid {active === tab.id ? '#9f67ff' : '#1e1530'};
				box-shadow: {active === tab.id ? '0 0 14px #7c3aed40' : 'none'};
			"
		>
			<span>{tab.icon}</span> {tab.label}
		</a>
	{/each}
</div>
