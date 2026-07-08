<script lang="ts">
	import { fade } from 'svelte/transition';
	import { page } from '$app/state';
	import type { PageData } from './$types';
	import { classes } from '$lib/data/classes';
	import { gameRanks } from '$lib/data/grades';

	let { data }: { data: PageData } = $props();

	const initialId = page.url.searchParams.get('id');
	const initialIndex = initialId ? Math.max(0, classes.findIndex(c => c.id === initialId)) : 0;

	let selected = $state(initialIndex);
	let cls = $derived(classes[selected]);
	let champion = $derived(data.champions[cls.id] ?? null);

	const gradeColor = (id: string) =>
		gameRanks.find(g => g.id === id)?.color ?? '#6b7280';

	function onHeadError(e: Event, uuid: string) {
		const img = e.currentTarget as HTMLImageElement;
		if (!img.dataset.tried) {
			img.dataset.tried = '1';
			img.src = `https://crafatar.com/avatars/${uuid}?size=48&overlay`;
		}
	}
</script>

<svelte:head>
	<title>Classes — SHINSEI</title>
	<meta name="description" content="Découvrez les 5 classes de SHINSEI : Hunter, Titan, Arcane, Shinigami, Bête. Lore, compétences, attributs et meilleurs joueurs." />
</svelte:head>

<div style="min-height: 100vh; background: #06060f; padding-top: 80px; padding-bottom: 60px;">
	<div style="max-width: 960px; margin: 0 auto; padding: 0 1.5rem;">

		<!-- Header -->
		<div style="text-align: center; margin-bottom: 2.5rem; padding-top: 1rem;">
			<p style="font-family:'Share Tech Mono',monospace; font-size: 0.75rem; color: #7c3aed; letter-spacing: 0.2em; margin-bottom: 0.4rem;">CODEX DES CLASSES</p>
			<h1 style="font-family:'Rajdhani',sans-serif; font-size: clamp(2rem,5vw,3rem); font-weight: 900; color: white; letter-spacing: 0.04em; margin: 0 0 0.5rem;">
				LES 5 CLASSES
			</h1>
			<p style="color: #64748b; font-size: 0.875rem; margin: 0;">Choisissez votre voie. Un seul Abyssal SS peut exister par classe.</p>
		</div>

		<!-- Class Selector -->
		<div style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 2.5rem; flex-wrap: wrap;">
			{#each classes as c, i}
				<button
					onclick={() => selected = i}
					style="
						font-family:'Rajdhani',sans-serif; font-size: 0.875rem; font-weight: 700; letter-spacing: 0.08em;
						padding: 0.55rem 1.4rem; border-radius: 0.375rem; cursor: pointer; transition: all 0.18s;
						background: {selected === i ? c.color + '20' : '#0f0f1a'};
						color: {selected === i ? c.color : '#64748b'};
						border: 1px solid {selected === i ? c.color + '80' : '#1e1530'};
						box-shadow: {selected === i ? `0 0 18px ${c.color}30` : 'none'};
					"
				>
					{c.icon} {c.name.toUpperCase()}
				</button>
			{/each}
		</div>

		<!-- Class Detail Panel -->
		{#key cls.id}
			<div
				in:fade={{ duration: 200 }}
				style="
					background: #0a0a14; border: 1px solid {cls.color}30; border-radius: 1rem;
					overflow: hidden; box-shadow: 0 0 50px {cls.color}10;
				"
			>
				<!-- Top accent bar -->
				<div style="height: 3px; background: linear-gradient(90deg, {cls.color}, transparent);"></div>

				<div class="panel-inner">

					<!-- Class identity -->
					<div style="display: flex; align-items: flex-start; gap: 1.5rem; margin-bottom: 2rem; flex-wrap: wrap;">
						<div style="
							width: 80px; height: 80px; background: {cls.color}15; border: 2px solid {cls.color}40;
							border-radius: 1rem; display: flex; align-items: center; justify-content: center;
							flex-shrink: 0; box-shadow: 0 0 30px {cls.color}20;
						">
							<span style="font-size: 2.5rem; line-height: 1;">{cls.icon}</span>
						</div>
						<div style="flex: 1; min-width: 0;">
							<h2 style="font-family:'Rajdhani',sans-serif; font-size: 2.2rem; font-weight: 900; color: {cls.color}; margin: 0 0 0.2rem; text-shadow: 0 0 24px {cls.color}40; letter-spacing: 0.03em;">
								{cls.name.toUpperCase()}
							</h2>
							<p style="font-family:'Share Tech Mono',monospace; font-size: 0.72rem; color: {cls.color}70; letter-spacing: 0.18em; margin: 0 0 0.75rem; text-transform: uppercase;">
								{cls.tagline}
							</p>
							<p style="color: #94a3b8; font-size: 0.9rem; line-height: 1.65; max-width: 600px; margin: 0;">
								{cls.playstyle}
							</p>
						</div>
					</div>

					<!-- Content grid -->
					<div class="classes-grid">

						<!-- LEFT: Lore + Stats -->
						<div style="display: flex; flex-direction: column; gap: 1.5rem;">

							<!-- Dossier lore -->
							<div>
								<p style="font-family:'Share Tech Mono',monospace; font-size: 0.65rem; color: {cls.color}; letter-spacing: 0.2em; margin-bottom: 0.75rem;">◈ DOSSIER CLASSIFIÉ</p>
								<div style="
									background: #06060f; border: 1px solid {cls.color}20; border-radius: 0.5rem;
									padding: 1.25rem; position: relative; overflow: hidden;
								">
									<div style="position: absolute; top: 0; right: 0; width: 36px; height: 36px; border-top: 2px solid {cls.color}40; border-right: 2px solid {cls.color}40; border-radius: 0 0.5rem 0 0;"></div>
									<div style="position: absolute; bottom: 0; left: 0; width: 36px; height: 36px; border-bottom: 2px solid {cls.color}20; border-left: 2px solid {cls.color}20; border-radius: 0 0 0 0.5rem;"></div>
									<p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.75; margin: 0; position: relative; z-index: 1;">
										{cls.lore}
									</p>
								</div>
							</div>

							<!-- Attributs -->
							<div>
								<p style="font-family:'Share Tech Mono',monospace; font-size: 0.65rem; color: {cls.color}; letter-spacing: 0.2em; margin-bottom: 0.75rem;">◈ ATTRIBUTS PRIMAIRES</p>
								<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
									{#each cls.stats as stat}
										<span style="
											font-family:'Share Tech Mono',monospace; font-size: 0.75rem;
											padding: 0.4rem 0.9rem; border-radius: 9999px;
											background: {cls.color}15; color: {cls.color}; border: 1px solid {cls.color}40;
											letter-spacing: 0.05em;
										">{stat}</span>
									{/each}
								</div>
							</div>
						</div>

						<!-- RIGHT: Forces / Faiblesses / Compétences -->
						<div style="display: flex; flex-direction: column; gap: 1.5rem;">

							<!-- Forces -->
							<div>
								<p style="font-family:'Share Tech Mono',monospace; font-size: 0.65rem; color: #22c55e; letter-spacing: 0.2em; margin-bottom: 0.75rem;">◈ FORCES</p>
								<div style="display: flex; flex-direction: column; gap: 0.4rem;">
									{#each cls.strengths as s}
										<div style="display: flex; align-items: center; gap: 0.6rem;">
											<div style="width: 6px; height: 6px; background: #22c55e; border-radius: 1px; flex-shrink: 0; box-shadow: 0 0 4px #22c55e;"></div>
											<span style="font-size: 0.875rem; color: #e2e8f0;">{s}</span>
										</div>
									{/each}
								</div>
							</div>

							<!-- Faiblesses -->
							<div>
								<p style="font-family:'Share Tech Mono',monospace; font-size: 0.65rem; color: #ef4444; letter-spacing: 0.2em; margin-bottom: 0.75rem;">◈ FAIBLESSES</p>
								<div style="display: flex; flex-direction: column; gap: 0.4rem;">
									{#each cls.weaknesses as w}
										<div style="display: flex; align-items: center; gap: 0.6rem;">
											<div style="width: 6px; height: 6px; background: #ef4444; border-radius: 1px; flex-shrink: 0; box-shadow: 0 0 4px #ef4444;"></div>
											<span style="font-size: 0.875rem; color: #e2e8f0;">{w}</span>
										</div>
									{/each}
								</div>
							</div>

							<!-- Compétences -->
							<div>
								<p style="font-family:'Share Tech Mono',monospace; font-size: 0.65rem; color: {cls.color}; letter-spacing: 0.2em; margin-bottom: 0.75rem;">◈ COMPÉTENCES</p>
								<div style="display: flex; flex-direction: column; gap: 0.45rem;">
									{#each cls.abilities as ability}
										<div style="
											background: #06060f; border: 1px solid {cls.color}20; border-radius: 0.375rem;
											padding: 0.6rem 0.875rem; display: flex; align-items: center; gap: 0.75rem;
										">
											<div style="width: 8px; height: 8px; background: {cls.color}; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 8px {cls.color};"></div>
											<span style="font-family:'Rajdhani',sans-serif; font-weight: 700; font-size: 0.9rem; color: #e2e8f0;">{ability.name}</span>
										</div>
									{/each}
								</div>
							</div>
						</div>
					</div>

					<!-- Champion -->
					<div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid {cls.color}20;">
						<p style="font-family:'Share Tech Mono',monospace; font-size: 0.65rem; color: {cls.color}; letter-spacing: 0.2em; margin-bottom: 1rem;">
							◈ MEILLEUR {cls.name.toUpperCase()} DU SERVEUR
						</p>
						{#if champion}
							<div style="
								display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
								background: {cls.color}10; border: 1px solid {cls.color}30; border-radius: 0.625rem;
								padding: 1rem 1.25rem;
							">
								<div style="width: 48px; height: 48px; border-radius: 0.5rem; overflow: hidden; border: 2px solid {cls.color}50; background: #06060f; flex-shrink: 0;">
									<img
										src="https://mc-heads.net/avatar/{champion.username}/48"
										alt={champion.username}
										style="width: 100%; height: 100%; image-rendering: pixelated;"
										onerror={(e) => onHeadError(e, champion!.uuid)}
									/>
								</div>
								<div>
									<p style="font-family:'Rajdhani',sans-serif; font-size: 1.1rem; font-weight: 900; color: white; margin: 0 0 0.2rem;">
										{champion.username}
									</p>
									<span style="
										font-family:'Share Tech Mono',monospace; font-size: 0.65rem;
										padding: 0.15rem 0.5rem; border-radius: 9999px;
										background: {gradeColor(champion.gradeGameplay)}20;
										color: {gradeColor(champion.gradeGameplay)};
										border: 1px solid {gradeColor(champion.gradeGameplay)}40;
										text-transform: uppercase;
									">{champion.gradeGameplay}</span>
								</div>
								<div class="champion-xp">
									<p style="font-family:'Share Tech Mono',monospace; font-size: 1.05rem; color: {cls.color}; font-weight: 700; margin: 0;">
										{champion.xpTotal.toLocaleString()} XP
									</p>
									<p style="font-family:'Share Tech Mono',monospace; font-size: 0.7rem; color: #64748b; margin: 0.15rem 0 0;">
										CHAMPION {cls.name.toUpperCase()}
									</p>
								</div>
							</div>
						{:else}
							<div style="
								background: #06060f; border: 1px dashed #1e1530; border-radius: 0.625rem;
								padding: 1.25rem; text-align: center;
							">
								<p style="font-family:'Share Tech Mono',monospace; font-size: 0.8rem; color: #334155; margin: 0;">
									Aucun joueur {cls.name} pour l'instant — sois le premier.
								</p>
							</div>
						{/if}
					</div>

				</div>
			</div>
		{/key}

		<!-- Prev / Next navigation -->
		<div style="display: flex; justify-content: space-between; margin-top: 1.25rem; gap: 0.5rem;">
			{#if selected > 0}
				<button
					onclick={() => selected = selected - 1}
					style="
						font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em;
						padding: 0.55rem 1.25rem; background: #0f0f1a; color: #94a3b8;
						border: 1px solid #1e1530; border-radius: 0.375rem; cursor: pointer; transition: all 0.18s;
					"
					onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.color = '#e2e8f0'; (e.currentTarget as HTMLElement).style.borderColor = '#374151'; }}
					onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.color = '#94a3b8'; (e.currentTarget as HTMLElement).style.borderColor = '#1e1530'; }}
				>← {classes[selected - 1].name}</button>
			{:else}
				<div></div>
			{/if}
			{#if selected < classes.length - 1}
				<button
					onclick={() => selected = selected + 1}
					style="
						font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em;
						padding: 0.55rem 1.25rem; background: #0f0f1a; color: #94a3b8;
						border: 1px solid #1e1530; border-radius: 0.375rem; cursor: pointer; transition: all 0.18s;
					"
					onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.color = '#e2e8f0'; (e.currentTarget as HTMLElement).style.borderColor = '#374151'; }}
					onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.color = '#94a3b8'; (e.currentTarget as HTMLElement).style.borderColor = '#1e1530'; }}
				>{classes[selected + 1].name} →</button>
			{:else}
				<div></div>
			{/if}
		</div>

		<!-- CTA -->
		<div style="text-align: center; margin-top: 3.5rem; padding: 2.5rem; background: linear-gradient(135deg, #0f0f1a, #0a0a14); border: 1px solid #1e1530; border-radius: 1rem; position: relative; overflow: hidden;">
			<div style="position: absolute; inset: 0; background: radial-gradient(ellipse at center, #7c3aed08, transparent 65%); pointer-events: none;"></div>
			<p style="font-family:'Share Tech Mono',monospace; font-size: 0.7rem; color: #7c3aed; letter-spacing: 0.2em; margin-bottom: 0.5rem; position: relative;">PRÊT À VOUS ÉVEILLER ?</p>
			<h3 style="font-family:'Rajdhani',sans-serif; font-size: 1.75rem; font-weight: 900; color: white; margin: 0 0 1rem; position: relative;">
				REJOIGNEZ SHINSEI
			</h3>
			<a href="/telecharger" style="
				font-family:'Rajdhani',sans-serif; font-weight: 900; font-size: 0.9rem;
				letter-spacing: 0.1em; padding: 0.8rem 2rem;
				background: #7c3aed; color: white;
				border: 1px solid #9f67ff; border-radius: 0.375rem;
				box-shadow: 0 0 22px #7c3aed60; display: inline-block;
				transition: box-shadow 0.25s, background 0.25s; position: relative;
			"
				onmouseenter={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 0 40px #7c3aed90'; el.style.background = '#6d28d9'; }}
				onmouseleave={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 0 22px #7c3aed60'; el.style.background = '#7c3aed'; }}
			>
				TÉLÉCHARGER LE LAUNCHER
			</a>
		</div>

	</div>
</div>

<style>
	.classes-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}
	@media (min-width: 768px) {
		.classes-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	/* Panel inner padding: smaller on mobile */
	.panel-inner {
		padding: 1.25rem;
	}
	@media (min-width: 640px) {
		.panel-inner { padding: 2rem; }
	}

	/* Champion XP block: stack on mobile, push right on larger screens */
	.champion-xp {
		text-align: left;
	}
	@media (min-width: 640px) {
		.champion-xp {
			margin-left: auto;
			text-align: right;
		}
	}
</style>
