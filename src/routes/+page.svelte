<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import ClassCard    from '$lib/components/ClassCard.svelte';
	import ServerStats  from '$lib/components/ServerStats.svelte';
	import WorldMap     from '$lib/components/WorldMap.svelte';
	import { classes }              from '$lib/data/classes';
	import { factions, timeline }  from '$lib/data/lore';
	import { reveal }              from '$lib/actions/reveal';

	import bgImg       from '$lib/img/background/bg.png';
	import iconClassImg from '$lib/img/icon class/iconclass.png';
	import ingameImg   from '$lib/img/background/bg2.png';
	import logoImg     from '$lib/img/logo/logo.png';

	import type { OnlinePlayer } from './api/stats/+server';

	const GRADE_CONFIG: Record<string, { label: string; color: string }> = {
		eveille:      { label: 'Éveillé',      color: '#22c55e' },
		briseur:      { label: 'Briseur',      color: '#3b82f6' },
		fleau:        { label: 'Fléau',         color: '#f59e0b' },
		transcendant: { label: 'Transcendant', color: '#a855f7' },
		souverain:    { label: 'Souverain',    color: '#f59e0b' },
		abyssal:      { label: 'Abyssal',      color: '#ef4444' },
	};

	let heroVisible = $state(false);
	let statValues  = $state([0, 0, 0, 0]);
	let statTargets = [0, 0, 0, 0];
	let onlinePlayers = $state<OnlinePlayer[]>([]);
	const statLabels  = ['Joueurs connectés', 'Éveillés actifs', 'Donjons complétés', 'Failles fermées'];

	async function fetchStats() {
		try {
			const res = await fetch('/api/stats');
			if (res.ok) {
				const data = await res.json();
				statTargets  = [data.online ?? 0, data.eveilles ?? 0, data.donjons ?? 0, data.failles ?? 0];
				onlinePlayers = data.players ?? [];
				animateStats();
			}
		} catch {}
	}

	onMount(() => {
		heroVisible = true;
		fetchStats();
		const interval = setInterval(fetchStats, 30000);
		return () => clearInterval(interval);
	});

	function animateStats() {
		const from = [...statValues];
		const to = [...statTargets];
		const start = Date.now();
		const tick = () => {
			const p = Math.min((Date.now() - start) / 1500, 1);
			const e = 1 - Math.pow(1 - p, 3);
			statValues = to.map((t, i) => Math.round(from[i] + (t - from[i]) * e));
			if (p < 1) requestAnimationFrame(tick);
		};
		requestAnimationFrame(tick);
	}

	const fmtStat = (n: number) => n.toLocaleString('fr-FR');
</script>

<svelte:head>
	<title>SHINSEI 新世 — Serveur Minecraft RPG Français</title>
	<meta name="description" content="SHINSEI est un serveur Minecraft RPG post-apocalyptique français. Rejoignez des factions, éveillez vos pouvoirs et fermez les failles dimensionnelles." />
	<link rel="canonical" href="https://shinsei.fr" />
	<meta property="og:title" content="SHINSEI 新世 — Serveur Minecraft RPG Français" />
	<meta property="og:url" content="https://shinsei.fr" />
	<script type="application/ld+json">{JSON.stringify({
		"@context": "https://schema.org",
		"@type": "VideoGame",
		"name": "SHINSEI 新世",
		"description": "Serveur Minecraft RPG post-apocalyptique français. Éveillez vos pouvoirs, choisissez votre faction, fermez les failles dimensionnelles.",
		"url": "https://shinsei.fr",
		"genre": "RPG",
		"gamePlatform": "Minecraft Java Edition",
		"applicationCategory": "Game",
		"inLanguage": "fr",
		"publisher": {
			"@type": "Organization",
			"name": "SHINSEI",
			"url": "https://shinsei.fr"
		}
	})}</script>
</svelte:head>

<!-- ══════════════════════════════════════════════════════════
     HERO
══════════════════════════════════════════════════════════ -->
<section style="
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 100vh;
	overflow: hidden;
	text-align: center;
	padding: 0 1.5rem;
	background: #0a0a0f;
">
	<!-- Background image -->
	<div style="position: absolute; inset: 0; z-index: 0;">
		<img src={bgImg} alt="" style="width:100%; height:100%; object-fit:cover; object-position:center;" />
		<div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(10,10,15,0.6) 0%,rgba(10,10,15,0.45) 40%,rgba(10,10,15,0.85) 75%,#0a0a0f 100%);"></div>
	</div>

	<!-- Rift SVG animé -->
	<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:1;">
		<svg width="560" height="560" viewBox="0 0 600 600" style="opacity:0.25;">
			<ellipse cx="300" cy="300" rx="220" ry="280" fill="none" stroke="#7c3aed" stroke-width="1.2" opacity="0.6">
				<animateTransform attributeName="transform" type="rotate" from="0 300 300" to="360 300 300" dur="22s" repeatCount="indefinite"/>
			</ellipse>
			<ellipse cx="300" cy="300" rx="155" ry="205" fill="none" stroke="#06b6d4" stroke-width="0.8" opacity="0.45">
				<animateTransform attributeName="transform" type="rotate" from="360 300 300" to="0 300 300" dur="16s" repeatCount="indefinite"/>
			</ellipse>
			<ellipse cx="300" cy="300" rx="90" ry="130" fill="#7c3aed22">
				<animate attributeName="rx" values="90;105;90" dur="4s" repeatCount="indefinite"/>
				<animate attributeName="ry" values="130;150;130" dur="4s" repeatCount="indefinite"/>
			</ellipse>
		</svg>
	</div>

	<!-- Contenu hero -->
	<div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:1.25rem;">
		{#if heroVisible}
			<div in:fly={{ y: -20, duration: 700, delay: 100 }}>
				<ServerStats />
			</div>

			<div in:fly={{ y: 30, duration: 800, delay: 200 }}>
				<img
					src={logoImg}
					alt="SHINSEI 新世"
					style="width: clamp(180px, 22vw, 280px); filter: drop-shadow(0 0 35px #7c3aed90) drop-shadow(0 0 70px #7c3aed40);"
				/>
			</div>

			<p in:fly={{ y: 15, duration: 600, delay: 380 }}
				class="glitch animate-flicker"
				data-text="LA FAILLE DIMENSIONNELLE S'EST ROUVERTE"
				style="
					font-family:'Share Tech Mono',monospace;
					font-size: clamp(0.65rem, 1.5vw, 0.85rem);
					letter-spacing: 0.3em;
					text-transform: uppercase;
					color: #94a3b8;
				">
				LA FAILLE DIMENSIONNELLE S'EST ROUVERTE
			</p>

			<p in:fade={{ duration: 600, delay: 550 }} style="color:#94a3b8; max-width:36rem; font-size:1rem; line-height:1.65;">
				Un RPG Minecraft massivement multijoueur. 5 classes, 7 rangs, 3 factions. Un seul peut atteindre le rang Abyssal SS par classe.
			</p>

			<div in:fly={{ y: 15, duration: 500, delay: 680 }} style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;">
				<a href="/telecharger" style="
					font-family:'Rajdhani',sans-serif; font-weight:900; font-size:0.9rem;
					letter-spacing:0.12em; padding:0.8rem 2rem;
					background:#7c3aed; color:white;
					border:1px solid #9f67ff; border-radius:0.375rem;
					box-shadow:0 0 22px #7c3aed60;
					transition:box-shadow 0.25s, background 0.25s;
				"
					onmouseenter={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.boxShadow='0 0 40px #7c3aed90'; el.style.background='#6d28d9'; }}
					onmouseleave={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.boxShadow='0 0 22px #7c3aed60'; el.style.background='#7c3aed'; }}>
					TÉLÉCHARGER LE LAUNCHER
				</a>
				<a href="#classes" style="
					font-family:'Rajdhani',sans-serif; font-weight:900; font-size:0.9rem;
					letter-spacing:0.12em; padding:0.8rem 2rem;
					color:#7c3aed; border:1px solid #7c3aed60; border-radius:0.375rem;
					background:transparent; transition:background 0.25s;
				"
					onmouseenter={(e)=>((e.currentTarget as HTMLElement).style.background='#7c3aed15')}
					onmouseleave={(e)=>((e.currentTarget as HTMLElement).style.background='transparent')}>
					DÉCOUVRIR L'UNIVERS
				</a>
			</div>
		{/if}
	</div>

	<!-- Chevron -->
	<div style="position:absolute;bottom:2rem;left:50%;transform:translateX(-50%);opacity:0.4;animation:float 3s ease-in-out infinite;">
		<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.5">
			<path d="M6 9l6 6 6-6"/>
		</svg>
	</div>
</section>

<!-- ══════════════════════════════════════════════════════════
     STATS BAND
══════════════════════════════════════════════════════════ -->
<section id="stats-section" use:reveal={{ y: 20, duration: 700 }} style="
	background: linear-gradient(90deg,#0d0d15,#0f0920,#0d0d15);
	border-top:1px solid #1e1530; border-bottom:1px solid #1e1530;
	padding:4rem 1.5rem;
">
	<div style="max-width:64rem;margin:0 auto;display:grid;grid-template-columns:repeat(1,1fr);gap:2rem;text-align:center;" class="sm:grid-cols-2 md:grid-cols-4">
		{#each statValues as val, i}
			{@const colors = ['#7c3aed','#06b6d4','#a78bfa','#f472b6']}
			<div style="display:flex;flex-direction:column;gap:0.5rem;">
				<span style="font-family:'Rajdhani',sans-serif;font-size:2.8rem;font-weight:900;color:{colors[i]};text-shadow:0 0 18px {colors[i]}55;">
					{fmtStat(val)}
				</span>
				<span style="font-family:'Share Tech Mono',monospace;font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;color:#64748b;">
					{statLabels[i]}
				</span>
			</div>
		{/each}
	</div>
</section>

<!-- ══════════════════════════════════════════════════════════
     JOUEURS EN LIGNE
══════════════════════════════════════════════════════════ -->
{#if onlinePlayers.length > 0}
<section use:reveal={{ y: 20, duration: 700 }} style="padding:3.5rem 1.5rem;background:#0a0a0f;border-top:1px solid #1e1530;">
	<div style="max-width:72rem;margin:0 auto;">
		<div style="display:flex;align-items:center;gap:1rem;margin-bottom:2rem;">
			<div style="width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;animation:pulse 2s infinite;flex-shrink:0;"></div>
			<p class="label-mono" style="color:#64748b;font-size:0.7rem;">JOUEURS CONNECTÉS</p>
			<span style="font-family:'Share Tech Mono',monospace;font-size:0.7rem;color:#22c55e;margin-left:auto;">{onlinePlayers.length} EN LIGNE</span>
		</div>

		<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:0.875rem;">
			{#each onlinePlayers as player}
				{@const grade = GRADE_CONFIG[player.grade?.toLowerCase()] ?? GRADE_CONFIG['eveille']}
				<div style="
					display:flex;flex-direction:column;align-items:center;gap:0.625rem;
					padding:1rem 0.75rem;
					background:#0d0d15;border:1px solid #1e1530;border-radius:0.75rem;
					transition:border-color 0.2s,box-shadow 0.2s;
				"
					onmouseenter={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor=grade.color+'60'; el.style.boxShadow=`0 0 16px ${grade.color}20`; }}
					onmouseleave={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor='#1e1530'; el.style.boxShadow='none'; }}
				>
					<!-- Avatar Minecraft -->
					<div style="position:relative;">
						<img
							src="https://mc-heads.net/avatar/{player.username}/52"
							alt={player.username}
							width="52" height="52"
							style="border-radius:0.375rem;image-rendering:pixelated;"
							onerror={(e)=>{ const img = e.currentTarget as HTMLImageElement; if (!img.dataset.tried) { img.dataset.tried='1'; img.src=`https://crafatar.com/avatars/${player.uuid}?size=52&overlay`; } }}
						/>
						<div style="position:absolute;bottom:-3px;right:-3px;width:10px;height:10px;border-radius:50%;background:#22c55e;border:2px solid #0d0d15;box-shadow:0 0 6px #22c55e;"></div>
					</div>

					<!-- Nom -->
					<span style="font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.9rem;color:white;text-align:center;word-break:break-all;">{player.username}</span>

					<!-- Grade -->
					<span style="
						font-family:'Share Tech Mono',monospace;font-size:0.6rem;letter-spacing:0.1em;
						padding:0.2rem 0.5rem;border-radius:0.25rem;
						background:{grade.color}18;color:{grade.color};border:1px solid {grade.color}40;
					">{grade.label.toUpperCase()}</span>
				</div>
			{/each}
		</div>
	</div>
</section>
{/if}

<!-- ══════════════════════════════════════════════════════════
     CLASSES
══════════════════════════════════════════════════════════ -->
<section id="classes" use:reveal={{ y: 30, duration: 800 }} style="padding:6rem 1.5rem;background:#0a0a0f;">
	<div style="max-width:72rem;margin:0 auto;">
		<div style="display:grid;grid-template-columns:1fr;gap:3rem;align-items:center;margin-bottom:3.5rem;" class="lg:grid-cols-2">
			<div>
				<p class="label-mono" style="color:#7c3aed;margin-bottom:0.5rem;">5 CLASSES UNIQUES</p>
				<h2 style="font-family:'Rajdhani',sans-serif;font-size:clamp(2rem,4vw,3rem);font-weight:900;color:white;margin-bottom:1rem;text-shadow:0 0 25px #7c3aed25;">
					CHOISISSEZ VOTRE CLASSE
				</h2>
				<p style="color:#94a3b8;line-height:1.65;margin-bottom:1.25rem;">
					Chaque classe définit votre style de combat, vos compétences uniques et votre rôle dans les failles. Du furtif Hunter au colossal Titan, une voie s'impose à vous.
				</p>
				<a href="/wiki" style="font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.875rem;color:#7c3aed;">
					VOIR TOUTES LES COMPÉTENCES →
				</a>
			</div>
			<div style="display:flex;justify-content:center;">
				<img src={iconClassImg} alt="Les 5 classes SHINSEI" style="max-width:360px;width:100%;filter:drop-shadow(0 0 28px #7c3aed35);" />
			</div>
		</div>

		<div style="display:grid;grid-template-columns:repeat(1,1fr);gap:1rem;" class="md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
			{#each classes as cls}
				<ClassCard name={cls.name} color={cls.color} description={cls.description} icon={cls.icon} tagline={cls.tagline} />
			{/each}
		</div>
	</div>
</section>

<!-- ══════════════════════════════════════════════════════════
     LORE + SCREENSHOT
══════════════════════════════════════════════════════════ -->
<section use:reveal={{ y: 30, duration: 800, delay: 50 }} style="padding:6rem 1.5rem;background:#0d0d15;border-top:1px solid #1e1530;">
	<div style="max-width:72rem;margin:0 auto;display:grid;grid-template-columns:1fr;gap:4rem;align-items:center;" class="lg:grid-cols-2">
		<div>
			<p class="label-mono" style="color:#7c3aed;margin-bottom:0.5rem;">LORE</p>
			<h2 style="font-family:'Rajdhani',sans-serif;font-size:clamp(1.8rem,3.5vw,2.5rem);font-weight:900;color:white;margin-bottom:1.25rem;line-height:1.1;">
				LE MONDE S'EST<br/><span style="color:#7c3aed;">BRISÉ EN 2031</span>
			</h2>
			<p style="color:#94a3b8;line-height:1.65;margin-bottom:0.85rem;">
				En 2031, Tokyo fut le théâtre d'un événement qui allait redéfinir l'humanité. Une faille dimensionnelle de 300 mètres s'ouvrit au-dessus de Shinjuku. Les Corrompus envahirent. L'armée fut impuissante.
			</p>
			<p style="color:#94a3b8;line-height:1.65;margin-bottom:1.5rem;">
				Douze civils développèrent spontanément des pouvoirs surhumains. Les Douze Premiers repoussèrent l'invasion. Depuis, les failles se multiplient — et les Éveillés avec elles.
			</p>

			<!-- Timeline courte -->
			<div style="padding-left:1rem;border-left:2px solid #7c3aed30;display:flex;flex-direction:column;gap:1rem;margin-bottom:1.5rem;">
				{#each timeline.slice(0,3) as event}
					<div>
						<span class="label-mono" style="color:#06b6d4;">{event.year}</span>
						<p style="font-family:'Rajdhani',sans-serif;font-weight:800;color:white;font-size:0.95rem;margin:0.15rem 0;">{event.title}</p>
						<p style="color:#64748b;font-size:0.8rem;line-height:1.5;">{event.description.substring(0,100)}…</p>
					</div>
				{/each}
			</div>

			<a href="/wiki" style="font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.875rem;color:#7c3aed;">
				LIRE LE LORE COMPLET →
			</a>
		</div>

		<!-- Screenshot ingame -->
		<div style="border-radius:1rem;overflow:hidden;border:1px solid #7c3aed20;box-shadow:0 0 50px #7c3aed20;position:relative;">
			<img src={ingameImg} alt="SHINSEI en jeu" style="width:100%;display:block;" />
			<div style="position:absolute;bottom:0;left:0;right:0;padding:1rem;background:linear-gradient(to top,#0a0a0f,transparent);">
				<p class="label-mono" style="color:#7c3aed70;">MONDE SHINSEI 新世 — EN JEU</p>
			</div>
		</div>
	</div>
</section>

<!-- ══════════════════════════════════════════════════════════
     FACTIONS
══════════════════════════════════════════════════════════ -->
<section use:reveal={{ y: 30, duration: 800 }} style="padding:6rem 1.5rem;background:#0a0a0f;">
	<div style="max-width:72rem;margin:0 auto;">
		<div style="text-align:center;margin-bottom:3.5rem;">
			<h2 style="font-family:'Rajdhani',sans-serif;font-size:clamp(2rem,4vw,3rem);font-weight:900;color:white;margin-bottom:0.75rem;">
				CHOISISSEZ VOTRE FACTION
			</h2>
			<p class="label-mono" style="color:#64748b;">Votre faction définit vos alliés, vos ennemis, et votre vision du monde</p>
		</div>

		<div style="display:grid;grid-template-columns:repeat(1,1fr);gap:1.25rem;" class="md:grid-cols-3">
			{#each factions as faction}
				<div
					role="article"
					style="
						background:#0d0d15;
						border:1px solid {faction.colors.primary}30;
						border-radius:0.75rem;
						padding:1.5rem;
						display:flex;flex-direction:column;gap:0.75rem;
						transition:border-color 0.25s,box-shadow 0.25s;
					"
					onmouseenter={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor=faction.colors.primary+'80'; el.style.boxShadow=`0 15px 40px ${faction.colors.primary}15`; }}
					onmouseleave={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor=faction.colors.primary+'30'; el.style.boxShadow='none'; }}
				>
					<span style="font-size:2.2rem;">{faction.symbol}</span>
					<div>
						<h3 style="font-family:'Rajdhani',sans-serif;font-size:1.4rem;font-weight:900;color:{faction.colors.primary};margin-bottom:0.15rem;">{faction.name}</h3>
						<p class="label-mono" style="color:{faction.colors.secondary};">{faction.philosophy}</p>
					</div>
					<p style="font-size:0.85rem;color:#94a3b8;line-height:1.55;flex:1;">
						{faction.description.substring(0,150)}…
					</p>
					<a href="/wiki" style="font-family:'Rajdhani',sans-serif;font-weight:700;font-size:0.75rem;color:{faction.colors.primary};">
						EN SAVOIR PLUS →
					</a>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ══════════════════════════════════════════════════════════
     CARTE DES FAILLES
══════════════════════════════════════════════════════════ -->
<section use:reveal={{ y: 30, duration: 800 }} style="padding:6rem 1.5rem;background:#0d0d15;border-top:1px solid #1e1530;">
	<div style="max-width:72rem;margin:0 auto;">
		<div style="text-align:center;margin-bottom:2.5rem;">
			<p class="label-mono" style="color:#06b6d4;margin-bottom:0.5rem;">EN TEMPS RÉEL</p>
			<h2 style="font-family:'Rajdhani',sans-serif;font-size:clamp(2rem,4vw,3rem);font-weight:900;color:white;margin-bottom:0.5rem;">
				CARTE DES FAILLES
			</h2>
			<p class="label-mono" style="color:#64748b;">Surveillez l'activité des failles dimensionnelles à travers le monde</p>
		</div>

		<div style="height:480px;border-radius:0.75rem;overflow:hidden;border:1px solid #1e1530;box-shadow:0 0 35px #7c3aed15;margin-bottom:1.5rem;">
			<WorldMap interactive={false} />
		</div>

		<div style="text-align:center;">
			<a href="/map" style="
				font-family:'Rajdhani',sans-serif;font-weight:900;font-size:0.85rem;
				letter-spacing:0.1em;padding:0.75rem 2rem;
				color:#06b6d4;border:1px solid #06b6d450;border-radius:0.375rem;
				background:transparent;transition:background 0.25s,box-shadow 0.25s;
				display:inline-block;
			"
				onmouseenter={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.background='#06b6d412'; el.style.boxShadow='0 0 18px #06b6d430'; }}
				onmouseleave={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.background='transparent'; el.style.boxShadow='none'; }}>
				VOIR LA CARTE COMPLÈTE →
			</a>
		</div>
	</div>
</section>

<!-- ══════════════════════════════════════════════════════════
     STAFF
══════════════════════════════════════════════════════════ -->
<section use:reveal={{ y: 30, duration: 800 }} style="padding:6rem 1.5rem;background:#0a0a0f;border-top:1px solid #1e1530;">
	<div style="max-width:72rem;margin:0 auto;">
		<div style="text-align:center;margin-bottom:3rem;">
			<p style="font-family:'Share Tech Mono',monospace;font-size:0.75rem;color:#7c3aed;letter-spacing:0.2em;margin-bottom:0.4rem;">ÉQUIPE FONDATRICE</p>
			<h2 style="font-family:'Rajdhani',sans-serif;font-size:clamp(2rem,4vw,3rem);font-weight:900;color:white;margin:0;">
				LES BÂTISSEURS DE SHINSEI
			</h2>
		</div>

		<div style="display:grid;grid-template-columns:repeat(1,1fr);gap:1.5rem;max-width:1000px;margin:0 auto;" class="sm:grid-cols-2 lg:grid-cols-3">
			{#each [
				{ username: 'NoPleyZz',  role: 'Fondateur · Développeur principal',   color: '#f59e0b', badge: 'FOUNDER',    desc: "Créateur de SHINSEI et développeur principal. Conception du site, du launcher, du serveur et des mods — l'architecte technique derrière tout l'univers." },
				{ username: 'Avinc',     role: 'Co-fondateur · Marketing',           color: '#7c3aed', badge: 'CO-FOUNDER', desc: "Co-créateur du serveur et responsable marketing. Gestion de la communauté, réseaux sociaux et communication officielle de SHINSEI." },
				{ username: 'Azordix_',  role: 'Dev Gameplay · Responsable Admin',   color: '#06b6d4', badge: 'DEV · ADMIN', desc: "Développeur gameplay en soutien et responsable administrateur. Gestion des bots Discord et organisation interne du serveur." },
			] as member}
				<div style="
					background:#0f0f1a;border:1px solid {member.color}30;border-radius:1rem;
					padding:2rem;display:flex;flex-direction:column;align-items:center;gap:1.25rem;
					text-align:center;transition:border-color 0.25s,box-shadow 0.25s;
				"
					onmouseenter={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor=member.color+'70'; el.style.boxShadow=`0 0 30px ${member.color}18`; }}
					onmouseleave={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.borderColor=member.color+'30'; el.style.boxShadow='none'; }}
				>
					<!-- Tête de skin -->
					<div style="position:relative;">
						<div style="
							width:96px;height:96px;border-radius:1rem;overflow:hidden;
							border:3px solid {member.color}60;
							box-shadow:0 0 24px {member.color}35;
							background:#06060f;
						">
							<img
								src="https://mc-heads.net/avatar/{member.username}/96"
								alt={member.username}
								style="width:100%;height:100%;image-rendering:pixelated;"
								onerror={(e)=>{ const img=e.currentTarget as HTMLImageElement; if(!img.dataset.tried){img.dataset.tried='1';img.src=`https://crafatar.com/avatars/${member.username}?size=96&overlay`;} }}
							/>
						</div>
						<!-- Badge rôle -->
						<div style="
							position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);
							font-family:'Share Tech Mono',monospace;font-size:0.55rem;font-weight:700;
							padding:0.2rem 0.6rem;border-radius:9999px;white-space:nowrap;
							background:{member.color};color:#000;letter-spacing:0.08em;
						">{member.badge}</div>
					</div>

					<div style="padding-top:0.5rem;">
						<p style="font-family:'Rajdhani',sans-serif;font-size:1.4rem;font-weight:900;color:white;margin:0 0 0.2rem;">{member.username}</p>
						<p style="font-family:'Share Tech Mono',monospace;font-size:0.7rem;color:{member.color};letter-spacing:0.1em;margin:0 0 0.85rem;">{member.role.toUpperCase()}</p>
						<p style="font-size:0.85rem;color:#64748b;line-height:1.6;">{member.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ══════════════════════════════════════════════════════════
     CTA FINAL
══════════════════════════════════════════════════════════ -->
<section style="padding:8rem 1.5rem;text-align:center;position:relative;overflow:hidden;background:#0a0a0f;">
	<div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,#7c3aed12,transparent 65%);pointer-events:none;"></div>
	<div style="position:relative;z-index:1;max-width:36rem;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:1.25rem;">
		<p class="label-mono" style="color:#06b6d4;margin-bottom:-0.5rem;">LA FAILLE T'ATTEND</p>
		<h2 style="font-family:'Rajdhani',sans-serif;font-size:clamp(2.5rem,6vw,4rem);font-weight:900;color:white;text-shadow:0 0 35px #7c3aed35;">
			REJOINS L'ÉVEIL
		</h2>
		<p style="color:#94a3b8;font-size:1.05rem;line-height:1.6;">
			Des milliers d'Éveillés t'affrontent déjà.<br/>Choisis ta classe. Rejoins une faction. Atteins le rang Abyssal SS.
		</p>
		<a href="/telecharger" style="
			font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1rem;
			letter-spacing:0.12em;padding:1rem 2.5rem;
			background:#7c3aed;color:white;
			border:1px solid #9f67ff;border-radius:0.375rem;
			box-shadow:0 0 28px #7c3aed70;
			transition:box-shadow 0.25s,background 0.25s;
		"
			onmouseenter={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.boxShadow='0 0 50px #7c3aed,0 0 90px #7c3aed40'; el.style.background='#6d28d9'; }}
			onmouseleave={(e)=>{ const el=e.currentTarget as HTMLElement; el.style.boxShadow='0 0 28px #7c3aed70'; el.style.background='#7c3aed'; }}>
			REJOINDRE L'ÉVEIL
		</a>
		<p class="label-mono" style="color:#374151;">Minecraft 1.20.1 Forge · Java 17+ · Windows 10/11</p>
	</div>
</section>
