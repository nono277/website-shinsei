<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import SEO from '$lib/components/SEO.svelte';

	let { form: actionData }: { form: ActionData } = $props();

	let sent    = $state(false);
	let sending = $state(false);

	const CATEGORIES = [
		{ value: 'bug',      label: 'Bug / Erreur technique' },
		{ value: 'question', label: 'Question générale' },
		{ value: 'sanction', label: 'Appel de sanction (ban / mute)' },
		{ value: 'paiement', label: 'Problème de paiement' },
		{ value: 'autre',    label: 'Autre' },
	];

	let form = $state({
		pseudo_mc:     '',
		pseudo_discord:'',
		email:         '',
		categorie:     '',
		objet:         '',
		description:   '',
	});

	$effect(() => {
		if (actionData?.success) sent = true;
	});

	const inputStyle = `
		width: 100%; padding: 0.65rem 0.875rem;
		background: #0a0a14; border: 1px solid #1e1530; border-radius: 0.5rem;
		color: #e2e8f0; font-size: 0.875rem; font-family: inherit;
		transition: border-color 0.2s, box-shadow 0.2s; outline: none; box-sizing: border-box;
	`;
	const labelStyle = `
		font-family:'Share Tech Mono',monospace; font-size: 0.7rem;
		font-weight: 700; color: #64748b; letter-spacing: 0.1em;
		text-transform: uppercase; display: block; margin-bottom: 0.4rem;
	`;
	const sectionStyle = `
		background: #0a0a14; border: 1px solid #1e1530; border-radius: 0.75rem; padding: 1.75rem;
		display: flex; flex-direction: column; gap: 1.25rem;
	`;
	const sectionTitleStyle = `
		font-family:'Rajdhani',sans-serif; font-size: 1rem; font-weight: 900;
		color: #7c3aed; letter-spacing: 0.08em; text-transform: uppercase;
		margin: 0 0 0.25rem; border-bottom: 1px solid #7c3aed30; padding-bottom: 0.6rem;
	`;

	function focus(e: Event)  { (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 2px #7c3aed18'; }
	function blur(e: Event)   { (e.currentTarget as HTMLElement).style.borderColor = '#1e1530'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }

	const breadcrumbSchema = {
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://playshinsei.fr' },
			{ '@type': 'ListItem', position: 2, name: 'Support', item: 'https://playshinsei.fr/support' }
		]
	};
</script>

<SEO
	title="Support Shinsei – Aide, Bug, Sanction, Paiement | Serveur Minecraft MMORPG"
	description="Besoin d'aide sur Shinsei ? Ouvre un ticket : bug technique, question générale, appel de sanction (ban/mute) ou problème de paiement."
	canonical="https://playshinsei.fr/support"
	jsonLd={breadcrumbSchema}
/>

<div style="min-height:100vh; background:#06060f; padding-top:80px; padding-bottom:60px;">
	<div style="max-width:680px; margin:0 auto; padding:0 1.5rem;">

		<!-- Header -->
		<div style="text-align:center; margin-bottom:2.5rem;">
			<p style="font-family:'Share Tech Mono',monospace; font-size:0.75rem; color:#7c3aed; letter-spacing:0.2em; margin-bottom:0.4rem;">ASSISTANCE</p>
			<h1 style="font-family:'Rajdhani',sans-serif; font-size:clamp(2rem,5vw,3rem); font-weight:900; color:white; margin:0 0 0.75rem;">SUPPORT</h1>
			<p style="color:#64748b; font-size:0.875rem; max-width:480px; margin:0 auto; line-height:1.65;">
				Un problème en jeu, une question ou une contestation ? Ouvre un ticket et notre équipe te répondra sur Discord.
			</p>
		</div>

		{#if sent}
			<!-- Succès -->
			<div style="
				background: #0a1a0a; border: 1px solid #16a34a40; border-radius: 0.75rem;
				padding: 3rem 2rem; text-align: center;
			">
				<div style="
					width: 64px; height: 64px; border-radius: 50%;
					background: #16a34a20; border: 2px solid #16a34a60;
					display: flex; align-items: center; justify-content: center;
					margin: 0 auto 1.5rem;
				">
					<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5">
						<polyline points="20 6 9 17 4 12"/>
					</svg>
				</div>
				<h2 style="font-family:'Rajdhani',sans-serif; font-size:1.75rem; font-weight:900; color:white; margin:0 0 0.75rem;">
					TICKET ENVOYÉ
				</h2>
				<p style="color:#64748b; font-size:0.9rem; line-height:1.65; max-width:380px; margin:0 auto 1.5rem;">
					Ton ticket a bien été reçu. Vérifie ta boîte mail pour la confirmation.
					Notre équipe te contactera sur Discord dans les meilleurs délais.
				</p>
				<a
					href="/"
					style="
						display: inline-block; font-family:'Rajdhani',sans-serif;
						font-size:0.85rem; font-weight:700; letter-spacing:0.08em;
						padding:0.55rem 1.25rem; background:#7c3aed; color:white;
						border-radius:0.375rem; text-decoration:none;
						border:1px solid #9f67ff; box-shadow:0 0 14px #7c3aed30;
					"
				>RETOUR À L'ACCUEIL</a>
			</div>

		{:else}
			<!-- Formulaire -->
			<form
				method="POST"
				use:enhance={() => {
					sending = true;
					return async ({ update }) => { await update(); sending = false; };
				}}
				style="display:flex; flex-direction:column; gap:1.25rem;"
				novalidate
			>
				<!-- Honeypot -->
				<input type="text" name="website" style="display:none;" tabindex="-1" autocomplete="off" />

				{#if actionData?.error}
					<div style="
						background:#1a0a0a; border:1px solid #ef444440; border-radius:0.5rem;
						padding:0.85rem 1rem; color:#f87171; font-size:0.85rem;
					">
						{actionData.error}
					</div>
				{/if}

				<!-- Identité -->
				<div style={sectionStyle}>
					<p style={sectionTitleStyle}>Tes informations</p>

					<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;" class="grid-1-mobile">
						<div>
							<label for="pseudo_mc" style={labelStyle}>Pseudo Minecraft <span style="color:#7c3aed">*</span></label>
							<input
								id="pseudo_mc" name="pseudo_mc" type="text" required
								placeholder="SteveRP"
								bind:value={form.pseudo_mc}
								style={inputStyle}
								onfocus={focus} onblur={blur}
							/>
						</div>
						<div>
							<label for="pseudo_discord" style={labelStyle}>Pseudo Discord <span style="color:#7c3aed">*</span></label>
							<input
								id="pseudo_discord" name="pseudo_discord" type="text" required
								placeholder="steve#0000"
								bind:value={form.pseudo_discord}
								style={inputStyle}
								onfocus={focus} onblur={blur}
							/>
						</div>
					</div>

					<div>
						<label for="email" style={labelStyle}>Email de contact <span style="color:#7c3aed">*</span></label>
						<input
							id="email" name="email" type="email" required
							placeholder="ton@email.com"
							bind:value={form.email}
							style={inputStyle}
							onfocus={focus} onblur={blur}
						/>
					</div>
				</div>

				<!-- Ticket -->
				<div style={sectionStyle}>
					<p style={sectionTitleStyle}>Ta demande</p>

					<div>
						<label for="categorie" style={labelStyle}>Catégorie <span style="color:#7c3aed">*</span></label>
						<select
							id="categorie" name="categorie" required
							bind:value={form.categorie}
							style="{inputStyle} cursor:pointer;"
							onfocus={focus} onblur={blur}
						>
							<option value="" disabled>-- Choisir une catégorie --</option>
							{#each CATEGORIES as cat}
								<option value={cat.value}>{cat.label}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="objet" style={labelStyle}>Objet <span style="color:#7c3aed">*</span></label>
						<input
							id="objet" name="objet" type="text" required
							placeholder="Résumé de ta demande en quelques mots"
							bind:value={form.objet}
							style={inputStyle}
							onfocus={focus} onblur={blur}
						/>
					</div>

					<div>
						<label for="description" style={labelStyle}>Description <span style="color:#7c3aed">*</span></label>
						<textarea
							id="description" name="description" required rows="6"
							placeholder="Décris ton problème en détail : ce qui s'est passé, quand, comment reproduire le bug, etc."
							bind:value={form.description}
							style="{inputStyle} resize:vertical; min-height:130px;"
							onfocus={focus} onblur={blur}
						></textarea>
					</div>
				</div>

				<!-- Catégorie helper -->
				{#if form.categorie === 'sanction'}
					<div style="
						background:#0d0a1a; border:1px solid #7c3aed30; border-radius:0.5rem;
						padding:0.85rem 1rem; color:#a78bfa; font-size:0.8rem; line-height:1.6;
					">
						Pour un appel de sanction, précise dans la description : la date de la sanction, le motif indiqué, et ta version des faits.
					</div>
				{:else if form.categorie === 'paiement'}
					<div style="
						background:#0d0a1a; border:1px solid #7c3aed30; border-radius:0.5rem;
						padding:0.85rem 1rem; color:#a78bfa; font-size:0.8rem; line-height:1.6;
					">
						Pour un problème de paiement, précise l'ID de ta transaction et l'article concerné.
					</div>
				{/if}

				<!-- Submit -->
				<button
					type="submit"
					disabled={sending}
					style="
						width:100%; padding:0.85rem;
						font-family:'Rajdhani',sans-serif; font-size:1rem; font-weight:900; letter-spacing:0.1em;
						background:{sending ? '#4c1d95' : '#7c3aed'}; color:white;
						border:1px solid {sending ? '#6d28d9' : '#9f67ff'};
						border-radius:0.5rem; cursor:{sending ? 'not-allowed' : 'pointer'};
						box-shadow:0 0 18px #7c3aed30; transition:all 0.2s;
						opacity:{sending ? '0.7' : '1'};
					"
				>
					{sending ? 'ENVOI EN COURS…' : 'ENVOYER LE TICKET'}
				</button>

				<p style="text-align:center; color:#374151; font-size:0.75rem;">
					Pour une réponse rapide, tu peux aussi ouvrir un ticket directement sur
					<a href="https://discord.gg/YtsrPnwz5T" target="_blank" rel="noopener noreferrer"
						style="color:#7c3aed; text-decoration:none;">notre Discord</a>.
				</p>
			</form>
		{/if}

	</div>
</div>

<style>
	@media (max-width: 540px) {
		.grid-1-mobile {
			grid-template-columns: 1fr !important;
		}
	}
	select option {
		background: #0a0a14;
		color: #e2e8f0;
	}
</style>
