<script lang="ts">
	import type { AnalyticsPlayerRef, PlayerAnalytics } from '$lib/types/analytics';

	let { players }: { players: AnalyticsPlayerRef[] } = $props();

	let selectedUsername = $state(players[0]?.username ?? '');
	let loading = $state(false);
	let player = $state<PlayerAnalytics | null>(null);

	async function lookup() {
		const ref = players.find((p) => p.username === selectedUsername);
		if (!ref) return;
		loading = true;
		player = null;
		try {
			const r = await fetch(`/api/admin/analytics/player?username=${encodeURIComponent(ref.username)}&uuid=${encodeURIComponent(ref.uuid)}`);
			if (r.ok) player = await r.json();
		} catch {
			/* offline */
		} finally {
			loading = false;
		}
	}

	function fmtTs(ts: number): string {
		return new Date(ts).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
	}
</script>

<div style="background: #0d0d15; border: 1px solid #1e1530; border-radius: 0.75rem; padding: 1.25rem;">
	<p style="font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 1rem;">Fiche joueur</p>

	{#if players.length === 0}
		<p style="font-family:'Share Tech Mono',monospace; font-size: 0.72rem; color: #374151;">Aucun joueur enregistré</p>
	{:else}
		<div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
			<select
				bind:value={selectedUsername}
				style="flex: 1; min-width: 160px; padding: 0.45rem 0.6rem; background: #13131e; border: 1px solid #2a1f3d; border-radius: 0.45rem; color: #e2e8f0; font-family:'Share Tech Mono',monospace; font-size: 0.75rem; outline: none;"
			>
				{#each players as p}
					<option value={p.username}>{p.username}</option>
				{/each}
			</select>
			<button
				onclick={lookup}
				disabled={loading}
				style="font-family:'Rajdhani',sans-serif; font-size: 0.8rem; font-weight: 700; padding: 0.45rem 1.1rem; border-radius: 0.45rem; background: #150d2e; border: 1px solid #7c3aed50; color: #a78bfa; cursor: pointer;"
			>{loading ? '...' : 'Rechercher'}</button>
		</div>

		{#if player}
			<div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem;">
				<img src="https://crafatar.com/avatars/{player.uuid}?size=32&overlay" alt={player.username} width="32" height="32" style="border-radius: 4px; image-rendering: pixelated;" />
				<span style="font-family:'Rajdhani',sans-serif; font-size: 1.1rem; font-weight: 900; color: #e2e8f0;">{player.username}</span>
				{#if player.grade}
					<span style="font-family:'Share Tech Mono',monospace; font-size: 0.65rem; padding: 0.15rem 0.5rem; border-radius: 9999px; background: #150d2e; border: 1px solid #7c3aed40; color: #a78bfa; text-transform: capitalize;">{player.grade}</span>
				{/if}
			</div>

			<div class="player-stats" style="display: grid; gap: 0.5rem; margin-bottom: 1rem;">
				<div style="background: #0a0a12; border: 1px solid #1e153060; border-radius: 0.5rem; padding: 0.5rem 0.7rem;">
					<div style="font-family:'Share Tech Mono',monospace; font-size: 0.58rem; color: #64748b;">Classe</div>
					<div style="font-family:'Rajdhani',sans-serif; font-size: 1.05rem; font-weight: 900; color: #a78bfa; text-transform: capitalize;">{player.classe ?? '—'}</div>
				</div>
				<div style="background: #0a0a12; border: 1px solid #1e153060; border-radius: 0.5rem; padding: 0.5rem 0.7rem;">
					<div style="font-family:'Share Tech Mono',monospace; font-size: 0.58rem; color: #64748b;">Niveau / XP</div>
					<div style="font-family:'Rajdhani',sans-serif; font-size: 1.05rem; font-weight: 900; color: #06b6d4;">{player.level} · {player.xpTotal.toLocaleString('fr-FR')}</div>
				</div>
				<div style="background: #0a0a12; border: 1px solid #1e153060; border-radius: 0.5rem; padding: 0.5rem 0.7rem;">
					<div style="font-family:'Share Tech Mono',monospace; font-size: 0.58rem; color: #64748b;">Temps de jeu</div>
					<div style="font-family:'Rajdhani',sans-serif; font-size: 1.05rem; font-weight: 900; color: #4ade80;">{player.totalTimeMinutes} min</div>
				</div>
				<div style="background: #0a0a12; border: 1px solid #1e153060; border-radius: 0.5rem; padding: 0.5rem 0.7rem;">
					<div style="font-family:'Share Tech Mono',monospace; font-size: 0.58rem; color: #64748b;">PvP kills</div>
					<div style="font-family:'Rajdhani',sans-serif; font-size: 1.05rem; font-weight: 900; color: #f59e0b;">{player.pvpKills}</div>
				</div>
				<div style="background: #0a0a12; border: 1px solid #1e153060; border-radius: 0.5rem; padding: 0.5rem 0.7rem;">
					<div style="font-family:'Share Tech Mono',monospace; font-size: 0.58rem; color: #64748b;">Donjons terminés</div>
					<div style="font-family:'Rajdhani',sans-serif; font-size: 1.05rem; font-weight: 900; color: #38bdf8;">{player.dungeonsCompleted}</div>
				</div>
				<div style="background: #0a0a12; border: 1px solid #1e153060; border-radius: 0.5rem; padding: 0.5rem 0.7rem;">
					<div style="font-family:'Share Tech Mono',monospace; font-size: 0.58rem; color: #64748b;">Failles fermées</div>
					<div style="font-family:'Rajdhani',sans-serif; font-size: 1.05rem; font-weight: 900; color: #c084fc;">{player.faillesFermees}</div>
				</div>
				<div style="background: #0a0a12; border: 1px solid #1e153060; border-radius: 0.5rem; padding: 0.5rem 0.7rem;">
					<div style="font-family:'Share Tech Mono',monospace; font-size: 0.58rem; color: #64748b;">Faction</div>
					<div style="font-family:'Rajdhani',sans-serif; font-size: 1.05rem; font-weight: 900; color: #e2e8f0; text-transform: capitalize;">{player.faction ?? '—'}</div>
				</div>
				<div style="background: #0a0a12; border: 1px solid #1e153060; border-radius: 0.5rem; padding: 0.5rem 0.7rem;">
					<div style="font-family:'Share Tech Mono',monospace; font-size: 0.58rem; color: #64748b;">Morts</div>
					<div style="font-family:'Rajdhani',sans-serif; font-size: 1.05rem; font-weight: 900; color: #f87171;">{player.deaths}</div>
				</div>
			</div>

			<div style="display: flex; flex-direction: column; gap: 0.3rem;">
				{#each player.events as event, i}
					<div style="display: flex; align-items: center; gap: 0.6rem;">
						<div style="width: 6px; height: 6px; border-radius: 50%; background: #7c3aed; flex-shrink: 0;"></div>
						<span style="font-family:'Rajdhani',sans-serif; font-size: 0.82rem; font-weight: 700; color: #e2e8f0; flex: 1;">{event.label}</span>
						<span style="font-family:'Share Tech Mono',monospace; font-size: 0.6rem; color: #475569;">{fmtTs(event.ts)}</span>
					</div>
					{#if i < player.events.length - 1}
						<div style="width: 1px; height: 10px; background: #1e1530; margin-left: 2px;"></div>
					{/if}
				{/each}
			</div>
		{:else if !loading}
			<p style="font-family:'Share Tech Mono',monospace; font-size: 0.7rem; color: #374151;">Sélectionne un joueur puis clique sur "Rechercher"</p>
		{/if}
	{/if}
</div>

<style>
	.player-stats {
		grid-template-columns: repeat(4, 1fr);
	}
	@media (max-width: 640px) {
		.player-stats {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
