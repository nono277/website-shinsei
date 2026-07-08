<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Particles from '$lib/components/Particles.svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: any; data: LayoutData } = $props();

	const BANNER_H = 48;

	let countdown = $state('');

	$effect(() => {
		const end = data.maintenance?.endDate;
		if (!end) { countdown = ''; return; }
		const update = () => {
			const diff = new Date(end).getTime() - Date.now();
			if (diff <= 0) { countdown = ''; return; }
			const h = Math.floor(diff / 3600000);
			const m = Math.floor((diff % 3600000) / 60000);
			const s = Math.floor((diff % 60000) / 1000);
			countdown = `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
		};
		update();
		const t = setInterval(update, 1000);
		return () => clearInterval(t);
	});

	const bannerActive = $derived(data.maintenance?.enabled ?? false);
	const mainTop = $derived(bannerActive ? `${60 + BANNER_H}px` : '60px');
</script>

<svelte:head>
	<title>SHINSEI 新世 — Serveur Minecraft RPG</title>
	<meta name="description" content="SHINSEI 新世 — Serveur Minecraft RPG post-apocalyptique. Éveillez vos pouvoirs, fermez les failles." />
</svelte:head>

{#if bannerActive}
<div
	aria-live="polite"
	role="status"
	class="maintenance-banner"
	style="position: fixed; top: 0; left: 0; right: 0; z-index: 200; height: {BANNER_H}px; display: flex; align-items: center; overflow: hidden; border-bottom: 2px solid #ef4444;"
>
	<div style="position: absolute; inset: 0; background: rgba(0,0,0,0.22);"></div>

	<div style="
		position: relative; z-index: 1;
		display: flex; align-items: center; gap: 0.65rem;
		padding: 0 1.25rem;
		width: 100%; max-width: 76rem; margin: 0 auto;
		font-family: 'Share Tech Mono', monospace;
		font-size: 0.78rem; color: #fff;
		text-shadow: 0 1px 4px rgba(0,0,0,0.9);
		overflow: hidden;
	">
		<!-- icône pulsante -->
		<svg class="maintenance-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fde68a" stroke-width="2.2" style="flex-shrink:0;">
			<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
			<line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
		</svg>

		<span style="font-weight:700; color:#fde68a; flex-shrink:0; letter-spacing:0.1em; font-size:0.83rem; text-transform:uppercase;">
			Maintenance en cours
		</span>

		<div class="msg-marquee-outer">
			<div class="msg-marquee-track">
				<span>— {data.maintenance.message}</span>
				<span aria-hidden="true">— {data.maintenance.message}</span>
			</div>
		</div>

		{#if data.maintenance.endDate}
			<span style="flex-shrink:0; color:#fed7aa; white-space:nowrap; font-size:0.7rem;" class="hidden sm:inline">
				Retour le {new Date(data.maintenance.endDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {new Date(data.maintenance.endDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
			</span>
			{#if countdown}
				<span class="countdown-pill">{countdown}</span>
			{/if}
		{/if}
	</div>
</div>
{/if}

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
	<Navbar topOffset={bannerActive ? BANNER_H : 0} />

	<main style="flex: 1; padding-top: {mainTop};">
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
						{#each [['/', 'Accueil'], ['/telecharger', 'Télécharger'], ['/classement', 'Classement'], ['/wiki', 'Wiki'], ['/map', 'Carte'], ['/recrutement', 'Recrutement'], ['/support', 'Support']] as [href, label]}
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
						{#each [
							['Discord',   'https://discord.gg/DcN95Dbx4'],
							['YouTube',   'https://www.youtube.com/@Shinsei-off'],
							['TikTok',    'https://www.tiktok.com/@shinsei_officiel'],
							['Instagram', 'https://www.instagram.com/shinsei.officiel?igsh=MTAwbno2bXZ5OXZmMw=='],
						] as [label, href]}
							<a {href} target="_blank" rel="noopener noreferrer"
								style="font-size: 0.875rem; color: #64748b; text-decoration: none; transition: color 0.2s;"
								onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = '#7c3aed'}
								onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = '#64748b'}>
								{label}
							</a>
						{/each}
					</div>
				</div>
			</div>

			<div style="height: 1px; background: #1e1530; margin-bottom: 1.5rem;"></div>

			<div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;" class="md:flex-row md:justify-between">
				<p style="font-family:'Share Tech Mono',monospace; font-size: 0.7rem; color: #374151;">
					© 2026 SHINSEI 新世 — Tous droits réservés
				</p>
				<div style="display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; justify-content: center;">
					{#each [['/mentions-legales','Mentions légales'],['/politique-de-confidentialite','Confidentialité'],['/cgu','CGU']] as [href, label]}
						<a {href} style="font-family:'Share Tech Mono',monospace; font-size: 0.65rem; color: #374151; text-decoration: none; transition: color 0.2s;"
							onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = '#7c3aed'}
							onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = '#374151'}>
							{label}
						</a>
					{/each}
				</div>
				<p style="font-family:'Share Tech Mono',monospace; font-size: 0.65rem; color: #1f2937; text-align: center;">
					Non affilié à Mojang · Minecraft™ Microsoft
				</p>
			</div>

			<!-- Backlinks classements — requis par les sites -->
			<div style="margin-top: 1rem; text-align: center; font-family:'Share Tech Mono',monospace; font-size: 0.6rem; color: #1f2937;">
				Classements :
				<a href="http://www.serveurs-minecraft.org/" target="_blank" rel="noopener noreferrer"
					style="color: #1f2937; text-decoration: none; transition: color 0.2s;"
					onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = '#a855f7'}
					onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = '#1f2937'}>Serveurs-Minecraft.org</a>
				·
				<a href="https://www.serveursminecraft.org/serveur/7652/" target="_blank" rel="noopener noreferrer"
					style="color: #1f2937; text-decoration: none; transition: color 0.2s;"
					onmouseenter={(e) => (e.currentTarget as HTMLElement).style.color = '#a855f7'}
					onmouseleave={(e) => (e.currentTarget as HTMLElement).style.color = '#1f2937'}>ServeursMinecraft.org</a>
			</div>
		</div>
	</footer>
</div>

<style>
	@keyframes maintenance-glow {
		0%, 100% { box-shadow: 0 0 30px rgba(239,68,68,0.55), 0 2px 8px rgba(0,0,0,0.6); }
		50%       { box-shadow: 0 0 50px rgba(239,68,68,0.85), 0 2px 8px rgba(0,0,0,0.6), 0 0 80px rgba(239,68,68,0.3); }
	}
	@keyframes stripe-slide {
		from { background-position: 0 0; }
		to   { background-position: 40px 40px; }
	}
	@keyframes icon-pulse {
		0%, 100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 3px #fde68a80); }
		50%       { opacity: 0.65; transform: scale(1.2); filter: drop-shadow(0 0 8px #fde68a); }
	}
	@keyframes countdown-flash {
		0%, 100% { opacity: 1; }
		50%       { opacity: 0.65; }
	}
	@keyframes marquee-track {
		0%   { transform: translateX(0); }
		100% { transform: translateX(-50%); }
	}
	.msg-marquee-outer {
		flex: 1;
		overflow: hidden;
		mask-image: linear-gradient(to right, transparent 0, black 1.5rem, black calc(100% - 1.5rem), transparent 100%);
		-webkit-mask-image: linear-gradient(to right, transparent 0, black 1.5rem, black calc(100% - 1.5rem), transparent 100%);
	}
	.msg-marquee-track {
		display: inline-flex;
		animation: marquee-track 22s linear infinite;
	}
	.msg-marquee-track span {
		color: #fca5a5;
		white-space: nowrap;
		padding-right: 5rem;
	}

	.maintenance-banner {
		background:
			repeating-linear-gradient(
				135deg,
				rgba(120,20,20,0.9)  0px,  rgba(120,20,20,0.9)  14px,
				rgba(155,28,28,0.9) 14px, rgba(155,28,28,0.9) 28px
			);
		background-size: 40px 40px;
		animation: stripe-slide 1.8s linear infinite, maintenance-glow 2s ease-in-out infinite;
	}
	.maintenance-icon {
		animation: icon-pulse 1.4s ease-in-out infinite;
	}
	.countdown-pill {
		background: rgba(0,0,0,0.45);
		border: 1px solid rgba(239,68,68,0.35);
		border-radius: 9999px;
		padding: 0.15rem 0.65rem;
		font-size: 0.68rem;
		color: #fde68a;
		font-family: 'Share Tech Mono', monospace;
		white-space: nowrap;
		flex-shrink: 0;
		animation: countdown-flash 1s ease-in-out infinite;
	}
</style>
