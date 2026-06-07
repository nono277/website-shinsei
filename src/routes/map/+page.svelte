<script lang="ts">
	import WorldMap from '$lib/components/WorldMap.svelte';
	import { mapMarkers } from '$lib/data/map';

	const safeCount = mapMarkers.filter(m => m.type === 'safe').length;
	const riftCount = mapMarkers.filter(m => m.type === 'rift').length;
</script>

<svelte:head><title>Carte des Failles — SHINSEI 新世</title></svelte:head>

<div style="position:relative;height:calc(100vh - 60px);background:#050508;overflow:hidden;">

	<!-- Titre flottant -->
	<div style="
		position:absolute;top:1rem;left:50%;transform:translateX(-50%);
		z-index:30;text-align:center;pointer-events:none;white-space:nowrap;
	">
		<h1 style="font-family:'Rajdhani',sans-serif;font-size:clamp(0.9rem,2vw,1.2rem);font-weight:900;color:white;letter-spacing:0.15em;text-shadow:0 0 18px #7c3aed60;">
			CARTE DES FAILLES — MONDE SHINSEI
		</h1>
		<p style="font-family:'Share Tech Mono',monospace;font-size:0.65rem;color:#4b5563;margin-top:0.2rem;">
			<span style="color:#ef4444;">{riftCount} failles actives</span>
			<span style="margin:0 0.5rem;color:#374151;">·</span>
			<span style="color:#22c55e;">{safeCount} zones sécurisées</span>
		</p>
	</div>

	<!-- Carte plein écran -->
	<WorldMap interactive={true} />

	<!-- Légende bas-gauche -->
	<div style="
		position:absolute;bottom:1.25rem;left:1.25rem;z-index:30;
		background:rgba(13,13,21,0.92);border:1px solid #1e1530;
		border-radius:0.625rem;padding:0.75rem 1rem;
		backdrop-filter:blur(8px);
	">
		<p style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#475569;margin-bottom:0.6rem;">Légende</p>
		<div style="display:flex;flex-direction:column;gap:0.4rem;">
			<div style="display:flex;align-items:center;gap:0.5rem;">
				<span style="width:10px;height:10px;border-radius:50%;background:#22c55e;box-shadow:0 0 6px #22c55e;flex-shrink:0;"></span>
				<span style="font-size:0.75rem;color:#94a3b8;">Zone sécurisée</span>
			</div>
			<div style="display:flex;align-items:center;gap:0.5rem;">
				<span style="width:10px;height:10px;border-radius:50%;background:#ef4444;box-shadow:0 0 6px #ef4444;flex-shrink:0;"></span>
				<span style="font-size:0.75rem;color:#94a3b8;">Faille active</span>
			</div>
			<div style="height:1px;background:#1e1530;margin:0.3rem 0;"></div>
			{#each [['#fbbf24', "L'Ordre"],['#ef4444','Les Fracturés'],['#22c55e','Les Nomades']] as [c,label]}
				<div style="display:flex;align-items:center;gap:0.5rem;">
					<span style="width:10px;height:10px;border-radius:2px;border:1px solid {c}60;background:{c}10;flex-shrink:0;"></span>
					<span style="font-size:0.75rem;color:#94a3b8;">{label}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Aide contrôles (desktop) -->
	<div style="
		position:absolute;top:1rem;right:1rem;z-index:30;
		background:rgba(13,13,21,0.85);border:1px solid #1e1530;
		border-radius:0.5rem;padding:0.6rem 0.85rem;
		backdrop-filter:blur(8px);
		display:none;
	" class="md:block">
		<p style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;color:#475569;line-height:1.8;">
			🖱 Clic → Détails<br/>
			⚙ Scroll → Zoom<br/>
			✥ Glisser → Déplacer
		</p>
	</div>
</div>
