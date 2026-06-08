<script lang="ts">
	import { fly } from 'svelte/transition';
	import { page } from '$app/stores';

	const ERROR_MESSAGES: Record<string, string> = {
		access_denied:  'Connexion annulée.',
		no_code:        'Erreur lors de la connexion. Réessaie.',
		state_mismatch: 'Erreur de sécurité. Réessaie.',
		no_xbox:        'Un compte Xbox Live est requis.',
		xbox_banned:    'Ce compte Xbox est suspendu.',
		no_minecraft:   'Aucune licence Minecraft Java trouvée sur ce compte.',
		auth_failed:    "L'authentification a échoué. Réessaie.",
	};

	const error = $derived($page.url.searchParams.get('error'));
	const errorMsg = $derived(error ? (ERROR_MESSAGES[error] ?? 'Une erreur est survenue.') : null);
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
					<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
					<circle cx="12" cy="7" r="4"/>
				</svg>
			</div>

			<div>
				<h1 style="font-family:'Rajdhani',sans-serif;font-size:1.75rem;font-weight:900;color:white;letter-spacing:0.04em;margin-bottom:0.5rem;">PORTAIL JOUEUR</h1>
				<p style="font-size:0.85rem;color:#64748b;line-height:1.6;">
					Connecte ton compte Microsoft lié à<br/>ta licence Minecraft Java Edition.
				</p>
			</div>

			{#if errorMsg}
				<div style="width:100%;padding:0.75rem 1rem;background:#ef444415;border:1px solid #ef444440;border-radius:0.625rem;">
					<p style="font-family:'Share Tech Mono',monospace;font-size:0.75rem;color:#f87171;letter-spacing:0.05em;">{errorMsg}</p>
				</div>
			{/if}

			<div style="width:100%;height:1px;background:#1e1530;"></div>

			<!-- Bouton Microsoft -->
			<a
				href="/api/auth/microsoft"
				style="
					width:100%;display:flex;align-items:center;justify-content:center;gap:0.875rem;
					padding:0.875rem 1.5rem;
					background:#7c3aed;color:white;
					border:1px solid #9f67ff;border-radius:0.75rem;
					font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1rem;letter-spacing:0.08em;
					box-shadow:0 0 24px #7c3aed50;
					transition:background 0.2s,box-shadow 0.2s;
					text-decoration:none;
				"
				onmouseenter={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.background='#6d28d9'; el.style.boxShadow='0 0 40px #7c3aed80'; }}
				onmouseleave={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.background='#7c3aed'; el.style.boxShadow='0 0 24px #7c3aed50'; }}
			>
				<!-- Logo Microsoft -->
				<svg width="20" height="20" viewBox="0 0 21 21" fill="none">
					<rect x="1"  y="1"  width="9" height="9" fill="#f25022"/>
					<rect x="11" y="1"  width="9" height="9" fill="#7fba00"/>
					<rect x="1"  y="11" width="9" height="9" fill="#00a4ef"/>
					<rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
				</svg>
				SE CONNECTER AVEC MICROSOFT
			</a>

			<p style="font-size:0.75rem;color:#374151;line-height:1.55;max-width:22rem;">
				En te connectant, tu acceptes nos conditions d'utilisation.<br/>
				Aucune donnée n'est stockée en dehors de ta session.
			</p>

			<a href="/" style="font-family:'Rajdhani',sans-serif;font-size:0.85rem;font-weight:700;color:#475569;letter-spacing:0.08em;text-decoration:none;transition:color 0.18s;"
				onmouseenter={(e)=>{ (e.currentTarget as HTMLElement).style.color='#94a3b8'; }}
				onmouseleave={(e)=>{ (e.currentTarget as HTMLElement).style.color='#475569'; }}>
				← RETOUR À L'ACCUEIL
			</a>
		</div>
	</div>
</div>
