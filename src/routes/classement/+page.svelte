<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import rankSS from '$lib/img/icon des rangs/SS.png';
	import rankS  from '$lib/img/icon des rangs/S.png';
	import rankA  from '$lib/img/icon des rangs/A.png';
	import rankB  from '$lib/img/icon des rangs/B.png';
	import rankC  from '$lib/img/icon des rangs/C.png';
	import rankD  from '$lib/img/icon des rangs/D.png';

	type Tab = 'ss' | 'pvp' | 'donjons' | 'faction';

	interface Player {
		rank: number; uuid: string; pseudo: string;
		classe: string; classeColor: string;
		rang: string; rangColor: string; rangIcon: string;
		stat: number; faction: string;
	}

	const rankIconMap: Record<string, string> = {
		'Abyssal SS': rankSS, 'Souverain': rankS,
		'Transcendant': rankA, 'Fléau': rankA,
		'Briseur': rankB, 'Éveillé': rankC, 'Dormant': rankD,
	};

	let activeTab = $state<Tab>('ss');

	const players: Record<Tab, Player[]> = {
		ss: [
			{ rank:1, uuid:'c06f8906', pseudo:'KuroShikami',     classe:'Shinigami', classeColor:'#fbbf24', rang:'Abyssal SS',   rangColor:'#f59e0b', rangIcon:rankSS, stat:0, faction:"L'Ordre" },
			{ rank:2, uuid:'853c3a29', pseudo:'AkaneVoidBreaker',classe:'Hunter',    classeColor:'#a78bfa', rang:'Abyssal SS',   rangColor:'#f59e0b', rangIcon:rankSS, stat:0, faction:'Les Fracturés' },
			{ rank:3, uuid:'ed1ed1ed', pseudo:'TitanHagane',     classe:'Titan',     classeColor:'#60a5fa', rang:'Abyssal SS',   rangColor:'#f59e0b', rangIcon:rankSS, stat:0, faction:'Les Nomades' },
			{ rank:4, uuid:'aaaabbcc', pseudo:'NovaTempest',     classe:'Arcane',    classeColor:'#f472b6', rang:'Souverain',    rangColor:'#a855f7', rangIcon:rankS,  stat:0, faction:"L'Ordre" },
			{ rank:5, uuid:'bbbbcccc', pseudo:'RyuBestia',       classe:'Bête',      classeColor:'#fb923c', rang:'Souverain',    rangColor:'#a855f7', rangIcon:rankS,  stat:0, faction:'Les Fracturés' },
		],
		pvp: [
			{ rank:1,  uuid:'c06f8906', pseudo:'KuroShikami',     classe:'Shinigami', classeColor:'#fbbf24', rang:'Abyssal SS',   rangColor:'#f59e0b', rangIcon:rankSS, stat:8421, faction:"L'Ordre" },
			{ rank:2,  uuid:'853c3a29', pseudo:'AkaneVoidBreaker',classe:'Hunter',    classeColor:'#a78bfa', rang:'Abyssal SS',   rangColor:'#f59e0b', rangIcon:rankSS, stat:7893, faction:'Les Fracturés' },
			{ rank:3,  uuid:'11aa22bb', pseudo:'ShadowKenjiro',   classe:'Hunter',    classeColor:'#a78bfa', rang:'Transcendant', rangColor:'#ef4444', rangIcon:rankA,  stat:6204, faction:'Les Nomades' },
			{ rank:4,  uuid:'cc33dd44', pseudo:'StormYukiko',     classe:'Arcane',    classeColor:'#f472b6', rang:'Souverain',    rangColor:'#a855f7', rangIcon:rankS,  stat:5817, faction:"L'Ordre" },
			{ rank:5,  uuid:'ee55ff66', pseudo:'IronMuramasa',    classe:'Titan',     classeColor:'#60a5fa', rang:'Souverain',    rangColor:'#a855f7', rangIcon:rankS,  stat:5203, faction:'Les Fracturés' },
			{ rank:6,  uuid:'aabb1122', pseudo:'BloodFenix',      classe:'Bête',      classeColor:'#fb923c', rang:'Transcendant', rangColor:'#ef4444', rangIcon:rankA,  stat:4891, faction:'Les Fracturés' },
			{ rank:7,  uuid:'ccdd3344', pseudo:'VoidMikage',      classe:'Shinigami', classeColor:'#fbbf24', rang:'Fléau',        rangColor:'#f59e0b', rangIcon:rankA,  stat:4332, faction:"L'Ordre" },
			{ rank:8,  uuid:'eeff5566', pseudo:'ZeroKagamine',    classe:'Arcane',    classeColor:'#f472b6', rang:'Transcendant', rangColor:'#ef4444', rangIcon:rankA,  stat:3987, faction:'Les Nomades' },
			{ rank:9,  uuid:'11223344', pseudo:'ThunderHibiki',   classe:'Titan',     classeColor:'#60a5fa', rang:'Briseur',      rangColor:'#3b82f6', rangIcon:rankB,  stat:3541, faction:"L'Ordre" },
			{ rank:10, uuid:'55667788', pseudo:'NightArashi',     classe:'Hunter',    classeColor:'#a78bfa', rang:'Fléau',        rangColor:'#f59e0b', rangIcon:rankA,  stat:3210, faction:'Les Nomades' },
		],
		donjons: [
			{ rank:1, uuid:'ed1ed1ed', pseudo:'TitanHagane',  classe:'Titan',  classeColor:'#60a5fa', rang:'Abyssal SS', rangColor:'#f59e0b', rangIcon:rankSS, stat:1247, faction:'Les Nomades' },
			{ rank:2, uuid:'aaaabbcc', pseudo:'NovaTempest',  classe:'Arcane', classeColor:'#f472b6', rang:'Souverain',  rangColor:'#a855f7', rangIcon:rankS,  stat:1103, faction:"L'Ordre" },
			{ rank:3, uuid:'c06f8906', pseudo:'KuroShikami',  classe:'Shinigami',classeColor:'#fbbf24',rang:'Abyssal SS',rangColor:'#f59e0b', rangIcon:rankSS, stat:987,  faction:"L'Ordre" },
			{ rank:4, uuid:'ff112233', pseudo:'CrystalSeiro', classe:'Arcane', classeColor:'#f472b6', rang:'Souverain',  rangColor:'#a855f7', rangIcon:rankS,  stat:854,  faction:"L'Ordre" },
			{ rank:5, uuid:'44556677', pseudo:'WildTakahashi',classe:'Bête',   classeColor:'#fb923c', rang:'Transcendant',rangColor:'#ef4444',rangIcon:rankA,  stat:801,  faction:'Les Nomades' },
		],
		faction: [
			{ rank:1, uuid:'bbbbcccc', pseudo:'RyuBestia',      classe:'Bête',      classeColor:'#fb923c', rang:'Souverain',  rangColor:'#a855f7', rangIcon:rankS,  stat:24701, faction:'Les Fracturés' },
			{ rank:2, uuid:'853c3a29', pseudo:'AkaneVoidBreaker',classe:'Hunter',   classeColor:'#a78bfa', rang:'Abyssal SS', rangColor:'#f59e0b', rangIcon:rankSS, stat:21340, faction:'Les Fracturés' },
			{ rank:3, uuid:'aaaabbcc', pseudo:'NovaTempest',    classe:'Arcane',    classeColor:'#f472b6', rang:'Souverain',  rangColor:'#a855f7', rangIcon:rankS,  stat:19870, faction:"L'Ordre" },
			{ rank:4, uuid:'c06f8906', pseudo:'KuroShikami',    classe:'Shinigami', classeColor:'#fbbf24', rang:'Abyssal SS', rangColor:'#f59e0b', rangIcon:rankSS, stat:18203, faction:"L'Ordre" },
			{ rank:5, uuid:'ed1ed1ed', pseudo:'TitanHagane',    classe:'Titan',     classeColor:'#60a5fa', rang:'Abyssal SS', rangColor:'#f59e0b', rangIcon:rankSS, stat:15442, faction:'Les Nomades' },
		],
	};

	const tabs: { id: Tab; label: string }[] = [
		{ id:'ss',      label:'Rang SS'    },
		{ id:'pvp',     label:'Kills PvP'  },
		{ id:'donjons', label:'Donjons'    },
		{ id:'faction', label:'Faction'    },
	];

	const podiumColors = ['#fbbf24','#94a3b8','#fb923c'];
	const podiumCrowns = ['👑','🥈','🥉'];

	let list = $derived(players[activeTab]);
	let top3 = $derived(list.slice(0, 3));
	let rest  = $derived(list.slice(3));
</script>

<svelte:head><title>Classement — SHINSEI 新世</title></svelte:head>

<div style="min-height:100vh;padding:5rem 1.5rem 4rem;background:#0a0a0f;">
	<div style="max-width:56rem;margin:0 auto;">

		<!-- Titre -->
		<div style="text-align:center;margin-bottom:3rem;">
			<p class="label-mono" style="color:#7c3aed;margin-bottom:0.4rem;">TOP JOUEURS</p>
			<h1 style="font-family:'Rajdhani',sans-serif;font-size:clamp(2.5rem,6vw,4rem);font-weight:900;color:white;text-shadow:0 0 30px #7c3aed25;">
				CLASSEMENT
			</h1>
		</div>

		<!-- Tabs -->
		<div style="display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap;margin-bottom:3rem;">
			{#each tabs as tab}
				<button
					onclick={() => activeTab = tab.id}
					style="
						font-family:'Rajdhani',sans-serif;font-size:0.875rem;font-weight:700;
						letter-spacing:0.08em;padding:0.5rem 1.5rem;border-radius:0.375rem;
						background:{activeTab===tab.id ? '#7c3aed' : '#0d0d15'};
						color:{activeTab===tab.id ? 'white' : '#64748b'};
						border:1px solid {activeTab===tab.id ? '#7c3aed' : '#1e1530'};
						box-shadow:{activeTab===tab.id ? '0 0 18px #7c3aed45' : 'none'};
						cursor:pointer;transition:all 0.2s;
					"
				>{tab.label}</button>
			{/each}
		</div>

		{#key activeTab}
			<div in:fade={{ duration: 180 }}>

				<!-- Podium top 3 -->
				<div style="display:flex;align-items:flex-end;justify-content:center;gap:1rem;margin-bottom:3.5rem;">
					{#each [top3[1], top3[0], top3[2]] as player, i}
						{@const realRank = [1, 0, 2][i]}
						{@const heights  = ['130px', '175px', '105px']}
						{#if player}
							<div style="display:flex;flex-direction:column;align-items:center;gap:0.6rem;"
								in:fly={{ y:25, delay:realRank*80, duration:350 }}>
								<span style="font-size:1.5rem;">{podiumCrowns[realRank]}</span>
								<!-- Avatar + badge rang -->
								<div style="position:relative;">
									<img src="https://mc-heads.net/avatar/{player.uuid}/48" alt={player.pseudo}
										style="width:52px;height:52px;border-radius:0.5rem;border:2px solid {podiumColors[realRank]};box-shadow:0 0 14px {podiumColors[realRank]}50;display:block;" />
									<img src={player.rangIcon} alt={player.rang}
										style="position:absolute;bottom:-5px;right:-5px;width:20px;height:20px;object-fit:contain;mix-blend-mode:screen;" />
								</div>
								<div style="text-align:center;">
									<div style="font-family:'Rajdhani',sans-serif;font-weight:900;font-size:0.85rem;color:{podiumColors[realRank]};">{player.pseudo}</div>
									<div style="font-size:0.7rem;color:{player.classeColor};">{player.classe}</div>
								</div>
								<!-- Colonne podium -->
								<div style="
									width:5.5rem;height:{heights[i]};
									border-radius:0.375rem 0.375rem 0 0;
									background:{podiumColors[realRank]}18;
									border:1px solid {podiumColors[realRank]}45;
									display:flex;align-items:center;justify-content:center;
									font-family:'Rajdhani',sans-serif;font-weight:900;font-size:1.5rem;
									color:{podiumColors[realRank]};
								">#{realRank+1}</div>
							</div>
						{/if}
					{/each}
				</div>

				<!-- Tableau reste -->
				{#if rest.length > 0}
					<div style="border:1px solid #1e1530;border-radius:0.75rem;overflow:hidden;">
						<!-- Header -->
						<div style="
							display:grid;grid-template-columns:2.5rem 1fr 10rem 8rem 6rem;
							padding:0.75rem 1.25rem;
							background:#0d0d15;
							border-bottom:1px solid #1e1530;
						">
							{#each ['#','Joueur','Rang','Faction','Score'] as h}
								<span style="font-family:'Share Tech Mono',monospace;font-size:0.6rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#374151;">{h}</span>
							{/each}
						</div>

						{#each rest as player, i}
							<div
								role="row"
								style="
									display:grid;grid-template-columns:2.5rem 1fr 10rem 8rem 6rem;
									align-items:center;padding:0.7rem 1.25rem;
									background:{i%2===0 ? '#0a0a0f' : '#0d0d15'};
									border-top:1px solid #1e153030;
									transition:background 0.15s;
								"
								onmouseenter={(e)=>(e.currentTarget as HTMLElement).style.background='#7c3aed0e'}
								onmouseleave={(e)=>(e.currentTarget as HTMLElement).style.background=i%2===0?'#0a0a0f':'#0d0d15'}
							>
								<span style="font-family:'Share Tech Mono',monospace;font-size:0.75rem;color:#374151;font-weight:700;">#{player.rank}</span>

								<div style="display:flex;align-items:center;gap:0.6rem;min-width:0;">
									<img src="https://mc-heads.net/avatar/{player.uuid}/32" alt={player.pseudo}
										style="width:32px;height:32px;border-radius:0.25rem;flex-shrink:0;" />
									<div style="min-width:0;">
										<div style="font-family:'Rajdhani',sans-serif;font-weight:800;color:white;font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{player.pseudo}</div>
										<div style="font-size:0.7rem;color:{player.classeColor};">{player.classe}</div>
									</div>
								</div>

								<div style="display:flex;align-items:center;gap:0.4rem;">
									<img src={player.rangIcon} alt={player.rang} style="width:20px;height:20px;object-fit:contain;mix-blend-mode:screen;flex-shrink:0;" />
									<span style="font-size:0.75rem;font-weight:600;color:{player.rangColor};white-space:nowrap;">{player.rang}</span>
								</div>

								<span style="font-size:0.75rem;color:#475569;white-space:nowrap;">{player.faction}</span>

								<span style="font-family:'Share Tech Mono',monospace;font-size:0.75rem;font-weight:700;color:#06b6d4;text-align:right;">
									{player.stat > 0 ? player.stat.toLocaleString('fr-FR') : '—'}
								</span>
							</div>
						{/each}
					</div>
				{/if}

			</div>
		{/key}
	</div>
</div>
