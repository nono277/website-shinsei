<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Particles from '$lib/components/Particles.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>SHINSEI 新世 — Serveur Minecraft RPG</title>
	<meta name="description" content="SHINSEI 新世 — Serveur Minecraft RPG post-apocalyptique. Éveillez vos pouvoirs, fermez les failles." />
</svelte:head>

<Particles />

<!-- Scanlines overlay -->
<div aria-hidden="true" style="
	position: fixed; inset: 0; z-index: 2; pointer-events: none;
	background: repeating-linear-gradient(
		0deg,
		transparent,
		transparent 3px,
		rgba(0,0,0,0.025) 3px,
		rgba(0,0,0,0.025) 4px
	);
"></div>

<!-- Moving scan line -->
<div aria-hidden="true" style="
	position: fixed; left: 0; right: 0; height: 2px; z-index: 3; pointer-events: none;
	background: linear-gradient(90deg, transparent 0%, #7c3aed35 25%, #06b6d445 50%, #7c3aed35 75%, transparent 100%);
	animation: scan-down 9s linear infinite;
"></div>

<!-- Vignette -->
<div aria-hidden="true" style="
	position: fixed; inset: 0; z-index: 2; pointer-events: none;
	background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%);
"></div>

<!-- Wrapper content -->
<div style="position: relative; z-index: 10; min-height: 100vh; display: flex; flex-direction: column; background-color: #0a0a0f;">
	<Navbar />

	<main style="flex: 1; padding-top: 60px;">
		{@render children()}
	</main>

	<footer style="background: #0d0d15; border-top: 1px solid #1e1530; position: relative; z-index: 10;">
		<div style="max-width: 72rem; margin: 0 auto; padding: 2.5rem 1.5rem;">
			<div style="display: grid; grid-template-columns: repeat(1, 1fr); gap: 2rem; margin-bottom: 2rem;"
				class="md:grid-cols-3">
				<div>
					<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
						<span style="font-family:'Rajdhani',sans-serif; font-size: 1.25rem; font-weight: 900; color: #7c3aed; text-shadow: 0 0 15px #7c3aed60;">SHINSEI</span>
						<span style="font-family:'Rajdhani',sans-serif; font-weight: 700; color: #06b6d4;">新世</span>
					</div>
					<p style="font-size: 0.875rem; color: #64748b; line-height: 1.6;">
						Le serveur Minecraft RPG post-apocalyptique le plus épique. Éveillez votre puissance. Fermez les failles.
					</p>
				</div>

				<div>
					<p style="font-family:'Share Tech Mono',monospace; font-size: 0.75rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.75rem;">Navigation</p>
					<div style="display: flex; flex-direction: column; gap: 0.5rem;">
						{#each [['/', 'Accueil'], ['/telecharger', 'Télécharger'], ['/boutique', 'Boutique'], ['/classement', 'Classement'], ['/wiki', 'Wiki'], ['/map', 'Carte']] as [href, label]}
							<a {href} style="font-size: 0.875rem; color: #64748b; transition: color 0.2s;"
								onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = '#7c3aed'}
								onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = '#64748b'}>
								{label}
							</a>
						{/each}
					</div>
				</div>

				<div>
					<p style="font-family:'Share Tech Mono',monospace; font-size: 0.75rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.75rem;">Communauté</p>
					<div style="display: flex; flex-direction: column; gap: 0.5rem;">
						{#each [['Discord'], ['Twitter / X'], ['YouTube'], ['Règlement']] as [label]}
							<span style="font-size: 0.875rem; color: #64748b; cursor: pointer; transition: color 0.2s;"
								onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = '#7c3aed'}
								onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = '#64748b'}>
								{label}
							</span>
						{/each}
					</div>
				</div>
			</div>

			<div style="height: 1px; background: #1e1530; margin-bottom: 1.5rem;"></div>

			<div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;" class="md:flex-row md:justify-between">
				<p style="font-family:'Share Tech Mono',monospace; font-size: 0.7rem; color: #374151;">
					© 2026 SHINSEI 新世 — Tous droits réservés
				</p>
				<p style="font-family:'Share Tech Mono',monospace; font-size: 0.7rem; color: #1f2937;">
					Non affilié à Mojang Studios · Minecraft est une marque déposée de Microsoft
				</p>
			</div>
		</div>
	</footer>
</div>
