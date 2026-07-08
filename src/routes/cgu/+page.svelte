<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';

	const breadcrumbSchema = {
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://playshinsei.fr' },
			{ '@type': 'ListItem', position: 2, name: 'CGU', item: 'https://playshinsei.fr/cgu' }
		]
	};
</script>
<SEO
	title="CGU – Conditions Générales d'Utilisation | Shinsei"
	description="Conditions générales d'utilisation du serveur Minecraft MMORPG Shinsei et de son site officiel playshinsei.fr."
	canonical="https://playshinsei.fr/cgu"
	jsonLd={breadcrumbSchema}
/>

<div style="min-height:100vh;background:#06060f;padding-top:80px;padding-bottom:60px;">
	<div style="max-width:760px;margin:0 auto;padding:0 1.5rem;">

		<div style="margin-bottom:2.5rem;">
			<p style="font-family:'Share Tech Mono',monospace;font-size:0.7rem;color:#7c3aed;letter-spacing:0.2em;margin-bottom:0.4rem;">JURIDIQUE</p>
			<h1 style="font-family:'Rajdhani',sans-serif;font-size:clamp(2rem,5vw,3rem);font-weight:900;color:white;margin:0;">CONDITIONS D'UTILISATION</h1>
			<p style="color:#475569;font-size:0.8rem;margin-top:0.5rem;">Dernière mise à jour : juin 2026</p>
		</div>

		<div style="display:flex;flex-direction:column;gap:2.5rem;">

			{#each [
				{
					title: '1. Acceptation des conditions',
					content: `En accédant au site <strong style="color:#e2e8f0;">playshinsei.fr</strong> ou en jouant sur le serveur SHINSEI, vous acceptez pleinement et sans réserve les présentes conditions d'utilisation.<br/><br/>
					Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.`
				},
				{
					title: '2. Accès au serveur',
					content: `Le serveur SHINSEI est accessible aux joueurs possédant une <strong style="color:#e2e8f0;">licence Minecraft Java Edition valide</strong>.<br/><br/>
					L'équipe SHINSEI se réserve le droit de :<br/>
					• Suspendre ou bannir tout joueur ne respectant pas les règles du serveur<br/>
					• Modifier les règles, mécaniques de jeu et contenu à tout moment<br/>
					• Interrompre le service pour maintenance sans préavis`
				},
				{
					title: '3. Règles de conduite',
					content: `Sur le serveur et le Discord SHINSEI, il est strictement interdit de :<br/><br/>
					• Utiliser des mods ou logiciels de triche (hacks, autoclickers, x-ray…)<br/>
					• Harceler, insulter ou menacer d'autres joueurs<br/>
					• Exploiter des bugs sans les signaler à l'équipe<br/>
					• Usurper l'identité d'un membre du staff<br/>
					• Faire de la publicité pour d'autres serveurs<br/><br/>
					Tout manquement peut entraîner un ban temporaire ou définitif sans remboursement.`
				},
				{
					title: '4. Achats et grades boutique',
					content: `Les achats de grades cosmétiques sont :<br/><br/>
					• <strong style="color:#e2e8f0;">Définitifs et non remboursables</strong> sauf défaut technique avéré<br/>
					• <strong style="color:#e2e8f0;">Purement cosmétiques</strong> — aucun avantage de gameplay n'est vendu<br/>
					• Liés à votre compte Minecraft, non transférables<br/><br/>
					En cas de ban permanent pour triche grave, aucun remboursement ne sera effectué.`
				},
				{
					title: '5. Contenu utilisateur',
					content: `En jouant sur SHINSEI, vous accordez à l'équipe le droit d'utiliser votre pseudo et vos statistiques de jeu à des fins promotionnelles (classements, captures d'écran, streams officiels).<br/><br/>
					Les constructions réalisées sur le serveur restent votre propriété intellectuelle mais sont soumises au droit de modération de l'équipe.`
				},
				{
					title: '6. Modification des CGU',
					content: `L'équipe SHINSEI se réserve le droit de modifier les présentes conditions à tout moment.<br/><br/>
					Les modifications entrent en vigueur dès leur publication sur cette page. La date de mise à jour est indiquée en haut du document.<br/><br/>
					La continuité d'utilisation du service après modification vaut acceptation des nouvelles conditions.`
				},
				{
					title: '7. Droit applicable',
					content: `Les présentes conditions sont soumises au <strong style="color:#e2e8f0;">droit français</strong>.<br/><br/>
					En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, les tribunaux français seront seuls compétents.<br/><br/>
					Contact : <a href="mailto:shinsei.serv@gmail.com" style="color:#7c3aed;">shinsei.serv@gmail.com</a>`
				},
			] as section}
				<div style="background:#0a0a14;border:1px solid #1e1530;border-radius:0.75rem;padding:1.75rem;">
					<h2 style="font-family:'Rajdhani',sans-serif;font-size:1.2rem;font-weight:900;color:#7c3aed;margin:0 0 1rem;letter-spacing:0.04em;">{section.title}</h2>
					<p style="font-size:0.875rem;color:#94a3b8;line-height:1.75;">{@html section.content}</p>
				</div>
			{/each}

		</div>
	</div>
</div>
