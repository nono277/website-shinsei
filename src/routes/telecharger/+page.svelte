<script lang="ts">
	import { slide } from 'svelte/transition';
	import loadingBg from '$lib/img/loading/loading.png';

	interface ChangelogEntry { version: string; date: string; changes: string[]; }

	const changelog: ChangelogEntry[] = [
		{
			version: 'v1.0', date: '28 mai 2026',
			changes: [
				'Lancement officiel du launcher SHINSEI',
				'Connexion Microsoft intégrée',
				'Téléchargement automatique des mods',
				'Écran de chargement custom SHINSEI',
				'Intégration stats serveur en temps réel',
				'Interface immersive avec fond animé',
			]
		},
	];

	const steps = [
		{ num: '01', title: 'Télécharger', desc: 'Télécharge le launcher SHINSEI. Installation guidée, aucune configuration requise.' },
		{ num: '02', title: 'Connecter',   desc: 'Connecte ton compte Microsoft. Le launcher télécharge automatiquement tous les mods nécessaires.' },
		{ num: '03', title: 'Jouer',       desc: "Clique sur JOUER. Tu arrives directement sur le serveur SHINSEI. L'aventure commence." },
	];

	const faq = [
		{ q: 'Est-ce que le launcher est gratuit ?',
		  a: 'Oui, le launcher SHINSEI est entièrement gratuit. Seul un compte Minecraft Java Edition est requis.' },
		{ q: 'Java est-il inclus ?',
		  a: 'Oui, le launcher installe automatiquement Java 17 si nécessaire.' },
		{ q: 'Le launcher fonctionne-t-il sur Mac ou Linux ?',
		  a: "Pour l'instant le launcher est disponible uniquement sur Windows 10/11. Des versions Mac et Linux sont en développement." },
		{ q: 'Comment mettre à jour le launcher ?',
		  a: 'Le launcher se met à jour automatiquement au démarrage. Aucune action requise.' },
	];

	let openChangelog = $state<string | null>('v1.0');
	let openFaq       = $state<number | null>(null);
</script>

<svelte:head><title>Télécharger — SHINSEI 新世</title></svelte:head>

<!-- ── HERO ── -->
<section style="position:relative; padding:10rem 1.5rem; text-align:center; overflow:hidden; background:#0a0a0f;">
	<div style="position:absolute; inset:0; z-index:0;">
		<img src={loadingBg} alt="" style="width:100%; height:100%; object-fit:cover; object-position:center;" />
		<div style="position:absolute; inset:0; background:linear-gradient(to bottom, #0a0a0f50, #0a0a0f70, #0a0a0f);"></div>
	</div>

	<div style="position:relative; z-index:1; max-width:48rem; margin:0 auto; display:flex; flex-direction:column; align-items:center; gap:1.5rem;">
		<p class="label-mono" style="color:#7c3aed;">LAUNCHER OFFICIEL</p>

		<h1 style="font-family:'Rajdhani',sans-serif; font-size:clamp(2.5rem,7vw,4.5rem); font-weight:900; color:white; line-height:1; text-shadow:0 0 40px #7c3aed80, 0 0 80px #7c3aed30;">
			TÉLÉCHARGER<br/><span style="color:#7c3aed;">SHINSEI</span>
		</h1>

		<p style="color:#94a3b8; font-size:1.05rem; line-height:1.65; max-width:34rem;">
			Le launcher officiel SHINSEI installe automatiquement Minecraft 1.20.1, Forge et toutes les ressources nécessaires.
		</p>

		<a href="http://cdn.playshinsei.fr/launcher/shinsei-setup.exe" download style="
			display:flex; align-items:center; gap:0.75rem;
			padding:1rem 2.5rem;
			font-family:'Rajdhani',sans-serif; font-weight:900; font-size:1.1rem; letter-spacing:0.12em;
			background:#7c3aed; color:white;
			border:1px solid #9f67ff; border-radius:0.5rem;
			box-shadow:0 0 30px #7c3aed70, 0 0 60px #7c3aed30;
			transition:box-shadow 0.25s, background 0.25s;
		"
			onmouseenter={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.boxShadow='0 0 50px #7c3aed, 0 0 100px #7c3aed50'; el.style.background='#6d28d9'; }}
			onmouseleave={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.boxShadow='0 0 30px #7c3aed70, 0 0 60px #7c3aed30'; el.style.background='#7c3aed'; }}
		>
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
				<polyline points="7 10 12 15 17 10"/>
				<line x1="12" y1="15" x2="12" y2="3"/>
			</svg>
			TÉLÉCHARGER POUR WINDOWS
		</a>

		<div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap; justify-content:center;">
			{#each ['v1.0', 'Minecraft 1.20.1 Forge', '~180 MB', 'Gratuit'] as item, i}
				{#if i > 0}<span style="width:3px; height:3px; border-radius:50%; background:#374151;"></span>{/if}
				<span class="label-mono" style="color:#4b5563;">{item}</span>
			{/each}
		</div>
	</div>
</section>

<!-- ── 3 ÉTAPES ── -->
<section style="padding:5rem 1.5rem; background:#0d0d15; border-top:1px solid #1e1530;">
	<div style="max-width:56rem; margin:0 auto;">
		<h2 style="font-family:'Rajdhani',sans-serif; font-size:clamp(1.8rem,4vw,2.5rem); font-weight:900; color:white; text-align:center; margin-bottom:3.5rem;">
			3 ÉTAPES POUR JOUER
		</h2>
		<div style="display:grid; grid-template-columns:repeat(3,1fr); gap:2.5rem;" class="grid-steps">
			{#each steps as step, i}
				<div style="display:flex; flex-direction:column; gap:1rem; position:relative;">
					{#if i < 2}
						<div style="position:absolute; top:1.4rem; left:calc(100% + 0.25rem); right:calc(-100% - 0.25rem); height:1px; background:linear-gradient(90deg,#7c3aed50,transparent); pointer-events:none;"></div>
					{/if}
					<div style="
						width:3rem; height:3rem; border-radius:0.625rem; flex-shrink:0;
						display:flex; align-items:center; justify-content:center;
						font-family:'Rajdhani',sans-serif; font-weight:900; font-size:1.1rem;
						background:#7c3aed18; border:1px solid #7c3aed50; color:#7c3aed;
					">{step.num}</div>
					<h3 style="font-family:'Rajdhani',sans-serif; font-size:1.2rem; font-weight:900; color:white;">{step.title}</h3>
					<p style="font-size:0.85rem; color:#64748b; line-height:1.65;">{step.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ── CONFIG REQUISE ── -->
<section id="download" style="padding:5rem 1.5rem; background:#0a0a0f;">
	<div style="max-width:56rem; margin:0 auto;">
		<h2 style="font-family:'Rajdhani',sans-serif; font-size:clamp(1.8rem,4vw,2.5rem); font-weight:900; color:white; text-align:center; margin-bottom:2.5rem;">
			CONFIGURATION REQUISE
		</h2>
		<div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;" class="grid-config">
			{#each [
				{ label:'MINIMUM',     border:'#1e1530',   rows:[['Système','Windows 10 / 11 (64-bit)'],['Java','Java 17+ (inclus dans le launcher)'],['RAM','4 Go minimum'],['Stockage','2 Go d\'espace libre'],['Réseau','Connexion internet stable']] },
				{ label:'RECOMMANDÉ',  border:'#7c3aed40', rows:[['Système','Windows 11 (64-bit)'],['Java','Java 21'],['RAM','8 Go allouée à Java'],['Stockage','SSD 5 Go libres'],['GPU','GTX 1060 / RX 580 ou supérieur']] },
			] as card}
				<div style="padding:1.5rem; border-radius:0.75rem; background:#0d0d15; border:1px solid {card.border};">
					<p class="label-mono" style="color:#7c3aed; margin-bottom:1.25rem;">{card.label}</p>
					<div style="display:flex; flex-direction:column; gap:0.75rem;">
						{#each card.rows as [key, val]}
							<div style="display:flex; justify-content:space-between; align-items:baseline; gap:1rem; font-size:0.85rem;">
								<span style="color:#4b5563; flex-shrink:0;">{key}</span>
								<span style="color:#e2e8f0; font-weight:600; text-align:right;">{val}</span>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ── CHANGELOG ── -->
<section style="padding:5rem 1.5rem; background:#0d0d15; border-top:1px solid #1e1530;">
	<div style="max-width:56rem; margin:0 auto;">
		<h2 style="font-family:'Rajdhani',sans-serif; font-size:clamp(1.8rem,4vw,2.5rem); font-weight:900; color:white; text-align:center; margin-bottom:2.5rem;">
			NOTES DE MISE À JOUR
		</h2>
		<div style="display:flex; flex-direction:column; gap:0.5rem;">
			{#each changelog as entry}
				<div style="border:1px solid #1e1530; border-radius:0.625rem; overflow:hidden;">
					<button
						onclick={() => openChangelog = openChangelog === entry.version ? null : entry.version}
						style="width:100%; display:flex; align-items:center; justify-content:space-between; padding:1rem 1.25rem; background:#0a0a0f; cursor:pointer; transition:background 0.2s;"
						onmouseenter={(e)=>(e.currentTarget as HTMLElement).style.background='#0d0d15'}
						onmouseleave={(e)=>(e.currentTarget as HTMLElement).style.background='#0a0a0f'}
					>
						<div style="display:flex; align-items:center; gap:0.75rem;">
							<span style="font-family:'Rajdhani',sans-serif; font-size:1.1rem; font-weight:900; color:{entry.version==='v1.0'?'#7c3aed':'#94a3b8'};">{entry.version}</span>
							{#if entry.version === 'v1.0'}
								<span style="font-family:'Share Tech Mono',monospace; font-size:0.6rem; padding:0.15rem 0.5rem; border-radius:0.25rem; background:#7c3aed25; color:#7c3aed; border:1px solid #7c3aed50;">ACTUEL</span>
							{/if}
							<span style="font-size:0.8rem; color:#4b5563;">{entry.date}</span>
						</div>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2"
							style="flex-shrink:0; transform:rotate({openChangelog===entry.version?'180deg':'0deg'}); transition:transform 0.2s;">
							<path d="M7 10l5 5 5-5"/>
						</svg>
					</button>
					{#if openChangelog === entry.version}
						<div transition:slide={{ duration:200 }} style="padding:1rem 1.25rem; background:#0d0d15; border-top:1px solid #1e1530;">
							<ul style="display:flex; flex-direction:column; gap:0.5rem;">
								{#each entry.changes as change}
									<li style="display:flex; align-items:flex-start; gap:0.5rem; font-size:0.85rem; color:#94a3b8; line-height:1.5;">
										<span style="color:#7c3aed; flex-shrink:0; margin-top:2px;">▸</span>
										{change}
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ── FAQ ── -->
<section style="padding:5rem 1.5rem; background:#0a0a0f;">
	<div style="max-width:56rem; margin:0 auto;">
		<h2 style="font-family:'Rajdhani',sans-serif; font-size:clamp(1.8rem,4vw,2.5rem); font-weight:900; color:white; text-align:center; margin-bottom:2.5rem;">
			QUESTIONS FRÉQUENTES
		</h2>
		<div style="display:flex; flex-direction:column; gap:0.5rem; max-width:42rem; margin:0 auto;">
			{#each faq as item, i}
				<div style="border:1px solid #1e1530; border-radius:0.625rem; overflow:hidden;">
					<button
						onclick={() => openFaq = openFaq === i ? null : i}
						style="width:100%; display:flex; align-items:center; justify-content:space-between; padding:1rem 1.25rem; background:#0d0d15; cursor:pointer; transition:background 0.2s;"
						onmouseenter={(e)=>(e.currentTarget as HTMLElement).style.background='#12121f'}
						onmouseleave={(e)=>(e.currentTarget as HTMLElement).style.background='#0d0d15'}
					>
						<span style="font-family:'Rajdhani',sans-serif; font-weight:800; font-size:1rem; color:white; text-align:left;">{item.q}</span>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5"
							style="flex-shrink:0; margin-left:0.75rem; transform:rotate({openFaq===i?'180deg':'0deg'}); transition:transform 0.2s;">
							<path d="M6 9l6 6 6-6"/>
						</svg>
					</button>
					{#if openFaq === i}
						<div transition:slide={{ duration:200 }} style="padding:0.875rem 1.25rem; background:#0a0a0f; border-top:1px solid #1e1530;">
							<p style="font-size:0.875rem; color:#94a3b8; line-height:1.65;">{item.a}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	@media (max-width: 640px) {
		.grid-steps { grid-template-columns: 1fr !important; }
		.grid-config { grid-template-columns: 1fr !important; }
	}
</style>
