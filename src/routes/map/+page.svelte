<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_DYNMAP_URL } from '$env/static/public';
	import SEO from '$lib/components/SEO.svelte';

	let loaded = $state(false);
	let error  = $state(false);

	// Failles live (bandeau) : nombre en cours + compte à rebours de la prochaine ouverture.
	let faillesEnCours    = $state(0);
	let prochaineFailleAt = $state(0);
	let now               = $state(Date.now());
	const prochaineFailleLabel = $derived.by(() => {
		if (!prochaineFailleAt) return '—';
		const s = Math.floor((prochaineFailleAt - now) / 1000);
		if (s <= 0) return 'Imminente';
		const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
		if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
		if (m > 0) return `${m}m ${String(sec).padStart(2, '0')}s`;
		return `${sec}s`;
	});

	async function fetchStats() {
		try {
			const res = await fetch('/api/stats');
			if (res.ok) {
				const data = await res.json();
				faillesEnCours    = data.faillesEnCours  ?? 0;
				prochaineFailleAt = data.prochaineFaille ?? 0;
			}
		} catch {}
	}

	const TIMEOUT_MS = 15_000;

	onMount(() => {
		fetchStats();
		const statsInterval = setInterval(fetchStats, 30_000);
		const tick          = setInterval(() => (now = Date.now()), 1000);

		const timer = setTimeout(() => {
			if (!loaded) error = true;
		}, TIMEOUT_MS);
		return () => { clearTimeout(timer); clearInterval(statsInterval); clearInterval(tick); };
	});

	const breadcrumbSchema = {
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://playshinsei.fr' },
			{ '@type': 'ListItem', position: 2, name: 'Carte', item: 'https://playshinsei.fr/map' }
		]
	};
</script>

<SEO
	title="Carte du Monde Shinsei – Failles en Direct | Serveur Minecraft MMORPG"
	description="Carte interactive du monde de Shinsei en temps réel. Suivez les failles dimensionnelles actives, explorez Tokyo et les zones de jeu."
	canonical="https://playshinsei.fr/map"
	jsonLd={breadcrumbSchema}
/>

<div style="position: relative; height: calc(100vh - 60px); background: #050508; overflow: hidden;">

	<!-- Bandeau live : failles en cours + prochaine faille -->
	<div style="
		position: absolute; top: 1rem; left: 50%; transform: translateX(-50%);
		z-index: 10; display: flex; gap: 0.6rem; pointer-events: none; flex-wrap: wrap; justify-content: center;
	">
		<div style="
			display: flex; align-items: center; gap: 0.5rem;
			background: rgba(13,13,21,0.85); border: 1px solid #f59e0b40;
			border-radius: 0.5rem; padding: 0.45rem 0.9rem; backdrop-filter: blur(8px);
		">
			<span style="width:7px;height:7px;border-radius:50%;background:#f59e0b;box-shadow:0 0 8px #f59e0b;{faillesEnCours > 0 ? 'animation:pulse 2s infinite;' : ''}"></span>
			<span style="font-family:'Share Tech Mono',monospace;font-size:0.65rem;color:#94a3b8;letter-spacing:0.08em;">FAILLES EN COURS</span>
			<span style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:0.95rem;color:#f59e0b;">{faillesEnCours}</span>
		</div>
		<div style="
			display: flex; align-items: center; gap: 0.5rem;
			background: rgba(13,13,21,0.85); border: 1px solid #ef444440;
			border-radius: 0.5rem; padding: 0.45rem 0.9rem; backdrop-filter: blur(8px);
		">
			<span style="font-family:'Share Tech Mono',monospace;font-size:0.65rem;color:#94a3b8;letter-spacing:0.08em;">PROCHAINE FAILLE</span>
			<span style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:0.95rem;color:#ef4444;white-space:nowrap;">{prochaineFailleLabel}</span>
		</div>
	</div>

	<!-- Iframe Dynmap -->
	<iframe
		src={PUBLIC_DYNMAP_URL}
		title="Carte Dynmap SHINSEI"
		style="
			width: 100%; height: 100%; border: none; display: block;
			opacity: {loaded ? 1 : 0}; transition: opacity 0.4s;
		"
		onload={() => loaded = true}
		onerror={() => error = true}
	></iframe>

	<!-- Chargement -->
	{#if !loaded && !error}
		<div style="
			position: absolute; inset: 0; display: flex; flex-direction: column;
			align-items: center; justify-content: center; gap: 1rem;
			background: #050508;
		">
			<div style="
				width: 40px; height: 40px; border-radius: 50%;
				border: 3px solid #1e1530; border-top-color: #7c3aed;
				animation: spin 0.8s linear infinite;
			"></div>
			<p style="font-family:'Share Tech Mono',monospace; font-size: 0.75rem; color: #475569; letter-spacing: 0.1em;">CHARGEMENT DE LA CARTE…</p>
		</div>
	{/if}

	<!-- Erreur / serveur hors ligne -->
	{#if error}
		<div style="
			position: absolute; inset: 0; display: flex; flex-direction: column;
			align-items: center; justify-content: center; gap: 0.75rem;
			background: #050508;
		">
			<p style="font-size: 2.5rem;">🌀</p>
			<p style="font-family:'Rajdhani',sans-serif; font-size: 1.1rem; font-weight: 700; color: #475569; letter-spacing: 0.06em;">CARTE INDISPONIBLE</p>
			<p style="font-size: 0.8rem; color: #334155;">Le serveur Dynmap est hors ligne.</p>
			<a href={PUBLIC_DYNMAP_URL} target="_blank" rel="noopener noreferrer" style="
				font-family:'Share Tech Mono',monospace; font-size: 0.7rem;
				color: #7c3aed; border-bottom: 1px solid #7c3aed40; padding-bottom: 1px;
			">Ouvrir directement →</a>
		</div>
	{/if}

	<!-- Titre flottant -->
	{#if loaded}
		<div style="
			position: absolute; bottom: 1.25rem; left: 50%; transform: translateX(-50%);
			z-index: 10; text-align: center; pointer-events: none; white-space: nowrap;
		">
			<div style="
				background: rgba(13,13,21,0.85); border: 1px solid #1e1530;
				border-radius: 0.5rem; padding: 0.4rem 1rem;
				backdrop-filter: blur(8px);
			">
				<h1 style="font-family:'Rajdhani',sans-serif; font-size: 0.9rem; font-weight: 900; color: white; letter-spacing: 0.15em; margin: 0;">
					CARTE EN DIRECT — SHINSEI
				</h1>
			</div>
		</div>

		<!-- Lien ouvrir dans un onglet -->
		<a
			href={PUBLIC_DYNMAP_URL}
			target="_blank"
			rel="noopener noreferrer"
			style="
				position: absolute; bottom: 1.25rem; right: 1.25rem; z-index: 10;
				display: flex; align-items: center; gap: 0.4rem;
				background: rgba(13,13,21,0.85); border: 1px solid #1e1530;
				border-radius: 0.5rem; padding: 0.5rem 0.85rem;
				backdrop-filter: blur(8px); text-decoration: none;
				font-family:'Share Tech Mono',monospace; font-size: 0.65rem;
				color: #7c3aed; letter-spacing: 0.08em;
				transition: border-color 0.2s;
			"
			onmouseenter={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed50'}
			onmouseleave={(e) => (e.currentTarget as HTMLElement).style.borderColor = '#1e1530'}
		>
			<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
				<polyline points="15 3 21 3 21 9"/>
				<line x1="10" y1="14" x2="21" y2="3"/>
			</svg>
			PLEIN ÉCRAN
		</a>
	{/if}
</div>

<style>
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
