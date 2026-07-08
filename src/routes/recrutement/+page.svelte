<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import SEO from '$lib/components/SEO.svelte';

	let { form: actionData }: { form: ActionData } = $props();

	let sent       = $state(false);
	let sending    = $state(false);
	let localError = $state('');

	const POSTES = ['Responsable Modérateur', 'Modérateur', 'Helper', 'Builder', 'Community Manager', 'Testeur'];

	let form = $state({
		pseudo_mc:          '',
		pseudo_discord:     '',
		email:              '',
		age:                '',
		pays:               '',
		disponibilite:      '',
		exp_staff:          '',
		anciennete_mc:      '',
		connais_rpg:        '',
		connais_rpg_detail: '',
		pourquoi:           '',
		decouverte:         '',
		apport:             '',
		poste:              '',
		competences:        '',
		cas1:               '',
		cas2:               '',
		cas3:               '',
		questions:          '',
		autre:              '',
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
			{ '@type': 'ListItem', position: 2, name: 'Recrutement', item: 'https://playshinsei.fr/recrutement' }
		]
	};
</script>

<style>
	.form-grid-2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	.form-grid-3 {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 1rem;
	}
	@media (max-width: 600px) {
		.form-grid-2,
		.form-grid-3 {
			grid-template-columns: 1fr;
		}
	}
</style>

<SEO
	title="Recrutement Staff Shinsei – Modérateur, Builder, CM, Helper | Minecraft MMORPG"
	description="Rejoin l'équipe Shinsei ! Candidature ouverte pour Modérateur, Helper, Builder, Community Manager et Testeur. Formulaire de candidature en ligne."
	canonical="https://playshinsei.fr/recrutement"
	jsonLd={breadcrumbSchema}
/>

<div style="min-height:100vh; background:#06060f; padding-top:80px; padding-bottom:60px;">
	<div style="max-width:760px; margin:0 auto; padding:0 1.5rem;">

		<!-- Header -->
		<div style="text-align:center; margin-bottom:2.5rem;">
			<p style="font-family:'Share Tech Mono',monospace; font-size:0.75rem; color:#7c3aed; letter-spacing:0.2em; margin-bottom:0.4rem;">REJOINS L'ÉQUIPE</p>
			<h1 style="font-family:'Rajdhani',sans-serif; font-size:clamp(2rem,5vw,3rem); font-weight:900; color:white; margin:0 0 0.75rem;">NOUS RECRUTONS</h1>
			<p style="color:#64748b; font-size:0.875rem; max-width:500px; margin:0 auto; line-height:1.65;">
				Tu veux contribuer à l'aventure SHINSEI ? Remplis le formulaire ci-dessous.
				Un membre de l'équipe te contactera sur Discord.
			</p>

			<!-- Postes ouverts -->
			<div style="display:flex; flex-wrap:wrap; gap:0.5rem; justify-content:center; margin-top:1.25rem;">
				{#each POSTES as poste}
					<span style="
						font-family:'Share Tech Mono',monospace; font-size:0.65rem; letter-spacing:0.08em;
						padding:0.25rem 0.65rem; border-radius:9999px;
						background:#7c3aed18; color:#a78bfa; border:1px solid #7c3aed40;
					">{poste}</span>
				{/each}
			</div>
		</div>

		{#if sent || actionData?.success}
			<!-- Confirmation -->
			<div style="text-align:center; padding:4rem 2rem; background:#0a0a14; border:1px solid #22c55e40; border-radius:1rem;">
				<p style="font-size:3rem; margin-bottom:1rem;">⚡</p>
				<h2 style="font-family:'Rajdhani',sans-serif; font-size:1.75rem; font-weight:900; color:#22c55e; margin:0 0 0.5rem;">CANDIDATURE ENVOYÉE</h2>
				<p style="color:#64748b; font-size:0.875rem;">
					Ta candidature a bien été reçue.<br/>
					Un email de confirmation t'a été envoyé.<br/>
					Un membre de l'équipe te contactera sur Discord !
				</p>
				<button onclick={() => { sent = false; }} style="
					margin-top:1.5rem; font-family:'Rajdhani',sans-serif; font-weight:700; font-size:0.8rem;
					letter-spacing:0.08em; padding:0.6rem 1.5rem;
					background:transparent; border:1px solid #1e1530; color:#64748b;
					border-radius:0.375rem; cursor:pointer;
				">Nouvelle candidature</button>
			</div>

		{:else}
			{#if localError || actionData?.error}
				<div style="background:#ef444415;border:1px solid #ef444440;border-radius:0.5rem;padding:0.875rem 1.25rem;margin-bottom:1rem;">
					<p style="color:#f87171;font-size:0.875rem;margin:0;">{localError || actionData?.error}</p>
				</div>
			{/if}

			<form method="POST" novalidate use:enhance={() => {
				localError = '';
				sending = true;
				return async ({ result, update }) => {
					try {
						if (result.type === 'success') {
							sent = true;
							await update({ reset: false });
							window.scrollTo({ top: 0, behavior: 'smooth' });
						} else {
							await update({ reset: false });
							window.scrollTo({ top: 0, behavior: 'smooth' });
						}
					} finally {
						sending = false;
					}
				};
			}} style="display:flex; flex-direction:column; gap:1.5rem;">

				<!-- Honeypot anti-spam (invisible aux humains) -->
				<div style="position:absolute;opacity:0;pointer-events:none;height:0;overflow:hidden;">
					<input type="text" name="website" tabindex="-1" autocomplete="off" />
				</div>

				<!-- Infos personnelles -->
				<div style={sectionStyle}>
					<h2 style={sectionTitleStyle}>Informations personnelles</h2>

					<div class="form-grid-2">
						<div>
							<label for="pseudo_mc" style={labelStyle}>Pseudo Minecraft *</label>
							<input id="pseudo_mc" name="pseudo_mc" required bind:value={form.pseudo_mc} style={inputStyle} placeholder="Steve" onfocus={focus} onblur={blur} />
						</div>
						<div>
							<label for="pseudo_discord" style={labelStyle}>Pseudo Discord *</label>
							<input id="pseudo_discord" name="pseudo_discord" required bind:value={form.pseudo_discord} style={inputStyle} placeholder="steve#0001" onfocus={focus} onblur={blur} />
						</div>
					</div>

					<div>
						<label for="email" style={labelStyle}>Adresse email * (pour la confirmation)</label>
						<input id="email" name="email" required type="email" bind:value={form.email} style={inputStyle} placeholder="ton@email.com" onfocus={focus} onblur={blur} />
					</div>

					<div class="form-grid-3">
						<div>
							<label for="age" style={labelStyle}>Âge *</label>
							<input id="age" name="age" required type="number" min="13" max="99" bind:value={form.age} style={inputStyle} placeholder="18" onfocus={focus} onblur={blur} />
						</div>
						<div>
							<label for="pays" style={labelStyle}>Pays / Fuseau *</label>
							<input id="pays" name="pays" required bind:value={form.pays} style={inputStyle} placeholder="France / UTC+1" onfocus={focus} onblur={blur} />
						</div>
						<div>
							<label for="disponibilite" style={labelStyle}>Dispo / semaine *</label>
							<input id="disponibilite" name="disponibilite" required bind:value={form.disponibilite} style={inputStyle} placeholder="10h" onfocus={focus} onblur={blur} />
						</div>
					</div>
				</div>

				<!-- Expérience -->
				<div style={sectionStyle}>
					<h2 style={sectionTitleStyle}>Expérience</h2>

					<div>
						<label for="exp_staff" style={labelStyle}>Déjà été staff sur un serveur ? Si oui, lequel et quel rôle ?</label>
						<textarea id="exp_staff" name="exp_staff" bind:value={form.exp_staff} rows="3" style="{inputStyle} resize:vertical;" placeholder="Ex : Modérateur sur ServeurXYZ pendant 6 mois..." onfocus={focus} onblur={blur}></textarea>
					</div>

					<div class="form-grid-2" style="align-items:end;">
						<div>
							<label for="anciennete_mc" style={labelStyle}>Depuis combien de temps joues-tu à Minecraft ? *</label>
							<input id="anciennete_mc" name="anciennete_mc" required bind:value={form.anciennete_mc} style={inputStyle} placeholder="5 ans" onfocus={focus} onblur={blur} />
						</div>
						<div>
							<label for="connais_rpg" style={labelStyle}>Connais-tu les serveurs RPG ? *</label>
							<select id="connais_rpg" name="connais_rpg" required bind:value={form.connais_rpg} style="{inputStyle} cursor:pointer;" onfocus={focus} onblur={blur}>
								<option value="" disabled>Sélectionne...</option>
								<option value="Non">Non</option>
								<option value="Un peu">Un peu</option>
								<option value="Oui">Oui</option>
							</select>
						</div>
					</div>

					{#if form.connais_rpg === 'Oui' || form.connais_rpg === 'Un peu'}
						<div>
							<label for="connais_rpg_detail" style={labelStyle}>Lesquels ?</label>
							<input id="connais_rpg_detail" name="connais_rpg_detail" bind:value={form.connais_rpg_detail} style={inputStyle} placeholder="Ex : Hypixel SkyBlock, McOrigins..." onfocus={focus} onblur={blur} />
						</div>
					{/if}
				</div>

				<!-- Motivation -->
				<div style={sectionStyle}>
					<h2 style={sectionTitleStyle}>Motivation</h2>

					<div>
						<label for="poste" style={labelStyle}>Quel poste t'intéresse ? *</label>
						<select id="poste" name="poste" required bind:value={form.poste} style="{inputStyle} cursor:pointer;" onfocus={focus} onblur={blur}>
							<option value="" disabled>Sélectionne un poste</option>
							{#each POSTES as p}
								<option value={p}>{p}</option>
							{/each}
						</select>
					</div>

					<div>
						<label for="pourquoi" style={labelStyle}>Pourquoi veux-tu rejoindre l'équipe SHINSEI ? *</label>
						<textarea id="pourquoi" name="pourquoi" required bind:value={form.pourquoi} rows="4" style="{inputStyle} resize:vertical;" placeholder="Explique ta motivation..." onfocus={focus} onblur={blur}></textarea>
					</div>

					<div>
						<label for="decouverte" style={labelStyle}>Comment as-tu découvert SHINSEI ?</label>
						<textarea id="decouverte" name="decouverte" bind:value={form.decouverte} rows="2" style="{inputStyle} resize:vertical;" placeholder="Réseaux sociaux, ami, YouTube..." onfocus={focus} onblur={blur}></textarea>
					</div>

					<div>
						<label for="apport" style={labelStyle}>Qu'est-ce que tu apporterais à l'équipe ? *</label>
						<textarea id="apport" name="apport" required bind:value={form.apport} rows="3" style="{inputStyle} resize:vertical;" placeholder="Tes points forts, ce qui te distingue..." onfocus={focus} onblur={blur}></textarea>
					</div>

					<div>
						<label for="competences" style={labelStyle}>Décris tes compétences pour ce poste *</label>
						<textarea id="competences" name="competences" required bind:value={form.competences} rows="3" style="{inputStyle} resize:vertical;" placeholder="Compétences techniques, outils maîtrisés, expériences..." onfocus={focus} onblur={blur}></textarea>
					</div>
				</div>

				<!-- Mises en situation -->
				<div style={sectionStyle}>
					<h2 style={sectionTitleStyle}>Mises en situation</h2>

					<div>
						<label for="cas1" style={labelStyle}>Un joueur insulte un autre joueur en jeu, que fais-tu ? *</label>
						<textarea id="cas1" name="cas1" required bind:value={form.cas1} rows="3" style="{inputStyle} resize:vertical;" placeholder="Décris les étapes que tu suivrais : avertissement, sanction, rapport..." onfocus={focus} onblur={blur}></textarea>
					</div>

					<div>
						<label for="cas2" style={labelStyle}>Tu découvres un bug critique sur le serveur, quelle est ta réaction ? *</label>
						<textarea id="cas2" name="cas2" required bind:value={form.cas2} rows="3" style="{inputStyle} resize:vertical;" placeholder="Qui alertes-tu en premier ? Comment documentes-tu le bug ?" onfocus={focus} onblur={blur}></textarea>
					</div>

					<div>
						<label for="cas3" style={labelStyle}>Un joueur se plaint d'une décision d'un autre staff, comment tu gères ? *</label>
						<textarea id="cas3" name="cas3" required bind:value={form.cas3} rows="3" style="{inputStyle} resize:vertical;" placeholder="Comment restes-tu neutre et impartial dans cette situation ?" onfocus={focus} onblur={blur}></textarea>
					</div>
				</div>

				<!-- Divers -->
				<div style={sectionStyle}>
					<h2 style={sectionTitleStyle}>Divers</h2>

					<div>
						<label for="questions" style={labelStyle}>As-tu des questions sur le projet ?</label>
						<textarea id="questions" name="questions" bind:value={form.questions} rows="2" style="{inputStyle} resize:vertical;" onfocus={focus} onblur={blur}></textarea>
					</div>

					<div>
						<label for="autre" style={labelStyle}>Autre chose à ajouter ?</label>
						<textarea id="autre" name="autre" bind:value={form.autre} rows="2" style="{inputStyle} resize:vertical;" onfocus={focus} onblur={blur}></textarea>
					</div>
				</div>

				<!-- Submit -->
				<button
					type="submit"
					disabled={sending}
					style="
						width:100%; padding:1rem;
						font-family:'Rajdhani',sans-serif; font-weight:900; font-size:1rem; letter-spacing:0.12em;
						background:#7c3aed; color:white; border:1px solid #9f67ff; border-radius:0.5rem;
						box-shadow:0 0 22px #7c3aed50; cursor:pointer; transition:all 0.2s;
						opacity:{sending ? '0.7' : '1'};
					"
					onmouseenter={(e) => { if (!sending) { (e.currentTarget as HTMLElement).style.background='#6d28d9'; (e.currentTarget as HTMLElement).style.boxShadow='0 0 35px #7c3aed80'; } }}
					onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.background='#7c3aed'; (e.currentTarget as HTMLElement).style.boxShadow='0 0 22px #7c3aed50'; }}
				>
					{sending ? 'ENVOI EN COURS…' : 'ENVOYER MA CANDIDATURE ⚡'}
				</button>

				<p style="text-align:center; font-family:'Share Tech Mono',monospace; font-size:0.65rem; color:#374151;">
					Envoi direct vers shinsei.serv@gmail.com · Réponse sur Discord
				</p>

			</form>
		{/if}
	</div>
</div>
