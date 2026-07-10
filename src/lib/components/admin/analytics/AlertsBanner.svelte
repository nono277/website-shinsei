<script lang="ts">
	import type { AnalyticsAlert } from '$lib/types/analytics';

	let { alerts }: { alerts: AnalyticsAlert[] } = $props();
</script>

<div style="background: #0d0d15; border: 1px solid #1e1530; border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1rem;">
	<p style="font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 0.75rem;">Alertes</p>

	{#if alerts.length === 0}
		<div style="display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 0.75rem; background: #051a0e; border-radius: 0.4rem; font-family:'Share Tech Mono',monospace; font-size: 0.7rem; color: #4ade80;">
			<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
			Aucune alerte active — tous les indicateurs sont dans les seuils normaux
		</div>
	{:else}
		<div style="display: flex; flex-direction: column; gap: 0.4rem;">
			{#each alerts as alert}
				<div style="
					display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; border-radius: 0.4rem;
					background: {alert.severity === 'critical' ? '#1c0a09' : '#1c1203'};
					border: 1px solid {alert.severity === 'critical' ? '#ef444430' : '#f59e0b30'};
				">
					<span>{alert.severity === 'critical' ? '⚠️' : '⚠'}</span>
					<span style="font-family:'Share Tech Mono',monospace; font-size: 0.72rem; color: {alert.severity === 'critical' ? '#f87171' : '#fbbf24'};">{alert.message}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>
