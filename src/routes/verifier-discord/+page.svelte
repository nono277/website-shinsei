<script lang="ts">
	import { enhance } from '$app/forms';
	import { fly } from 'svelte/transition';
	import SEO from '$lib/components/SEO.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let submitting = $state(false);
</script>

<SEO
	title="Lier ton Discord – Shinsei"
	description="Confirme la liaison de ton compte Minecraft à ton Discord."
	canonical="https://playshinsei.fr/verifier-discord"
	noindex={true}
/>

<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;">
	<div style="max-width:440px;width:100%;position:relative;" class="connexion-card-wrap">
		<div style="position:absolute;inset:-40px;background:radial-gradient(ellipse at 50% 30%,#7c3aed18,transparent 65%);pointer-events:none;"></div>

		<div
			in:fly={{ y: 24, duration: 400 }}
			style="position:relative;background:#0d0d15;border:1px solid #1e1530;border-radius:1.25rem;padding:3rem 2rem;box-shadow:0 0 80px #7c3aed12;display:flex;flex-direction:column;align-items:center;gap:1.5rem;text-align:center;"
			class="connexion-card-inner"
		>
			<div style="display:flex;align-items:center;gap:0.5rem;">
				<span style="font-family:'Rajdhani',sans-serif;font-size:1.75rem;font-weight:900;color:#7c3aed;text-shadow:0 0 24px #7c3aed70;letter-spacing:0.04em;">SHINSEI</span>
				<span style="font-family:'Rajdhani',sans-serif;font-size:1.15rem;font-weight:700;color:#06b6d4;text-shadow:0 0 14px #06b6d450;">新世</span>
			</div>

			<div style="width:64px;height:64px;border-radius:1rem;background:#5865f215;border:1px solid #5865f230;display:flex;align-items:center;justify-content:center;">
				<svg width="30" height="30" viewBox="0 0 24 24" fill="#5865f2"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.74 19.74 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.04.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03z"/></svg>
			</div>

			{#if form?.success}
				<div>
					<h1 style="font-family:'Rajdhani',sans-serif;font-size:1.75rem;font-weight:900;color:#22c55e;letter-spacing:0.04em;margin-bottom:0.5rem;">COMPTE LIÉ ✓</h1>
					<p style="font-size:0.85rem;color:#64748b;line-height:1.6;">
						Ton Discord est maintenant lié à <b style="color:#e2e8f0;">{form.minecraftUsername}</b>.<br/>
						Retourne sur Discord et clique <b style="color:#e2e8f0;">J'ai terminé</b>.
					</p>
				</div>
			{:else if !data.validSignature}
				<div>
					<h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:900;color:#f87171;letter-spacing:0.04em;margin-bottom:0.5rem;">LIEN INVALIDE</h1>
					<p style="font-size:0.85rem;color:#64748b;line-height:1.6;">
						Ce lien de vérification est invalide ou a expiré. Relance <b style="color:#e2e8f0;">/verifier</b> sur Discord pour en obtenir un nouveau.
					</p>
				</div>
			{:else if !data.user}
				<div>
					<h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:900;color:white;letter-spacing:0.04em;margin-bottom:0.5rem;">CONNECTE-TOI D'ABORD</h1>
					<p style="font-size:0.85rem;color:#64748b;line-height:1.6;">
						Connecte-toi avec ton compte Minecraft pour lier ton Discord.
					</p>
				</div>
				<a href="/connexion?redirect=/verifier-discord?discordId={data.discordId}%26sig={data.signature}"
					style="width:100%;display:flex;align-items:center;justify-content:center;padding:0.875rem 1.5rem;background:#7c3aed;color:white;border:1px solid #9f67ff;border-radius:0.75rem;font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1rem;letter-spacing:0.08em;box-shadow:0 0 24px #7c3aed50;text-decoration:none;">
					SE CONNECTER
				</a>
			{:else}
				<div>
					<h1 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:900;color:white;letter-spacing:0.04em;margin-bottom:0.5rem;">CONFIRME LA LIAISON</h1>
					<p style="font-size:0.85rem;color:#64748b;line-height:1.6;">
						Lier ton Discord à ton compte Minecraft <b style="color:#e2e8f0;">{data.user.username}</b> ?
					</p>
					{#if data.alreadyLinked}
						<p style="font-size:0.75rem;color:#f59e0b;margin-top:0.5rem;">Ce Discord était déjà lié à {data.alreadyLinked} — cette action le remplace.</p>
					{/if}
				</div>

				{#if form?.error}
					<div style="width:100%;padding:0.75rem 1rem;background:#ef444415;border:1px solid #ef444440;border-radius:0.625rem;">
						<p style="font-family:'Share Tech Mono',monospace;font-size:0.75rem;color:#f87171;letter-spacing:0.05em;">{form.error}</p>
					</div>
				{/if}

				<form method="POST" use:enhance={() => { submitting = true; return async ({ update }) => { submitting = false; await update(); }; }} style="width:100%;">
					<input type="hidden" name="discordId" value={data.discordId} />
					<input type="hidden" name="signature" value={data.signature} />
					<button
						type="submit"
						disabled={submitting}
						style="width:100%;padding:0.875rem 1.5rem;background:{submitting ? '#4c1d95' : '#7c3aed'};color:white;border:1px solid #9f67ff;border-radius:0.75rem;font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1rem;letter-spacing:0.08em;box-shadow:0 0 24px #7c3aed50;cursor:{submitting ? 'not-allowed' : 'pointer'};"
					>
						{submitting ? 'LIAISON...' : 'CONFIRMER LA LIAISON'}
					</button>
				</form>
			{/if}

			<a href="/" style="font-family:'Rajdhani',sans-serif;font-size:0.85rem;font-weight:700;color:#475569;letter-spacing:0.08em;text-decoration:none;">
				← RETOUR À L'ACCUEIL
			</a>
		</div>
	</div>
</div>

<style>
	@media (max-width: 640px) {
		.connexion-card-wrap { width: calc(100% - 2rem); }
		.connexion-card-inner { padding: 2rem 1.25rem !important; }
	}
</style>
