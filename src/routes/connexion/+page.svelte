<script lang="ts">
	import { fly } from 'svelte/transition';
</script>

<svelte:head><title>Connexion — SHINSEI 新世</title></svelte:head>

<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;">
	<div style="max-width:440px;width:100%;position:relative;">

		<div style="position:absolute;inset:-40px;background:radial-gradient(ellipse at 50% 30%,#7c3aed18,transparent 65%);pointer-events:none;"></div>

		<div
			in:fly={{ y: 24, duration: 400 }}
			style="position:relative;background:#0d0d15;border:1px solid #1e1530;border-radius:1.25rem;padding:3rem 2rem;box-shadow:0 0 80px #7c3aed12;display:flex;flex-direction:column;align-items:center;gap:1.5rem;text-align:center;"
		>
			<!-- Logo -->
			<div style="display:flex;align-items:center;gap:0.5rem;">
				<span style="font-family:'Rajdhani',sans-serif;font-size:1.75rem;font-weight:900;color:#7c3aed;text-shadow:0 0 24px #7c3aed70;letter-spacing:0.04em;">SHINSEI</span>
				<span style="font-family:'Rajdhani',sans-serif;font-size:1.15rem;font-weight:700;color:#06b6d4;text-shadow:0 0 14px #06b6d450;">新世</span>
			</div>

			<!-- Icon -->
			<div style="width:64px;height:64px;border-radius:1rem;background:#7c3aed15;border:1px solid #7c3aed30;display:flex;align-items:center;justify-content:center;">
				<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.8">
					<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
					<line x1="12" y1="8" x2="12" y2="12"/>
					<line x1="12" y1="16" x2="12.01" y2="16"/>
				</svg>
			</div>

			<div>
				<h1 style="font-family:'Rajdhani',sans-serif;font-size:1.75rem;font-weight:900;color:white;letter-spacing:0.04em;margin-bottom:0.5rem;">PORTAIL EN MAINTENANCE</h1>
				<p style="font-size:0.85rem;color:#64748b;line-height:1.6;">
					Le portail joueur est temporairement indisponible.<br/>
					Reviens dans quelques instants.
				</p>
			</div>

			<div style="width:100%;height:1px;background:#1e1530;"></div>

			<div style="padding:0.85rem 1rem;background:#7c3aed0d;border:1px solid #7c3aed20;border-radius:0.75rem;width:100%;">
				<p style="font-family:'Share Tech Mono',monospace;font-size:0.72rem;color:#a78bfa;letter-spacing:0.08em;">
					En attendant, rejoins-nous sur Discord pour rester informé.
				</p>
			</div>

			<a href="/" style="font-family:'Rajdhani',sans-serif;font-size:0.85rem;font-weight:700;color:#475569;letter-spacing:0.08em;text-decoration:none;transition:color 0.18s;"
				onmouseenter={(e)=>{ (e.currentTarget as HTMLElement).style.color='#94a3b8'; }}
				onmouseleave={(e)=>{ (e.currentTarget as HTMLElement).style.color='#475569'; }}>
				← RETOUR À L'ACCUEIL
			</a>
		</div>
	</div>
</div>
