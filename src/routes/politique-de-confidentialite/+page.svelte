<svelte:head>
	<title>Politique de confidentialité — SHINSEI 新世</title>
</svelte:head>

<div style="min-height:100vh;background:#06060f;padding-top:80px;padding-bottom:60px;">
	<div style="max-width:760px;margin:0 auto;padding:0 1.5rem;">

		<div style="margin-bottom:2.5rem;">
			<p style="font-family:'Share Tech Mono',monospace;font-size:0.7rem;color:#7c3aed;letter-spacing:0.2em;margin-bottom:0.4rem;">JURIDIQUE</p>
			<h1 style="font-family:'Rajdhani',sans-serif;font-size:clamp(2rem,5vw,3rem);font-weight:900;color:white;margin:0;">POLITIQUE DE CONFIDENTIALITÉ</h1>
			<p style="color:#475569;font-size:0.8rem;margin-top:0.5rem;">Dernière mise à jour : juin 2026</p>
		</div>

		<div style="display:flex;flex-direction:column;gap:2.5rem;">

			{#each [
				{
					title: '1. Données collectées',
					content: `Dans le cadre de l'authentification Microsoft, SHINSEI collecte et stocke temporairement :<br/><br/>
					• Votre <strong style="color:#e2e8f0;">pseudo Minecraft</strong> et <strong style="color:#e2e8f0;">UUID</strong><br/>
					• Votre <strong style="color:#e2e8f0;">gamertag Xbox</strong> (utilisé pour l'identification)<br/>
					• L'<strong style="color:#e2e8f0;">URL de votre skin Minecraft</strong><br/><br/>
					Aucun mot de passe, email ou donnée financière n'est collecté ou stocké par SHINSEI.`
				},
				{
					title: '2. Utilisation des données',
					content: `Les données collectées sont utilisées exclusivement pour :<br/><br/>
					• Vous authentifier sur le site et le launcher SHINSEI<br/>
					• Afficher votre profil de joueur (stats, grade, classe, faction)<br/>
					• Afficher votre avatar sur les pages publiques (classement, liste des joueurs en ligne)<br/><br/>
					Vos données ne sont jamais vendues ni partagées avec des tiers.`
				},
				{
					title: '3. Sessions et cookies',
					content: `Un cookie de session (<code style="background:#0f0f1a;padding:0.1rem 0.4rem;border-radius:0.25rem;font-size:0.8rem;">shinsei_session</code>) est utilisé pour maintenir votre connexion.<br/><br/>
					Ce cookie est strictement fonctionnel — aucun cookie publicitaire ou de tracking n'est utilisé.<br/><br/>
					La session expire automatiquement après 7 jours d'inactivité ou à la déconnexion.`
				},
				{
					title: '4. Authentification Microsoft',
					content: `La connexion utilise le protocole OAuth 2.0 de Microsoft.<br/><br/>
					SHINSEI ne voit jamais votre mot de passe Microsoft. Le processus d'authentification est entièrement géré par les serveurs de Microsoft.<br/><br/>
					Consultez la politique de confidentialité de Microsoft : <a href="https://privacy.microsoft.com" target="_blank" rel="noopener noreferrer" style="color:#7c3aed;">privacy.microsoft.com</a>`
				},
				{
					title: '5. Vos droits (RGPD)',
					content: `Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :<br/><br/>
					• <strong style="color:#e2e8f0;">Droit d'accès</strong> — demander quelles données nous détenons sur vous<br/>
					• <strong style="color:#e2e8f0;">Droit de suppression</strong> — demander la suppression de vos données<br/>
					• <strong style="color:#e2e8f0;">Droit de rectification</strong> — demander la correction de données inexactes<br/><br/>
					Pour exercer ces droits : <a href="mailto:shinsei.serv@gmail.com" style="color:#7c3aed;">shinsei.serv@gmail.com</a>`
				},
				{
					title: '6. Conservation des données',
					content: `Les données de session sont supprimées à la déconnexion ou après 7 jours.<br/><br/>
					Les données de jeu (stats, progression) sont conservées tant que votre compte est actif sur le serveur. En cas de départ définitif, contactez-nous pour une suppression complète.`
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
