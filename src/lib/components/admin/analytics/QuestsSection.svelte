<script lang="ts">
	import type { QuestAnalytics } from '$lib/types/analytics';

	let { quests }: { quests: QuestAnalytics } = $props();

	const mostStarted = $derived([...quests.quests].sort((a, b) => b.startedCount - a.startedCount)[0]);
	const mostAbandoned = $derived(
		[...quests.quests].sort((a, b) => b.abandonedCount / b.startedCount - a.abandonedCount / a.startedCount)[0]
	);
	const avgCompletion = $derived(
		Math.round(quests.quests.reduce((sum, q) => sum + q.avgCompletionMinutes, 0) / Math.max(1, quests.quests.length))
	);
	const avgProgress = $derived(
		Math.round(quests.quests.reduce((sum, q) => sum + q.avgProgressPercent, 0) / Math.max(1, quests.quests.length))
	);
</script>

<div style="background: #0d0d15; border: 1px solid #1e1530; border-radius: 0.75rem; padding: 1.25rem;">
	<p style="font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 1rem;">Quêtes</p>

	<div class="quests-tiles" style="display: grid; gap: 0.5rem; margin-bottom: 1.25rem;">
		<div style="background: #0a0a12; border: 1px solid #1e153060; border-radius: 0.5rem; padding: 0.6rem 0.75rem;">
			<div style="font-family:'Share Tech Mono',monospace; font-size: 0.6rem; color: #64748b; margin-bottom: 0.25rem;">Plus commencée</div>
			<div style="font-family:'Rajdhani',sans-serif; font-size: 1rem; font-weight: 900; color: #06b6d4;">{mostStarted?.name}</div>
		</div>
		<div style="background: #0a0a12; border: 1px solid #1e153060; border-radius: 0.5rem; padding: 0.6rem 0.75rem;">
			<div style="font-family:'Share Tech Mono',monospace; font-size: 0.6rem; color: #64748b; margin-bottom: 0.25rem;">Plus abandonnée</div>
			<div style="font-family:'Rajdhani',sans-serif; font-size: 1rem; font-weight: 900; color: #f87171;">{mostAbandoned?.name}</div>
		</div>
		<div style="background: #0a0a12; border: 1px solid #1e153060; border-radius: 0.5rem; padding: 0.6rem 0.75rem;">
			<div style="font-family:'Share Tech Mono',monospace; font-size: 0.6rem; color: #64748b; margin-bottom: 0.25rem;">Temps moyen / quête</div>
			<div style="font-family:'Rajdhani',sans-serif; font-size: 1rem; font-weight: 900; color: #eab308;">{avgCompletion} min</div>
		</div>
		<div style="background: #0a0a12; border: 1px solid #1e153060; border-radius: 0.5rem; padding: 0.6rem 0.75rem;">
			<div style="font-family:'Share Tech Mono',monospace; font-size: 0.6rem; color: #64748b; margin-bottom: 0.25rem;">Progression moyenne</div>
			<div style="font-family:'Rajdhani',sans-serif; font-size: 1rem; font-weight: 900; color: #4ade80;">{avgProgress}%</div>
		</div>
	</div>

	<div style="display: flex; flex-direction: column; gap: 0.35rem;">
		{#each quests.quests as quest}
			{@const abandonRate = Math.round((quest.abandonedCount / Math.max(1, quest.startedCount)) * 100)}
			<div style="padding: 0.4rem 0.5rem; background: #0a0a12; border-radius: 0.35rem; border: 1px solid #1e153050;">
				<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.3rem; flex-wrap: wrap; gap: 0.4rem;">
					<span style="font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; color: #e2e8f0;">{quest.name}</span>
					<span style="font-family:'Share Tech Mono',monospace; font-size: 0.6rem; color: #64748b;">
						{quest.startedCount} départs · <span style="color: {abandonRate >= 80 ? '#f87171' : '#94a3b8'};">{abandonRate}% abandon</span>
					</span>
				</div>
				<div style="height: 4px; background: #1e1530; border-radius: 9999px; overflow: hidden;">
					<div style="height: 100%; width: {quest.avgProgressPercent}%; background: linear-gradient(to right, #7c3aed, #06b6d4);"></div>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.quests-tiles {
		grid-template-columns: repeat(4, 1fr);
	}
	@media (max-width: 640px) {
		.quests-tiles {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
