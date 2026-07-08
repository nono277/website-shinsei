<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';

	const breadcrumbSchema = {
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://playshinsei.fr' },
			{ '@type': 'ListItem', position: 2, name: 'Mentions légales', item: 'https://playshinsei.fr/mentions-legales' }
		]
	};
</script>
<SEO
	title="Mentions légales – Shinsei | Serveur Minecraft MMORPG"
	description="Mentions légales du site officiel Shinsei : éditeur, hébergeur, propriété intellectuelle et responsabilité."
	canonical="https://playshinsei.fr/mentions-legales"
	jsonLd={breadcrumbSchema}
/>

<div style="min-height:100vh;background:#06060f;padding-top:80px;padding-bottom:60px;">
	<div style="max-width:760px;margin:0 auto;padding:0 1.5rem;">

		<div style="margin-bottom:2.5rem;">
			<p style="font-family:'Share Tech Mono',monospace;font-size:0.7rem;color:#7c3aed;letter-spacing:0.2em;margin-bottom:0.4rem;">JURIDIQUE</p>
			<h1 style="font-family:'Rajdhani',sans-serif;font-size:clamp(2rem,5vw,3rem);font-weight:900;color:white;margin:0;">MENTIONS LÉGALES</h1>
			<p style="color:#475569;font-size:0.8rem;margin-top:0.5rem;">Dernière mise à jour : juin 2026</p>
		</div>

		<div style="display:flex;flex-direction:column;gap:2.5rem;">

			{#each [
				{
					title: '1. Éditeur du site',
					content: `Le site <strong style="color:#e2e8f0;">playshinsei.fr</strong> est édité par :<br/><br/>
					<strong style="color:#e2e8f0;">NoPleyZz</strong> — Fondateur<br/><br/>
					Contact : <a href="mailto:shinsei.serv@gmail.com" style="color:#7c3aed;">shinsei.serv@gmail.com</a>`
				},
				{
					title: '2. Hébergement',
					content: `Le site est hébergé par :<br/><br/>
					<strong style="color:#e2e8f0;">Contabo GmbH</strong><br/>
					Aschauer Straße 32a, 81549 Munich, Allemagne<br/>
					<a href="https://contabo.com" target="_blank" rel="noopener noreferrer" style="color:#7c3aed;">contabo.com</a>`
				},
				{
					title: '3. Propriété intellectuelle',
					content: `L'ensemble du contenu du site (textes, graphismes, logos, images, univers SHINSEI) est la propriété exclusive de l'équipe SHINSEI et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.<br/><br/>
					Toute reproduction, représentation, modification ou distribution sans autorisation écrite préalable est interdite.`
				},
				{
					title: '4. Minecraft & Mojang',
					content: `SHINSEI est un serveur communautaire non officiel.<br/><br/>
					<strong style="color:#e2e8f0;">SHINSEI n'est pas affilié à Mojang Studios ni à Microsoft Corporation.</strong><br/><br/>
					Minecraft™ est une marque déposée de Microsoft Corporation. L'utilisation du nom et des éléments Minecraft est soumise aux conditions d'utilisation de Mojang : <a href="https://account.mojang.com/terms" target="_blank" rel="noopener noreferrer" style="color:#7c3aed;">account.mojang.com/terms</a>`
				},
				{
					title: '5. Limitation de responsabilité',
					content: `L'équipe SHINSEI s'efforce d'assurer la disponibilité du serveur et du site, mais ne peut garantir un service ininterrompu.<br/><br/>
					SHINSEI ne saurait être tenu responsable des dommages directs ou indirects liés à l'utilisation du site ou du serveur de jeu.`
				},
				{
					title: '6. Contact',
					content: `Pour toute question relative aux présentes mentions légales :<br/><br/>
					Email : <a href="mailto:shinsei.serv@gmail.com" style="color:#7c3aed;">shinsei.serv@gmail.com</a><br/>
					Discord : <a href="https://discord.gg/DcN95Dbx4" target="_blank" rel="noopener noreferrer" style="color:#7c3aed;">discord.gg/DcN95Dbx4</a>`
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
