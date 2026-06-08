<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} — SHINSEI 新世</title>
</svelte:head>

<div style="
	min-height: calc(100vh - 60px);
	background: #06060f;
	display: flex; flex-direction: column;
	align-items: center; justify-content: center;
	padding: 2rem; text-align: center;
	position: relative; overflow: hidden;
">
	<!-- Rift animé en fond -->
	<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0.12;">
		<svg width="500" height="500" viewBox="0 0 600 600">
			<ellipse cx="300" cy="300" rx="220" ry="280" fill="none" stroke="#7c3aed" stroke-width="1.2">
				<animateTransform attributeName="transform" type="rotate" from="0 300 300" to="360 300 300" dur="22s" repeatCount="indefinite"/>
			</ellipse>
			<ellipse cx="300" cy="300" rx="140" ry="190" fill="none" stroke="#06b6d4" stroke-width="0.8">
				<animateTransform attributeName="transform" type="rotate" from="360 300 300" to="0 300 300" dur="16s" repeatCount="indefinite"/>
			</ellipse>
		</svg>
	</div>

	<div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:1.25rem;max-width:32rem;">
		<p style="font-family:'Share Tech Mono',monospace;font-size:0.75rem;color:#7c3aed;letter-spacing:0.2em;">ERREUR DIMENSIONNELLE</p>

		<h1 style="
			font-family:'Rajdhani',sans-serif;
			font-size: clamp(6rem, 20vw, 9rem);
			font-weight: 900; color: white; line-height: 1;
			text-shadow: 0 0 40px #7c3aed60, 0 0 80px #7c3aed25;
			margin: 0;
		">{page.status}</h1>

		<p style="font-family:'Rajdhani',sans-serif;font-size:1.4rem;font-weight:700;color:#94a3b8;letter-spacing:0.05em;">
			{#if page.status === 404}
				Cette faille n'existe pas.
			{:else if page.status === 403}
				Accès refusé. Rang insuffisant.
			{:else}
				Une anomalie dimensionnelle s'est produite.
			{/if}
		</p>

		<p style="font-size:0.875rem;color:#475569;line-height:1.65;">
			{page.error?.message ?? "La page que tu cherches a été engloutie par les Corrompus."}
		</p>

		<a href="/" style="
			font-family:'Rajdhani',sans-serif;font-weight:900;font-size:0.875rem;
			letter-spacing:0.1em;padding:0.75rem 2rem;
			background:#7c3aed;color:white;
			border:1px solid #9f67ff;border-radius:0.375rem;
			box-shadow:0 0 20px #7c3aed50;
			transition:box-shadow 0.2s,background 0.2s;
		"
			onmouseenter={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.boxShadow='0 0 35px #7c3aed80'; el.style.background='#6d28d9'; }}
			onmouseleave={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.boxShadow='0 0 20px #7c3aed50'; el.style.background='#7c3aed'; }}
		>RETOUR À L'ÉVEIL</a>
	</div>
</div>
