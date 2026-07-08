<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { classes }                      from '$lib/data/classes';
	import { gameRanks }                    from '$lib/data/grades';
	import { factions, loreText, timeline, dungeons, factionRelations, guildRanks, guildChunkLimits, guildCommands, guildTypes } from '$lib/data/lore';
	import { commandCategories, statInfos, classMechanics, failleRanks, failleRules, difficultyModes } from '$lib/data/wiki';

	import iconClassImg from '$lib/img/icon class/iconclass.png';
	import rankSS from '$lib/img/icon des rangs/SS.png';
	import rankS  from '$lib/img/icon des rangs/S.png';
	import rankA  from '$lib/img/icon des rangs/A.png';
	import rankB  from '$lib/img/icon des rangs/B.png';
	import rankC  from '$lib/img/icon des rangs/C.png';
	import rankD  from '$lib/img/icon des rangs/D.png';

	const rankIconMap: Record<string, string> = {
		'Abyssal': rankSS, 'Souverain': rankS,
		'Transcendant': rankA, 'Fléau': rankB,
		'Briseur': rankC, 'Éveillé': rankD,
	};

	type Section = 'lore' | 'commandes' | 'classes' | 'competences' | 'stats' | 'rangs' | 'factions' | 'guildes' | 'failles' | 'donjons' | 'difficulte' | 'pvp';
	let activeSection = $state<Section>('lore');
	let activeClass   = $state(classes[0].id);
	let activeSkillClass = $state(classMechanics[0].id);

	const sections: { id: Section; label: string; icon: string; desc: string }[] = [
		{ id:'lore',       label:'Lore',        icon:'📖', desc:'Histoire du monde'    },
		{ id:'commandes',  label:'Commandes',   icon:'⌨️',  desc:'Toutes les commandes' },
		{ id:'competences',label:'Classes/Compétences', icon:'⚔️',  desc:'5 voies · capacités & arbres' },
		{ id:'stats',      label:'Stats',       icon:'📊',  desc:'Force, Agilité…'      },
		{ id:'rangs',      label:'Rangs',       icon:'🏆',  desc:'Progression Éveillé'  },
		{ id:'factions',   label:'Factions',    icon:'🚩',  desc:'3 factions en guerre' },
		{ id:'guildes',    label:'Guildes',     icon:'🛡️',  desc:'Créer & rejoindre'    },
		{ id:'failles',    label:'Failles',     icon:'🌀',  desc:'Rangs & récompenses'  },
		{ id:'donjons',    label:'Donjons',     icon:'🏰',  desc:'Instances & Boss'     },
		{ id:'difficulte', label:'Difficulté',  icon:'🎯',  desc:'Normal / Hardcore'    },
		{ id:'pvp',        label:'PvP',         icon:'💥',  desc:'Combats entre joueurs'},
	];

	let currentSkillClass = $derived(classMechanics.find(c => c.id === activeSkillClass)!);

	let currentClass   = $derived(classes.find(c => c.id === activeClass)!);
	let currentSection = $derived(sections.find(s => s.id === activeSection)!);

	const rankShowcase: { label: string; icon: string | null; color: string; name: string }[] = [
		{ label:'—',  icon:null,   color:'#6b7280', name:'Dormant'     },
		{ label:'D',  icon:rankD,  color:'#22c55e', name:'Éveillé'     },
		{ label:'C',  icon:rankC,  color:'#3b82f6', name:'Briseur'     },
		{ label:'B',  icon:rankB,  color:'#f59e0b', name:'Fléau'       },
		{ label:'A',  icon:rankA,  color:'#a855f7', name:'Transcendant'},
		{ label:'S',  icon:rankS,  color:'#f59e0b', name:'Souverain'   },
		{ label:'SS', icon:rankSS, color:'#ef4444', name:'Abyssal'     },
	];

	const rankLetterIconMap: Record<string, string> = {
		'D': rankD, 'C': rankC, 'B': rankB, 'A': rankA, 'S': rankS, 'SS': rankSS
	};

	function difficultyFromRank(rank: string): number {
		const map: Record<string, number> = { 'D': 1, 'C': 1, 'B': 2, 'A': 2, 'S': 3, 'SS': 3 };
		return map[rank] ?? 1;
	}

	const pvpModes = [
		{ title:'Conséquences de la mort', icon:'💀', color:'#ef4444',
		  desc:"Tomber au combat applique la pénalité de ta difficulté. En Normal : −50 % de la progression du niveau en cours et −5 % de tes éclats, équipement conservé. En Hardcore : −100 % de la progression du niveau, −25 % de tes éclats et ton équipement tombe au sol. Tu ne perds jamais de niveau." },
		{ title:'Rivalités de faction',    icon:'⚔️', color:'#f59e0b',
		  desc:"L'Ordre et Les Fracturés sont ennemis jurés ; Les Nomades restent neutres avec les deux camps. Ta faction — attribuée sur le serveur — définit tes alliés et tes cibles légitimes." },
		{ title:'Territoires protégés',    icon:'🛡️', color:'#06b6d4',
		  desc:"Les claims (perso ou de guilde) empêchent les non-autorisés de casser/poser des blocs et d'ouvrir tes coffres. Règle l'accès en Privé, Faction ou Public via /claim access. Impossible de claim sur une faille active." },
	];
</script>

<svelte:head><title>Wiki — SHINSEI 新世</title></svelte:head>

<div style="min-height:100vh;display:flex;background:#0a0a0f;position:relative;">

	<!-- ══════════════════════════════════════════════
	     SIDEBAR DESKTOP
	══════════════════════════════════════════════ -->
	<aside style="
		display:none;
		width:15rem;flex-shrink:0;
		position:sticky;top:60px;
		height:calc(100vh - 60px);
		overflow-y:auto;
		background:#0d0d15;
		border-right:1px solid #1e1530;
	" class="lg:flex lg:flex-col">

		<!-- Logo wiki -->
		<div style="
			padding:1.5rem 1.25rem 1rem;
			border-bottom:1px solid #1e1530;
		">
			<p style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#374151;margin-bottom:0.25rem;">Base de données</p>
			<h2 style="font-family:'Rajdhani',sans-serif;font-size:1.3rem;font-weight:900;color:white;">WIKI SHINSEI</h2>
		</div>

		<!-- Navigation -->
		<nav style="padding:0.75rem 0.75rem;flex:1;">
			{#each sections as s}
				{@const active = activeSection === s.id}
				<button
					onclick={() => activeSection = s.id}
					style="
						width:100%;display:flex;align-items:center;gap:0.75rem;
						padding:0.65rem 0.75rem;border-radius:0.5rem;
						margin-bottom:0.2rem;cursor:pointer;
						background:{active ? 'linear-gradient(90deg,#7c3aed18,#7c3aed08)' : 'transparent'};
						border:1px solid {active ? '#7c3aed30' : 'transparent'};
						border-left:3px solid {active ? '#7c3aed' : 'transparent'};
						transition:all 0.15s;
						position:relative;
					"
					onmouseenter={(e)=>{ if(!active)(e.currentTarget as HTMLElement).style.background='#ffffff06'; }}
					onmouseleave={(e)=>{ if(!active)(e.currentTarget as HTMLElement).style.background='transparent'; }}
				>
					<span style="font-size:1.1rem;flex-shrink:0;line-height:1;">{s.icon}</span>
					<div style="text-align:left;min-width:0;">
						<div style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.4rem;color:{active?'#c4b5fd':'#cbd5e1'};line-height:1;letter-spacing:0.03em;">{s.label}</div>
						<div style="font-family:'Share Tech Mono',monospace;font-size:0.62rem;color:{active?'#7c3aed':'#475569'};margin-top:3px;">{s.desc}</div>
					</div>
				</button>
			{/each}
		</nav>

		<!-- Footer sidebar -->
		<div style="padding:1rem 1.25rem;border-top:1px solid #1e1530;">
			<p style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;color:#1f2937;line-height:1.5;">
				SHINSEI 新世 · Wiki v1.1<br/>Dernière màj : Juillet 2026
			</p>
		</div>
	</aside>

	<!-- ══════════════════════════════════════════════
	     NAV MOBILE
	══════════════════════════════════════════════ -->
	<div style="
		position:fixed;bottom:0;left:0;right:0;z-index:50;
		display:flex;
		background:#0d0d15;
		border-top:1px solid #1e1530;
		box-shadow:0 -8px 24px #00000060;
	" class="lg:hidden">
		{#each sections as s}
			{@const active = activeSection === s.id}
			<button
				onclick={() => activeSection = s.id}
				style="
					flex:1;display:flex;flex-direction:column;align-items:center;
					padding:0.45rem 0.25rem;gap:0.15rem;
					background:none;border:none;cursor:pointer;
					border-top:2px solid {active ? '#7c3aed' : 'transparent'};
					transition:border-color 0.15s;
				"
			>
				<span style="font-size:1rem;">{s.icon}</span>
				<span style="
					font-family:'Share Tech Mono',monospace;font-size:0.5rem;letter-spacing:0.05em;
					color:{active ? '#a78bfa' : '#374151'};transition:color 0.15s;
				">{s.label}</span>
			</button>
		{/each}
	</div>

	<!-- ══════════════════════════════════════════════
	     CONTENU
	══════════════════════════════════════════════ -->
	<div style="flex:1;min-width:0;overflow-y:auto;padding-bottom:5rem;" class="lg:pb-0">
		{#key activeSection}
			<div transition:fade={{ duration:160 }}>

				<!-- ─── En-tête de section ─────────────────── -->
				<div style="
					padding:2rem 2rem 0;
					border-bottom:1px solid #1e1530;
					margin-bottom:2rem;
					background:linear-gradient(to bottom,#0d0d1580,transparent);
					display:flex;justify-content:center;
				" class="wiki-header-pad">
					<div style="display:flex;align-items:flex-end;gap:1rem;padding-bottom:1.25rem;max-width:52rem;margin:0 auto;">
						<span style="font-size:2.5rem;line-height:1;">{currentSection.icon}</span>
						<div>
							<p style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#7c3aed;margin-bottom:0.2rem;">{currentSection.desc}</p>
							<h1 style="font-family:'Rajdhani',sans-serif;font-size:clamp(1.8rem,4vw,2.8rem);font-weight:900;color:white;line-height:1;text-shadow:0 0 30px #7c3aed20;">{currentSection.label.toUpperCase()}</h1>
						</div>
					</div>
				</div>

				<div style="padding:0 2rem 3rem;max-width:52rem;margin:0 auto;" class="wiki-content-pad">

				<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
				     LORE
				━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
				{#if activeSection === 'lore'}
					<!-- Citation d'intro -->
					<div style="
						padding:1.25rem 1.5rem;
						border-left:3px solid #7c3aed;
						background:#7c3aed0a;
						border-radius:0 0.5rem 0.5rem 0;
						margin-bottom:2rem;
					">
						<p style="font-family:'Rajdhani',sans-serif;font-size:1.1rem;font-weight:700;color:#c4b5fd;font-style:italic;line-height:1.5;">
							"En 2031, le monde apprit qu'il n'était pas seul. Pas dans l'espace — mais dans une autre dimension, juste derrière le voile de la réalité."
						</p>
					</div>

					<div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:2.5rem;">
						{#each loreText.full.split('\n\n').filter(p => p.trim()) as paragraph, i}
							<p style="color:#94a3b8;line-height:1.75;font-size:0.9rem;">{paragraph}</p>
						{/each}
					</div>

					<!-- Chronologie -->
					<div style="
						padding:1.5rem;border-radius:0.75rem;
						background:#0d0d15;border:1px solid #1e1530;
					">
						<h2 style="font-family:'Rajdhani',sans-serif;font-size:1.4rem;font-weight:900;color:#7c3aed;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.5rem;">
							<span style="width:20px;height:2px;background:#7c3aed;display:inline-block;"></span>
							CHRONOLOGIE
							<span style="flex:1;height:2px;background:linear-gradient(90deg,#7c3aed30,transparent);display:inline-block;"></span>
						</h2>
						{#each timeline as event, i}
							<div style="display:flex;gap:1rem;position:relative;" in:fly={{ x:-10, delay:i*60, duration:200 }}>
								<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:20px;">
									<div style="width:12px;height:12px;border-radius:50%;background:#7c3aed;box-shadow:0 0 10px #7c3aed80;flex-shrink:0;margin-top:3px;"></div>
									{#if i < timeline.length-1}
										<div style="width:2px;flex:1;background:linear-gradient(to bottom,#7c3aed50,transparent);min-height:1.5rem;margin-top:3px;"></div>
									{/if}
								</div>
								<div style="padding-bottom:1.5rem;flex:1;">
									<div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.25rem;">
										<span style="font-family:'Share Tech Mono',monospace;font-size:0.7rem;font-weight:700;color:#06b6d4;background:#06b6d415;border:1px solid #06b6d430;padding:0.1rem 0.5rem;border-radius:0.25rem;">{event.year}</span>
										<h3 style="font-family:'Rajdhani',sans-serif;font-weight:900;color:white;font-size:1rem;">{event.title}</h3>
									</div>
									<p style="font-size:0.82rem;color:#64748b;line-height:1.6;">{event.description}</p>
								</div>
							</div>
						{/each}
					</div>

				<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
				     CLASSES
				━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
				{:else if activeSection === 'classes'}
					<!-- Image panoramique des 5 classes -->
					<div style="
						border-radius:0.75rem;overflow:hidden;
						border:1px solid #1e1530;
						background:#050508;
						margin-bottom:1.75rem;
					">
						<img src={iconClassImg} alt="Les 5 classes" style="width:100%;max-height:260px;object-fit:contain;" />
					</div>

					<!-- Sélecteur de classe -->
					<div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1.75rem;">
						{#each classes as cls}
							{@const active = activeClass === cls.id}
							<button onclick={() => activeClass = cls.id} style="
								display:flex;align-items:center;gap:0.4rem;
								padding:0.45rem 1rem;border-radius:0.375rem;
								font-family:'Rajdhani',sans-serif;font-weight:800;font-size:0.875rem;
								background:{active ? cls.color+'22' : '#0d0d15'};
								color:{active ? cls.color : '#475569'};
								border:1px solid {active ? cls.color+'60' : '#1e1530'};
								cursor:pointer;transition:all 0.15s;
								box-shadow:{active ? `0 0 14px ${cls.color}25` : 'none'};
							">
								<span style="font-size:1rem;">{cls.icon}</span>
								{cls.name}
							</button>
						{/each}
					</div>

					<!-- Détail classe active -->
					{#key activeClass}
						<div transition:fade={{ duration:120 }}>
							<!-- Header classe -->
							<div style="
								padding:1.5rem;border-radius:0.75rem;
								background:linear-gradient(135deg,#0d0d15,{currentClass.color}10);
								border:1px solid {currentClass.color}35;
								margin-bottom:1.25rem;
								display:flex;align-items:center;gap:1.25rem;
							">
								<span style="font-size:3.5rem;line-height:1;filter:drop-shadow(0 0 15px {currentClass.color}60);">{currentClass.icon}</span>
								<div>
									<h2 style="font-family:'Rajdhani',sans-serif;font-size:2.2rem;font-weight:900;color:{currentClass.color};line-height:1;text-shadow:0 0 20px {currentClass.color}50;margin-bottom:0.2rem;">{currentClass.name}</h2>
									<p style="font-family:'Share Tech Mono',monospace;font-size:0.7rem;color:{currentClass.color}80;letter-spacing:0.08em;">{currentClass.tagline.toUpperCase()} · {currentClass.description.toUpperCase()}</p>
								</div>
							</div>

							<!-- Compétences -->
							<div style="display:flex;flex-direction:column;gap:0.75rem;">
								<p style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#374151;margin-bottom:0.25rem;">COMPÉTENCES</p>
								{#each currentClass.abilities as ability, i}
									<div style="
										border-radius:0.625rem;overflow:hidden;
										border:1px solid {ability.isSS ? currentClass.color+'55' : '#1e1530'};
										background:{ability.isSS ? `linear-gradient(135deg,#0d0d15,${currentClass.color}0d)` : '#0d0d15'};
									" in:fly={{ x:-8, delay:i*60, duration:180 }}>
										<!-- Barre de couleur en haut pour SS -->
										{#if ability.isSS}
											<div style="height:2px;background:linear-gradient(90deg,{currentClass.color},transparent);"></div>
										{/if}
										<div style="padding:1rem 1.1rem;">
											<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">
												<span style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.05rem;color:{currentClass.color};">{ability.name}</span>
												{#if ability.isSS}
													<div style="display:flex;align-items:center;gap:0.35rem;">
														<img src={rankSS} alt="SS" style="width:20px;height:20px;object-fit:contain;mix-blend-mode:screen;" />
														<span style="font-family:'Share Tech Mono',monospace;font-size:0.58rem;font-weight:700;padding:0.15rem 0.45rem;border-radius:0.25rem;background:{currentClass.color}20;color:{currentClass.color};border:1px solid {currentClass.color}40;letter-spacing:0.08em;">RANG SS REQUIS</span>
													</div>
												{:else}
													<span style="font-family:'Share Tech Mono',monospace;font-size:0.58rem;color:#374151;">Compétence {i+1}</span>
												{/if}
											</div>
											<p style="font-size:0.82rem;color:#94a3b8;line-height:1.6;">{ability.description}</p>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/key}

				<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
				     RANGS
				━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
				{:else if activeSection === 'rangs'}
					<p style="font-size:0.9rem;color:#94a3b8;line-height:1.7;margin-bottom:2rem;">
						Le système de rangs SHINSEI reflète votre progression en tant qu'Éveillé. Chaque rang débloque de nouveaux territoires, compétences et possibilités. Le rang <strong style="color:white;">Abyssal SS</strong> est le sommet absolu — <strong style="color:#ef4444;">un seul joueur par classe</strong> peut l'atteindre sur tout le serveur.
					</p>

					<!-- Showcase icônes rangs -->
					<div style="
						display:grid;grid-template-columns:repeat(7,1fr);gap:0.75rem;
						margin-bottom:2rem;
						padding:1.25rem;
						background:#0d0d15;border:1px solid #1e1530;border-radius:0.75rem;
					" class="rank-showcase-grid">
						{#each rankShowcase as r, i}
							<div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;" in:fly={{ y:10, delay:i*50, duration:200 }}>
								{#if r.icon}
									<img src={r.icon} alt="Rang {r.label}" style="width:52px;height:52px;object-fit:contain;mix-blend-mode:screen;" />
								{:else}
									<div style="width:52px;height:52px;display:flex;align-items:center;justify-content:center;border:1px dashed {r.color}60;border-radius:0.5rem;color:{r.color}80;font-size:1.3rem;">💤</div>
								{/if}
								<span style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1rem;color:{r.color};">{r.label}</span>
								<span style="font-family:'Share Tech Mono',monospace;font-size:0.5rem;color:{r.color}60;text-align:center;line-height:1.3;">{r.name}</span>
							</div>
						{/each}
					</div>

					<!-- Cartes rangs détaillées -->
					<div style="display:flex;flex-direction:column;gap:0.6rem;">
						{#each gameRanks as rank, i}
							<div style="
								display:grid;grid-template-columns:auto 1fr auto;
								align-items:center;gap:1rem;
								padding:0.9rem 1.1rem;
								border-radius:0.625rem;
								background:#0d0d15;
								border:1px solid #1e1530;
								border-left:3px solid {rank.color};
								transition:background 0.15s;
							" in:fly={{ x:-8, delay:i*40, duration:180 }}
							onmouseenter={(e)=>(e.currentTarget as HTMLElement).style.background='#12121f'}
							onmouseleave={(e)=>(e.currentTarget as HTMLElement).style.background='#0d0d15'}>
								<div style="display:flex;align-items:center;gap:0.75rem;">
									{#if rankIconMap[rank.name]}
										<img src={rankIconMap[rank.name]} alt={rank.name} style="width:36px;height:36px;object-fit:contain;mix-blend-mode:screen;" />
									{/if}
									<div>
										<div style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.05rem;color:{rank.color};line-height:1;">{rank.name}</div>
										<div style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;color:#374151;margin-top:2px;">{rank.xpRequired}</div>
									</div>
								</div>
								<div style="display:flex;flex-wrap:wrap;gap:0.35rem;">
									{#each rank.unlocks as unlock}
										<span style="font-size:0.72rem;color:#64748b;background:#ffffff08;padding:0.15rem 0.5rem;border-radius:0.25rem;border:1px solid #1e1530;">
											{unlock}
										</span>
									{/each}
								</div>
								<div style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.2rem;color:{rank.color}30;">{i+1}</div>
							</div>
						{/each}
					</div>

				<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
				     FACTIONS
				━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
				{:else if activeSection === 'factions'}
					<p style="font-size:0.9rem;color:#94a3b8;line-height:1.7;margin-bottom:2rem;">
						Rejoindre une faction est une décision qui définit votre existence dans SHINSEI. Vos alliés, vos ennemis, vos territoires, votre idéologie. Changement possible une fois tous les <strong style="color:white;">30 jours</strong> avec perte de <strong style="color:#ef4444;">50% de réputation</strong>.
					</p>

					<div style="display:flex;flex-direction:column;gap:1.25rem;margin-bottom:2.5rem;">
						{#each factions as faction, i}
							<div style="
								border-radius:0.875rem;overflow:hidden;
								border:1px solid {faction.colors.primary}35;
								background:linear-gradient(135deg,#0d0d15 60%,{faction.colors.primary}08);
							" in:fly={{ x:-8, delay:i*80, duration:200 }}>
								<div style="height:3px;background:linear-gradient(90deg,{faction.colors.primary},{faction.colors.primary}30,transparent);"></div>
								<div style="padding:1.5rem;">
									<div style="display:flex;align-items:flex-start;gap:1rem;margin-bottom:1rem;">
										<div style="
											width:52px;height:52px;border-radius:0.5rem;
											background:{faction.colors.primary}18;
											border:1px solid {faction.colors.primary}40;
											display:flex;align-items:center;justify-content:center;
											font-size:1.75rem;flex-shrink:0;
										">{faction.symbol}</div>
										<div style="flex:1;">
											<h2 style="font-family:'Rajdhani',sans-serif;font-size:1.6rem;font-weight:900;color:{faction.colors.primary};line-height:1;margin-bottom:0.2rem;">{faction.name}</h2>
											<p style="font-family:'Share Tech Mono',monospace;font-size:0.65rem;font-weight:700;letter-spacing:0.1em;color:{faction.colors.secondary};text-transform:uppercase;">{faction.philosophy}</p>
										</div>
									</div>
									<p style="font-size:0.875rem;color:#94a3b8;line-height:1.7;margin-bottom:1rem;">{faction.longDescription}</p>
									<!-- Avantages -->
									<div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
										{#each faction.advantages as adv}
											<span style="font-size:0.72rem;color:{faction.colors.primary};background:{faction.colors.primary}12;padding:0.2rem 0.6rem;border-radius:0.25rem;border:1px solid {faction.colors.primary}30;">
												{adv}
											</span>
										{/each}
									</div>
								</div>
							</div>
						{/each}
					</div>

					<!-- Tableau des relations -->
					<div style="padding:1.25rem;border-radius:0.75rem;background:#0d0d15;border:1px solid #1e1530;margin-bottom:1.5rem;">
						<h3 style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.1rem;color:white;margin-bottom:1rem;">RELATIONS ENTRE FACTIONS</h3>
						<div style="overflow-x:auto;">
							<table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
								<thead>
									<tr>
										<th style="padding:0.5rem 0.75rem;text-align:left;font-family:'Share Tech Mono',monospace;font-size:0.6rem;color:#374151;font-weight:700;border-bottom:1px solid #1e1530;"></th>
										{#each factions as f}
											<th style="padding:0.5rem 0.75rem;text-align:center;font-family:'Rajdhani',sans-serif;font-weight:900;color:{f.colors.primary};border-bottom:1px solid #1e1530;">{f.name}</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#each factions as row}
										<tr>
											<td style="padding:0.5rem 0.75rem;font-family:'Rajdhani',sans-serif;font-weight:900;color:{row.colors.primary};white-space:nowrap;border-bottom:1px solid #1e153030;">{row.name}</td>
											{#each factions as col}
												{@const rel = factionRelations[row.id]?.[col.id]}
												{@const relColor = rel === 'Alliés' ? '#22c55e' : rel === 'Ennemis' ? '#ef4444' : '#6b7280'}
												<td style="padding:0.5rem 0.75rem;text-align:center;border-bottom:1px solid #1e153030;">
													<span style="font-family:'Share Tech Mono',monospace;font-size:0.65rem;font-weight:700;color:{relColor};background:{relColor}15;padding:0.15rem 0.5rem;border-radius:0.25rem;border:1px solid {relColor}30;">{rel}</span>
												</td>
											{/each}
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>

					<!-- Note PvP relations -->
					<div style="padding:0.85rem 1rem;background:#7c3aed0a;border:1px solid #7c3aed20;border-radius:0.5rem;font-size:0.8rem;color:#64748b;line-height:1.55;">
						<strong style="color:#a78bfa;">Règles PvP</strong> — Ennemis : peuvent s'attaquer partout en zone orange/rouge. Neutres : uniquement en zone rouge. Alliés : ne peuvent jamais s'attaquer. Rejoins une guilde via <code style="color:#06b6d4;">/guilde</code>.
					</div>

				<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
				     GUILDES
				━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
				{:else if activeSection === 'guildes'}
					<p style="font-size:0.9rem;color:#94a3b8;line-height:1.7;margin-bottom:1.5rem;">
						Créez ou rejoignez une guilde, combattez en groupe et progressez ensemble. Deux types de guildes existent sur SHINSEI :
					</p>

					<!-- Types de guildes -->
					<div style="display:grid;grid-template-columns:1fr;gap:0.75rem;margin-bottom:2rem;" class="md:grid-cols-2">
						{#each guildTypes as gt, i}
							<div style="
								border-radius:0.75rem;overflow:hidden;
								border:1px solid #7c3aed30;
								background:linear-gradient(135deg,#0d0d15,#7c3aed08);
							" in:fly={{ x:-8, delay:i*80, duration:200 }}>
								<div style="height:2px;background:linear-gradient(90deg,#7c3aed,transparent);"></div>
								<div style="padding:1.25rem;">
									<div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.6rem;">
										<span style="font-size:1.4rem;">{gt.icon}</span>
										<h3 style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.05rem;color:#c4b5fd;">{gt.name}</h3>
									</div>
									<p style="font-size:0.82rem;color:#94a3b8;line-height:1.6;">{gt.description}</p>
								</div>
							</div>
						{/each}
					</div>

					<!-- Déblocage -->
					<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:2rem;" class="guildes-unlock-grid">
						{#each [
							{ label:'Rejoindre une guilde', req:'Grade Éveillé · sur invitation', color:'#3b82f6' },
							{ label:'Créer une guilde',     req:'Grade Éveillé + 1 000 éclats', color:'#f59e0b' },
						] as item}
							<div style="padding:0.875rem 1rem;background:#0d0d15;border:1px solid {item.color}30;border-radius:0.5rem;border-left:3px solid {item.color};">
								<div style="font-family:'Rajdhani',sans-serif;font-weight:900;color:white;font-size:0.9rem;margin-bottom:0.2rem;">{item.label}</div>
								<div style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;color:{item.color};">{item.req}</div>
							</div>
						{/each}
					</div>

					<!-- Hiérarchie -->
					<div style="margin-bottom:2rem;">
						<h3 style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.1rem;color:#7c3aed;margin-bottom:0.75rem;">HIÉRARCHIE</h3>
						<div style="display:flex;flex-direction:column;gap:0.4rem;">
							{#each guildRanks as gr, i}
								{@const colors = ['#f59e0b','#a855f7','#3b82f6','#6b7280']}
								<div style="display:grid;grid-template-columns:1.5rem 7rem 1fr;align-items:center;gap:0.75rem;padding:0.65rem 0.875rem;background:#0d0d15;border:1px solid #1e1530;border-radius:0.5rem;border-left:3px solid {colors[i]};"
									in:fly={{ x:-6, delay:i*40, duration:150 }}>
									<span style="font-family:'Share Tech Mono',monospace;font-size:0.7rem;font-weight:700;color:{colors[i]};">{gr.num}</span>
									<span style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:0.9rem;color:{colors[i]};">{gr.name}</span>
									<span style="font-size:0.78rem;color:#64748b;">{gr.rights}</span>
								</div>
							{/each}
						</div>
					</div>

					<!-- Niveaux & territoire -->
					<div style="margin-bottom:2rem;padding:1.25rem;background:#0d0d15;border:1px solid #1e1530;border-radius:0.75rem;">
						<h3 style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.1rem;color:#06b6d4;margin-bottom:0.35rem;">NIVEAUX & TERRITOIRE</h3>
						<p style="font-size:0.78rem;color:#64748b;line-height:1.5;margin-bottom:0.9rem;">La guilde gagne de l'XP en tuant des mobs à plusieurs (coéquipier à moins de 50 blocs) et monte du niveau 1 au niveau 7 — chaque palier augmente le nombre de membres et de chunks claimables.</p>
						<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:1rem;" class="guildes-chunks-grid">
							{#each guildChunkLimits as cl}
								<div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0.75rem;background:#06b6d408;border:1px solid #06b6d420;border-radius:0.375rem;">
									<span style="font-size:0.8rem;color:#94a3b8;">{cl.rank}</span>
									<span style="font-family:'Share Tech Mono',monospace;font-size:0.75rem;font-weight:700;color:#06b6d4;">{cl.chunks} chunks</span>
								</div>
							{/each}
						</div>
						<p style="font-size:0.78rem;color:#374151;line-height:1.5;">Sur le territoire d'une guilde (claims via <code style="color:#06b6d4;">/claim guilde</code>) : les membres construisent librement, les non-autorisés ne peuvent ni casser/poser de blocs ni ouvrir les coffres. L'accès se règle en Privé, Faction ou Public.</p>
					</div>

					<!-- Contrats -->
					<div style="margin-bottom:2rem;padding:1.25rem;background:linear-gradient(135deg,#0d0d15,#7c3aed08);border:1px solid #7c3aed25;border-radius:0.75rem;">
						<h3 style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.1rem;color:#a855f7;margin-bottom:0.75rem;">CONTRATS HEBDOMADAIRES</h3>
						<p style="font-size:0.85rem;color:#94a3b8;line-height:1.65;margin-bottom:0.75rem;">
							Chaque lundi, la guilde reçoit <strong style="color:white;">3 contrats collectifs</strong> à accomplir ensemble. Les remplir rapporte de l'XP de guilde. Consulte-les avec <code style="color:#06b6d4;">/guilde contrats</code>.
						</p>
						<div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
							{#each ['10 donjons de rang B → +2 000 XP', '3 boss régionaux → +3 000 XP', '500 000 XP collective en 7 j → +5 000 XP', '1 000 kills collectifs → +2 500 XP'] as point}
								<span style="font-size:0.72rem;color:#a855f7;background:#7c3aed15;padding:0.2rem 0.6rem;border-radius:0.25rem;border:1px solid #7c3aed30;">{point}</span>
							{/each}
						</div>
					</div>

					<!-- Changer de faction -->
					<div style="margin-bottom:2rem;padding:1rem 1.25rem;background:#fbbf2408;border:1px solid #fbbf2420;border-radius:0.625rem;display:flex;gap:0.75rem;">
						<span style="font-size:1.1rem;flex-shrink:0;">⚠️</span>
						<div>
							<p style="font-family:'Rajdhani',sans-serif;font-weight:800;color:#fbbf24;font-size:0.9rem;margin-bottom:0.2rem;">Changer de faction</p>
							<p style="font-size:0.8rem;color:#64748b;line-height:1.55;">Possible une fois tous les <strong style="color:white;">30 jours</strong>. Tu quittes automatiquement ta guilde, perds les avantages de l'ancienne faction, et dois attendre <strong style="color:white;">24h</strong> avant de rejoindre une nouvelle guilde. Ton rang gameplay et tes grades boutique sont conservés.</p>
						</div>
					</div>

					<!-- Commandes -->
					<div>
						<h3 style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.1rem;color:#7c3aed;margin-bottom:0.75rem;">COMMANDES EN JEU</h3>
						<div style="display:flex;flex-direction:column;gap:0.3rem;">
							{#each guildCommands as cmd, i}
								<div style="display:flex;align-items:baseline;gap:0.75rem;padding:0.45rem 0.75rem;border-radius:0.375rem;background:{i%2===0?'#0d0d15':'#0a0a0f'};border:1px solid #1e153040;"
									in:fly={{ x:-4, delay:i*25, duration:150 }}>
									<code style="font-family:'Share Tech Mono',monospace;font-size:0.7rem;font-weight:700;color:#06b6d4;white-space:nowrap;flex-shrink:0;">{cmd.cmd}</code>
									<span style="font-size:0.78rem;color:#64748b;">{cmd.desc}</span>
								</div>
							{/each}
						</div>
					</div>

				<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
				     DONJONS
				━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
				{:else if activeSection === 'donjons'}
					<p style="font-size:0.9rem;color:#94a3b8;line-height:1.7;margin-bottom:2rem;">
						Les donjons sont des instances privées. Quand tu entres dans un donjon, une copie de la map est créée rien que pour ton groupe. Chaque donjon a un boss avec des mécaniques uniques, un système de loot selon le rang, et un fragment de lore.
					</p>

					<div style="display:flex;flex-direction:column;gap:1.25rem;">
						{#each dungeons as d, i}
							{@const icon = rankLetterIconMap[d.rank]}
							{@const diff = difficultyFromRank(d.rank)}
							<div style="
								border-radius:0.875rem;overflow:hidden;
								border:1px solid {d.rankColor}30;
								background:#0d0d15;
							" in:fly={{ y:10, delay:i*60, duration:200 }}>
								<div style="height:2px;background:linear-gradient(90deg,{d.rankColor},{d.rankColor}30,transparent);"></div>
								<div style="padding:1.5rem;">
									<!-- Header donjon -->
									<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;margin-bottom:1rem;">
										<div style="display:flex;align-items:center;gap:0.75rem;">
											{#if icon}
												<img src={icon} alt="Rang {d.rank}" style="width:36px;height:36px;object-fit:contain;mix-blend-mode:screen;" />
											{/if}
											<div>
												<h3 style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.2rem;color:white;line-height:1;">{d.name}</h3>
												<p style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;color:{d.rankColor}90;margin-top:2px;">RANG {d.rank} · {d.duration}</p>
											</div>
										</div>
										<div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;">
											<div style="display:flex;gap:2px;">
												{#each {length: 3} as _, j}
													<div style="width:6px;height:20px;border-radius:2px;background:{j < diff ? d.rankColor : d.rankColor+'25'};"></div>
												{/each}
											</div>
											<span style="font-family:'Share Tech Mono',monospace;font-size:0.65rem;padding:0.2rem 0.55rem;border-radius:0.25rem;background:#06b6d415;color:#06b6d4;border:1px solid #06b6d430;">{d.players}</span>
										</div>
									</div>

									<!-- Boss -->
									<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
										<span style="font-family:'Share Tech Mono',monospace;font-size:0.58rem;font-weight:700;color:#374151;letter-spacing:0.1em;">BOSS</span>
										<span style="font-size:0.8rem;color:{d.rankColor};font-family:'Rajdhani',sans-serif;font-weight:800;">{d.boss}</span>
									</div>

									<p style="font-size:0.85rem;color:#94a3b8;line-height:1.65;margin-bottom:0.85rem;">{d.lore}</p>

									<!-- Récompenses -->
									<div style="display:flex;align-items:center;gap:0.5rem;padding:0.6rem 0.75rem;background:#fbbf2408;border:1px solid #fbbf2420;border-radius:0.375rem;">
										<span style="font-size:0.8rem;">🏆</span>
										<span style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;font-weight:700;color:#fbbf24;flex-shrink:0;">RÉCOMPENSES</span>
										<span style="font-size:0.78rem;color:#94a3b8;">{d.rewards}</span>
									</div>
								</div>
							</div>
						{/each}
					</div>

				<!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
				     PvP
				━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
				{:else if activeSection === 'commandes'}
					<p style="font-size:0.9rem;color:#94a3b8;line-height:1.7;margin-bottom:2rem;">
						Toutes les commandes à ta disposition, regroupées par thème.
					</p>
					<div style="display:flex;flex-direction:column;gap:1.25rem;">
						{#each commandCategories as cat, ci}
							<div style="border-radius:0.75rem;overflow:hidden;border:1px solid {cat.color}25;background:#0d0d15;" in:fly={{ y:8, delay:ci*50, duration:180 }}>
								<div style="height:2px;background:linear-gradient(90deg,{cat.color},{cat.color}20,transparent);"></div>
								<div style="padding:1.1rem 1.25rem;">
									<div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.9rem;">
										<span style="font-size:1.2rem;">{cat.icon}</span>
										<h3 style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.05rem;color:{cat.color};letter-spacing:0.02em;">{cat.label}</h3>
									</div>
									<div style="display:flex;flex-direction:column;gap:0.55rem;">
										{#each cat.commands as c}
											<div style="display:flex;flex-direction:column;gap:0.2rem;padding-bottom:0.55rem;border-bottom:1px solid #ffffff08;">
												<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
													<code style="font-family:'Share Tech Mono',monospace;font-size:0.78rem;color:{cat.color};background:{cat.color}12;border:1px solid {cat.color}22;padding:0.12rem 0.5rem;border-radius:0.3rem;">{c.cmd}</code>
													{#if c.staff}<span style="font-family:'Share Tech Mono',monospace;font-size:0.55rem;color:#ef4444;background:#ef444415;border:1px solid #ef444430;padding:0.05rem 0.35rem;border-radius:0.25rem;letter-spacing:0.1em;">STAFF</span>{/if}
												</div>
												<p style="font-size:0.8rem;color:#94a3b8;line-height:1.5;">{c.desc}</p>
											</div>
										{/each}
									</div>
								</div>
							</div>
						{/each}
					</div>

				<!-- COMPÉTENCES -->
				{:else if activeSection === 'competences'}
					<p style="font-size:0.9rem;color:#94a3b8;line-height:1.7;margin-bottom:1.5rem;">
						Chaque classe possède son propre <strong style="color:#c4b5fd;">arbre de compétences</strong>. On débloque les nœuds avec des <strong style="color:#f59e0b;">Shards (éclats)</strong> gagnés en jeu, via <code style="font-family:'Share Tech Mono',monospace;color:#a78bfa;">/skills buy &lt;id&gt;</code>. Les rangs supérieurs de l'arbre exigent un <strong style="color:#c4b5fd;">grade d'Éveillé</strong> plus élevé. Ouvre ton arbre avec <code style="font-family:'Share Tech Mono',monospace;color:#a78bfa;">/skills</code>.
					</p>

					<div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1.5rem;">
						{#each classMechanics as cm}
							{@const active = activeSkillClass === cm.id}
							<button onclick={() => activeSkillClass = cm.id} style="display:flex;align-items:center;gap:0.4rem;padding:0.45rem 1rem;border-radius:0.375rem;font-family:'Rajdhani',sans-serif;font-weight:800;font-size:0.875rem;background:{active ? cm.color+'22' : '#0d0d15'};color:{active ? cm.color : '#475569'};border:1px solid {active ? cm.color+'60' : '#1e1530'};cursor:pointer;transition:all 0.15s;box-shadow:{active ? `0 0 14px ${cm.color}25` : 'none'};">
								<span style="font-size:1rem;">{cm.icon}</span>{cm.name}
							</button>
						{/each}
					</div>

					{#key activeSkillClass}
						<div transition:fade={{ duration:120 }}>
							<div style="padding:1.1rem 1.25rem;border-radius:0.75rem;background:linear-gradient(135deg,#0d0d15,{currentSkillClass.color}10);border:1px solid {currentSkillClass.color}30;margin-bottom:1rem;">
								<div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.5rem;">
									<span style="font-size:1.6rem;">{currentSkillClass.icon}</span>
									<h3 style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.3rem;color:{currentSkillClass.color};">{currentSkillClass.name}</h3>
								</div>
								<p style="font-size:0.82rem;color:#cbd5e1;line-height:1.6;"><strong style="color:{currentSkillClass.color};">Passif de classe — </strong>{currentSkillClass.passive}</p>
							</div>

							<p style="font-family:'Share Tech Mono',monospace;font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:{currentSkillClass.color};margin-bottom:0.75rem;">Capacités actives</p>
							<div style="display:flex;flex-direction:column;gap:0.5rem;">
								{#each currentSkillClass.abilities as ab}
									<div style="display:flex;flex-direction:column;gap:0.2rem;padding:0.7rem 0.9rem;border-radius:0.5rem;background:#0d0d15;border:1px solid #1e1530;">
										<code style="font-family:'Share Tech Mono',monospace;font-size:0.76rem;color:{currentSkillClass.color};">{ab.cmd}</code>
										<p style="font-size:0.8rem;color:#94a3b8;line-height:1.5;">{ab.effect}</p>
									</div>
								{/each}
							</div>
						</div>
					{/key}

				<!-- STATS -->
				{:else if activeSection === 'stats'}
					<p style="font-size:0.9rem;color:#94a3b8;line-height:1.7;margin-bottom:2rem;">
						À chaque niveau tu gagnes des points à répartir dans 6 statistiques avec <code style="font-family:'Share Tech Mono',monospace;color:#a78bfa;">/stats add &lt;stat&gt;</code>. Elles façonnent ton style de jeu.
					</p>
					<div style="display:grid;grid-template-columns:1fr;gap:0.85rem;" class="md:grid-cols-2">
						{#each statInfos as s, i}
							<div style="border-radius:0.75rem;border:1px solid {s.color}25;background:#0d0d15;overflow:hidden;" in:fly={{ y:8, delay:i*50, duration:180 }}>
								<div style="height:2px;background:linear-gradient(90deg,{s.color},{s.color}20,transparent);"></div>
								<div style="padding:1.1rem 1.25rem;">
									<div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.2rem;">
										<div style="width:38px;height:38px;border-radius:0.4rem;background:{s.color}15;border:1px solid {s.color}30;display:flex;align-items:center;justify-content:center;font-size:1.15rem;flex-shrink:0;">{s.icon}</div>
										<div>
											<h3 style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.05rem;color:{s.color};line-height:1;">{s.name}</h3>
											<p style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;color:#475569;letter-spacing:0.08em;margin-top:2px;">{s.tagline}</p>
										</div>
									</div>
									<ul style="margin-top:0.7rem;display:flex;flex-direction:column;gap:0.35rem;list-style:none;padding:0;">
										{#each s.effects as e}
											<li style="display:flex;gap:0.5rem;font-size:0.8rem;color:#94a3b8;line-height:1.45;">
												<span style="color:{s.color};flex-shrink:0;">▸</span>{e}
											</li>
										{/each}
									</ul>
								</div>
							</div>
						{/each}
					</div>

				<!-- FAILLES -->
				{:else if activeSection === 'failles'}
					<p style="font-size:0.9rem;color:#94a3b8;line-height:1.7;margin-bottom:1.5rem;">
						Les <strong style="color:#c4b5fd;">failles dimensionnelles</strong> sont des événements PvE dynamiques : une arène s'ouvre dans le monde, déverse des vagues de Corrompus puis une Élite. Les fermer rapporte éclats, XP et butin. Suis-les en direct sur la <a href="/map" style="color:#a855f7;">carte</a>.
					</p>

					<div style="padding:1.25rem;border-radius:0.75rem;background:#0d0d15;border:1px solid #1e1530;margin-bottom:1.5rem;">
						<h2 style="font-family:'Rajdhani',sans-serif;font-size:1.2rem;font-weight:900;color:#a855f7;margin-bottom:1rem;">Fonctionnement</h2>
						<ul style="display:flex;flex-direction:column;gap:0.5rem;list-style:none;padding:0;">
							{#each failleRules as r}
								<li style="display:flex;gap:0.6rem;font-size:0.82rem;color:#94a3b8;line-height:1.5;">
									<span style="color:#a855f7;flex-shrink:0;">◆</span>{r}
								</li>
							{/each}
						</ul>
					</div>

					<p style="font-family:'Share Tech Mono',monospace;font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:#a855f7;margin-bottom:0.75rem;">Rangs de faille</p>
					<div style="overflow-x:auto;border-radius:0.75rem;border:1px solid #1e1530;">
						<table style="width:100%;border-collapse:collapse;min-width:460px;font-size:0.8rem;">
							<thead>
								<tr style="background:#0d0d15;">
									<th style="text-align:left;padding:0.7rem 0.9rem;font-family:'Share Tech Mono',monospace;font-size:0.62rem;letter-spacing:0.1em;color:#64748b;text-transform:uppercase;">Rang</th>
									<th style="text-align:left;padding:0.7rem 0.9rem;font-family:'Share Tech Mono',monospace;font-size:0.62rem;letter-spacing:0.1em;color:#64748b;text-transform:uppercase;">Niveau requis</th>
									<th style="text-align:left;padding:0.7rem 0.9rem;font-family:'Share Tech Mono',monospace;font-size:0.62rem;letter-spacing:0.1em;color:#64748b;text-transform:uppercase;">Mobs/vague</th>
									<th style="text-align:left;padding:0.7rem 0.9rem;font-family:'Share Tech Mono',monospace;font-size:0.62rem;letter-spacing:0.1em;color:#64748b;text-transform:uppercase;">Éclats</th>
									<th style="text-align:left;padding:0.7rem 0.9rem;font-family:'Share Tech Mono',monospace;font-size:0.62rem;letter-spacing:0.1em;color:#64748b;text-transform:uppercase;">XP</th>
								</tr>
							</thead>
							<tbody>
								{#each failleRanks as f}
									<tr style="border-top:1px solid #1e1530;">
										<td style="padding:0.65rem 0.9rem;">
											<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:0.35rem;background:{f.color}20;border:1px solid {f.color}50;color:{f.color};font-family:'Rajdhani',sans-serif;font-weight:900;">{f.rang}</span>
										</td>
										<td style="padding:0.65rem 0.9rem;color:#cbd5e1;">Nv {f.minLevel}+</td>
										<td style="padding:0.65rem 0.9rem;color:#94a3b8;">{f.mobs}</td>
										<td style="padding:0.65rem 0.9rem;color:#f59e0b;font-family:'Share Tech Mono',monospace;">{f.shards.toLocaleString('fr-FR')}</td>
										<td style="padding:0.65rem 0.9rem;color:#22c55e;font-family:'Share Tech Mono',monospace;">{f.xp.toLocaleString('fr-FR')}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<p style="font-size:0.72rem;color:#475569;margin-top:0.6rem;line-height:1.5;">Récompenses de base à la fermeture (×1 si nettoyée en moins de 30 min, dégressif ensuite). Le niveau maximum des mobs monte avec le rang, jusqu'à Nv 150 en rang S.</p>

				<!-- DIFFICULTÉ -->
				{:else if activeSection === 'difficulte'}
					<p style="font-size:0.9rem;color:#94a3b8;line-height:1.7;margin-bottom:2rem;">
						Choisis ta difficulté RPG avec <code style="font-family:'Share Tech Mono',monospace;color:#a78bfa;">/difficulte</code>. Elle détermine ce que tu perds à la mort. Le passage de Hardcore à Normal est réservé au staff — réfléchis bien.
					</p>
					<div style="display:grid;grid-template-columns:1fr;gap:0.85rem;" class="md:grid-cols-2">
						{#each difficultyModes as d, i}
							<div style="border-radius:0.75rem;border:1px solid {d.color}30;background:#0d0d15;overflow:hidden;" in:fly={{ y:8, delay:i*70, duration:180 }}>
								<div style="height:3px;background:{d.color};"></div>
								<div style="padding:1.25rem;">
									<div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.5rem;">
										<span style="font-size:1.3rem;">{d.icon}</span>
										<h3 style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.2rem;color:{d.color};">{d.name}</h3>
									</div>
									<p style="font-size:0.82rem;color:#94a3b8;line-height:1.6;margin-bottom:0.9rem;">{d.desc}</p>
									<div style="display:flex;flex-direction:column;gap:0.4rem;">
										{#each d.penalties as pen}
											<div style="display:flex;gap:0.5rem;font-size:0.8rem;color:#cbd5e1;line-height:1.4;">
												<span style="color:{d.color};flex-shrink:0;">•</span>{pen}
											</div>
										{/each}
									</div>
								</div>
							</div>
						{/each}
					</div>

				{:else if activeSection === 'pvp'}
					<p style="font-size:0.9rem;color:#94a3b8;line-height:1.7;margin-bottom:2rem;">
						Le PvP dans SHINSEI se joue autour de trois piliers concrets : la pénalité que tu risques en mourant (selon ta difficulté), les rivalités entre factions, et la protection de tes territoires par les claims.
					</p>

					<div style="display:grid;grid-template-columns:1fr;gap:0.85rem;" class="md:grid-cols-2">
						{#each pvpModes as mode, i}
							<div style="
								border-radius:0.75rem;overflow:hidden;
								border:1px solid {mode.color}25;
								background:#0d0d15;
								transition:border-color 0.2s,box-shadow 0.2s;
							" in:fly={{ y:8, delay:i*60, duration:180 }}
							onmouseenter={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor=mode.color+'50'; el.style.boxShadow=`0 8px 24px ${mode.color}12`; }}
							onmouseleave={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor=mode.color+'25'; el.style.boxShadow='none'; }}>
								<div style="height:2px;background:linear-gradient(90deg,{mode.color},{mode.color}20,transparent);"></div>
								<div style="padding:1.1rem;">
									<div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.6rem;">
										<div style="
											width:36px;height:36px;border-radius:0.375rem;
											background:{mode.color}15;border:1px solid {mode.color}30;
											display:flex;align-items:center;justify-content:center;
											font-size:1.1rem;flex-shrink:0;
										">{mode.icon}</div>
										<h3 style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:0.95rem;color:{mode.color};">{mode.title}</h3>
									</div>
									<p style="font-size:0.8rem;color:#94a3b8;line-height:1.6;">{mode.desc}</p>
								</div>
							</div>
						{/each}
					</div>

					<!-- Info PvP globale -->
					<div style="
						margin-top:1.5rem;padding:1.1rem 1.25rem;
						border-radius:0.625rem;
						background:#7c3aed0a;border:1px solid #7c3aed25;
						display:flex;gap:0.75rem;align-items:flex-start;
					">
						<span style="font-size:1.2rem;flex-shrink:0;">⚠️</span>
						<div>
							<p style="font-family:'Rajdhani',sans-serif;font-weight:800;color:#a78bfa;font-size:0.9rem;margin-bottom:0.2rem;">Note importante</p>
							<p style="font-size:0.8rem;color:#64748b;line-height:1.55;">Choisis ta difficulté avec <code style="color:#06b6d4;">/difficulte</code> : elle détermine tout ce que tu perds en mourant. Protège tes constructions et ton loot avec <code style="color:#06b6d4;">/claim</code>. Il n'existe pas (encore) d'arènes classées ni de guerres de faction programmées.</p>
						</div>
					</div>
				{/if}

				</div>
			</div>
		{/key}
	</div>
</div>

<style>
	/* Rank showcase: 7 cols on desktop → 4 cols on small screens */
	@media (max-width: 480px) {
		.rank-showcase-grid {
			grid-template-columns: repeat(4, 1fr) !important;
		}
	}

	/* Guildes: déblocage & chunks grids → 1 col on mobile */
	@media (max-width: 540px) {
		.guildes-unlock-grid,
		.guildes-chunks-grid {
			grid-template-columns: 1fr !important;
		}
	}

	/* Content padding: tighter on small screens */
	@media (max-width: 640px) {
		.wiki-content-pad {
			padding-left: 1rem !important;
			padding-right: 1rem !important;
		}
		.wiki-header-pad {
			padding-left: 1rem !important;
			padding-right: 1rem !important;
		}
	}
</style>
