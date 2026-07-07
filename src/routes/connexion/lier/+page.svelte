<script lang="ts">
	import { fly } from 'svelte/transition';

	let username = $state('');
	let error    = $state('');
	let loading  = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (loading) return;
		error = '';
		loading = true;
		const fd = new FormData();
		fd.set('username', username);
		const res = await fetch('/api/auth/link', { method: 'POST', body: fd });
		if (res.redirected) { window.location.href = res.url; return; }
		if (!res.ok) { const d = await res.json(); error = d.error ?? 'Erreur inconnue.'; }
		loading = false;
	}
</script>

<svelte:head><title>Lier ton compte — SHINSEI 新世</title></svelte:head>

<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;">
	<div style="max-width:440px;width:100%;position:relative;">
		<div style="position:absolute;inset:-40px;background:radial-gradient(ellipse at 50% 30%,#7c3aed18,transparent 65%);pointer-events:none;"></div>

		<div
			in:fly={{ y: 24, duration: 400 }}
			style="position:relative;background:#0d0d15;border:1px solid #1e1530;border-radius:1.25rem;padding:3rem 2rem;box-shadow:0 0 80px #7c3aed12;display:flex;flex-direction:column;align-items:center;gap:1.5rem;text-align:center;"
		>
			<div style="display:flex;align-items:center;gap:0.5rem;">
				<span style="font-family:'Rajdhani',sans-serif;font-size:1.75rem;font-weight:900;color:#7c3aed;text-shadow:0 0 24px #7c3aed70;letter-spacing:0.04em;">SHINSEI</span>
				<span style="font-family:'Rajdhani',sans-serif;font-size:1.15rem;font-weight:700;color:#06b6d4;text-shadow:0 0 14px #06b6d450;">新世</span>
			</div>

			<div style="width:64px;height:64px;border-radius:1rem;background:#06b6d415;border:1px solid #06b6d430;display:flex;align-items:center;justify-content:center;">
				<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="1.8">
					<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
					<path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
				</svg>
			</div>

			<div>
				<h1 style="font-family:'Rajdhani',sans-serif;font-size:1.75rem;font-weight:900;color:white;letter-spacing:0.04em;margin-bottom:0.5rem;">LIER TON COMPTE</h1>
				<p style="font-size:0.85rem;color:#64748b;line-height:1.6;">
					Ton gamertag Xbox ne correspond pas à un nom Minecraft.<br/>
					Entre ton nom de joueur Minecraft Java Edition.
				</p>
			</div>

			{#if error}
				<div style="width:100%;padding:0.75rem 1rem;background:#ef444415;border:1px solid #ef444440;border-radius:0.625rem;">
					<p style="font-family:'Share Tech Mono',monospace;font-size:0.75rem;color:#f87171;letter-spacing:0.05em;">{error}</p>
				</div>
			{/if}

			<div style="width:100%;height:1px;background:#1e1530;"></div>

			<form onsubmit={submit} style="width:100%;display:flex;flex-direction:column;gap:1rem;">
				<input
					bind:value={username}
					type="text"
					placeholder="Ton nom Minecraft (ex: Notch)"
					maxlength="16"
					autocomplete="off"
					required
					style="
						width:100%;padding:0.875rem 1rem;
						background:#12121e;border:1px solid #1e1530;border-radius:0.625rem;
						font-family:'Share Tech Mono',monospace;font-size:0.9rem;color:white;
						outline:none;box-sizing:border-box;
						transition:border-color 0.2s;
					"
					onfocus={(e)=>{ (e.currentTarget as HTMLElement).style.borderColor='#7c3aed50'; }}
					onblur={(e)=>{ (e.currentTarget as HTMLElement).style.borderColor='#1e1530'; }}
				/>

				<button
					type="submit"
					disabled={loading}
					style="
						width:100%;display:flex;align-items:center;justify-content:center;gap:0.75rem;
						padding:0.875rem 1.5rem;
						background:{loading?'#4c1d95':'#7c3aed'};color:white;
						border:1px solid #9f67ff;border-radius:0.75rem;
						font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1rem;letter-spacing:0.08em;
						box-shadow:0 0 24px #7c3aed50;cursor:{loading?'not-allowed':'pointer'};
						transition:background 0.2s;
					"
				>
					{loading ? 'VÉRIFICATION...' : 'CONFIRMER'}
				</button>
			</form>

			<a href="/connexion" style="font-family:'Rajdhani',sans-serif;font-size:0.85rem;font-weight:700;color:#475569;letter-spacing:0.08em;text-decoration:none;transition:color 0.18s;"
				onmouseenter={(e)=>{ (e.currentTarget as HTMLElement).style.color='#94a3b8'; }}
				onmouseleave={(e)=>{ (e.currentTarget as HTMLElement).style.color='#475569'; }}>
				← RETOUR À LA CONNEXION
			</a>
		</div>
	</div>
</div>
