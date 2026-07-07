<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import { gameRanks } from '$lib/data/grades';
	import { classes } from '$lib/data/classes';

	let { data }: { data: PageData } = $props();

	let me = $derived(page.data.user?.username ?? null);

	type Tab = 'xp' | 'pvp' | 'donjons' | 'failles' | 'votes';
	let activeTab = $state<Tab>('xp');

	const tabs: { id: Tab; label: string; icon: string; unit: string }[] = [
		{ id: 'xp',      label: 'XP Total', icon: '⚡', unit: 'XP'      },
		{ id: 'pvp',     label: 'PvP',      icon: '⚔️', unit: 'kills'   },
		{ id: 'donjons', label: 'Donjons',  icon: '🏯', unit: 'donjons' },
		{ id: 'failles', label: 'Failles',  icon: '🌀', unit: 'failles' },
		{ id: 'votes',   label: 'Votes',    icon: '🗳️', unit: 'votes'   },
	];

	const gradeColor = (id: string) =>
		gameRanks.find(g => g.id === id)?.color ?? '#6b7280';

	const classColor = (id: string | null) =>
		id ? (classes.find(c => c.id === id)?.color ?? '#94a3b8') : '#94a3b8';

	function onHeadError(e: Event, uuid: string) {
		const img = e.currentTarget as HTMLImageElement;
		if (!img.dataset.tried) {
			img.dataset.tried = '1';
			img.src = `https://crafatar.com/avatars/${uuid}?size=40&overlay`;
		}
	}

	let entries = $derived(activeTab !== 'votes' && data.leaderboard ? data.leaderboard[activeTab as Exclude<Tab, 'votes'>] : []);
	let voteEntries = $derived(data.topVoters ?? []);
	let currentUnit = $derived(tabs.find(t => t.id === activeTab)?.unit ?? '');

	function statValue(entry: any): number {
		if (activeTab === 'xp')      return entry.xpTotal ?? 0;
		if (activeTab === 'pvp')     return entry.pvpKills ?? 0;
		if (activeTab === 'donjons') return entry.dungeonsCompleted ?? 0;
		return entry.faillesFermees ?? 0;
	}

	const MEDAL         = ['🥇', '🥈', '🥉'];
	const PODIUM_COLORS = ['#f59e0b', '#94a3b8', '#cd7c2e'];
	const PODIUM_GLOW   = ['#f59e0b40', '#94a3b840', '#cd7c2e40'];
	const PODIUM_ORDER  = [1, 0, 2];
</script>

<svelte:head>
	<title>Classement — SHINSEI</title>
	<meta name="description" content="Classement des meilleurs joueurs du serveur SHINSEI." />
</svelte:head>

<div style="min-height: 100vh; background: #06060f; padding-top: 80px; padding-bottom: 60px;">
	<div style="max-width: 900px; margin: 0 auto; padding: 0 1.5rem;">

		<!-- Header -->
		<div style="text-align: center; margin-bottom: 2.5rem; padding-top: 1rem;">
			<p style="font-family:'Share Tech Mono',monospace; font-size: 0.75rem; color: #7c3aed; letter-spacing: 0.2em; margin-bottom: 0.4rem;">CLASSEMENT MONDIAL</p>
			<h1 style="font-family:'Rajdhani',sans-serif; font-size: clamp(2rem,5vw,3rem); font-weight: 900; color: white; letter-spacing: 0.04em; margin: 0 0 0.5rem;">
				TOP JOUEURS
			</h1>
			<p style="color: #64748b; font-size: 0.875rem; margin: 0;">Les meilleurs guerriers du serveur SHINSEI</p>
		</div>

		<!-- Tabs -->
		<div style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 2.5rem; flex-wrap: wrap;">
			{#each tabs as tab}
				<button
					onclick={() => activeTab = tab.id}
					style="
						font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.06em;
						padding: 0.5rem 1.25rem; border-radius: 0.375rem; cursor: pointer; transition: all 0.18s;
						background: {activeTab === tab.id ? '#7c3aed' : '#0f0f1a'};
						color: {activeTab === tab.id ? 'white' : '#64748b'};
						border: 1px solid {activeTab === tab.id ? '#9f67ff' : '#1e1530'};
						box-shadow: {activeTab === tab.id ? '0 0 14px #7c3aed40' : 'none'};
					"
				>
					{tab.icon} {tab.label}
				</button>
			{/each}
		</div>

		{#if activeTab === 'votes'}
			<!-- Classement votes -->
			{#if voteEntries.length === 0}
				<div style="text-align: center; padding: 5rem 0;">
					<p style="font-size: 2.5rem; margin-bottom: 1rem;">🗳️</p>
					<p style="font-family:'Rajdhani',sans-serif; font-size: 1.1rem; font-weight: 700; color: #475569; letter-spacing: 0.06em;">AUCUN VOTE ENREGISTRÉ</p>
					<p style="color: #334155; font-size: 0.8rem; margin-top: 0.4rem;">Sois le premier à voter sur <a href="/vote" style="color:#7c3aed;">la page vote</a> !</p>
				</div>
			{:else}
				<!-- Podium top 3 votes -->
				{#if voteEntries.length >= 3}
					<div style="display: flex; align-items: flex-end; justify-content: center; gap: 1rem; margin-bottom: 2.5rem; flex-wrap: wrap;">
						{#each PODIUM_ORDER as pos}
							{#if voteEntries[pos]}
								{@const voter = voteEntries[pos]}
								{@const isFirst = pos === 0}
								{@const isPodiumMe = me !== null && voter.username === me}
								<div style="
									display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
									background: {isPodiumMe ? '#7c3aed18' : '#0f0f1a'}; border: 1px solid {isPodiumMe ? '#7c3aed80' : PODIUM_COLORS[pos] + '40'};
									border-radius: 0.75rem; padding: {isFirst ? '1.75rem 1.75rem' : '1.25rem 1.5rem'};
									min-width: 150px;
									box-shadow: 0 0 24px {PODIUM_GLOW[pos]};
									transform: translateY({isFirst ? '0' : '12px'});
								">
									<span style="font-size: {isFirst ? '2rem' : '1.5rem'}; line-height: 1;">{MEDAL[pos]}</span>
									<div style="
										width: {isFirst ? '56px' : '44px'}; height: {isFirst ? '56px' : '44px'};
										border-radius: 0.5rem; overflow: hidden;
										border: 2px solid {PODIUM_COLORS[pos]}80; background: #06060f;
									">
										<img
											src="https://mc-heads.net/avatar/{voter.username}/56"
											alt={voter.username}
											style="width: 100%; height: 100%; image-rendering: pixelated;"
										/>
									</div>
									<p style="font-family:'Rajdhani',sans-serif; font-size: {isFirst ? '1rem' : '0.875rem'}; font-weight: 700; color: white; margin: 0;">{voter.username}</p>
									<p style="font-family:'Share Tech Mono',monospace; font-size: {isFirst ? '1rem' : '0.875rem'}; color: {PODIUM_COLORS[pos]}; font-weight: 700; margin: 0;">
										{voter.votes} <span style="font-size: 0.65em; opacity: 0.7;">votes</span>
									</p>
								</div>
							{/if}
						{/each}
					</div>
				{/if}

				<!-- Liste : rang 4+ si podium affiché, sinon tous les joueurs -->
				{@const tableStart = voteEntries.length >= 3 ? 3 : 0}
				{#if voteEntries.slice(tableStart).length > 0}
					<div style="background: #0a0a14; border: 1px solid #1e1530; border-radius: 0.75rem; overflow: hidden;">
						<table style="width: 100%; border-collapse: collapse;">
							<thead>
								<tr style="border-bottom: 1px solid #1e1530;">
									<th style="padding: 0.75rem 1rem; text-align: left; font-family:'Rajdhani',sans-serif; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.1em; width: 48px;">#</th>
									<th style="padding: 0.75rem 1rem; text-align: left; font-family:'Rajdhani',sans-serif; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.1em;">JOUEUR</th>
									<th style="padding: 0.75rem 1rem; text-align: right; font-family:'Rajdhani',sans-serif; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.1em;">VOTES</th>
								</tr>
							</thead>
							<tbody>
								{#each voteEntries.slice(tableStart) as voter, i}
									{@const isMe = me !== null && voter.username === me}
									<tr
										style="
											border-bottom: 1px solid #1e153040; transition: background 0.15s;
											background: {isMe ? '#7c3aed15' : 'transparent'};
											border-left: {isMe ? '3px solid #7c3aed' : '3px solid transparent'};
										"
										onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.background = isMe ? '#7c3aed25' : '#7c3aed08'; }}
										onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.background = isMe ? '#7c3aed15' : 'transparent'; }}
									>
										<td style="padding: 0.65rem 1rem;">
											<span style="font-family:'Share Tech Mono',monospace; font-size: 0.8rem; color: #475569; font-weight: 700;">{i + tableStart + 1}</span>
										</td>
										<td style="padding: 0.65rem 1rem;">
											<div style="display: flex; align-items: center; gap: 0.6rem;">
												<div style="width: 28px; height: 28px; border-radius: 0.25rem; overflow: hidden; border: 1px solid #1e1530; background: #06060f; flex-shrink: 0;">
													<img src="https://mc-heads.net/avatar/{voter.username}/28" alt={voter.username} style="width: 100%; height: 100%; image-rendering: pixelated;" />
												</div>
												<span style="font-family:'Rajdhani',sans-serif; font-size: 0.875rem; font-weight: 700; color: {isMe ? '#a855f7' : '#e2e8f0'};">{voter.username}{isMe ? ' (toi)' : ''}</span>
											</div>
										</td>
										<td style="padding: 0.65rem 1rem; text-align: right;">
											<span style="font-family:'Share Tech Mono',monospace; font-size: 0.875rem; color: #22c55e; font-weight: 700;">{voter.votes}</span>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			{/if}

		{:else if !data.leaderboard}
			<!-- Backend hors ligne -->
			<div style="text-align: center; padding: 5rem 0;">
				<p style="font-size: 2.5rem; margin-bottom: 1rem;">🌀</p>
				<p style="font-family:'Rajdhani',sans-serif; font-size: 1.1rem; font-weight: 700; color: #475569; letter-spacing: 0.06em;">SERVEUR HORS LIGNE</p>
				<p style="color: #334155; font-size: 0.8rem; margin-top: 0.4rem;">Le classement sera disponible dès la connexion au serveur.</p>
			</div>

		{:else if entries.length === 0}
			<div style="text-align: center; padding: 5rem 0;">
				<p style="color: #475569;">Aucun joueur pour l'instant.</p>
			</div>

		{:else}
			<!-- Podium top 3 -->
			{#if entries.length >= 3}
				<div style="display: flex; align-items: flex-end; justify-content: center; gap: 1rem; margin-bottom: 2.5rem; flex-wrap: wrap;">
					{#each PODIUM_ORDER as pos}
						{@const entry = entries[pos]}
						{@const isFirst = pos === 0}
						{@const isPodiumMe = me !== null && entry.username === me}
						<div style="
							display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
							background: {isPodiumMe ? '#7c3aed18' : '#0f0f1a'}; border: 1px solid {isPodiumMe ? '#7c3aed80' : PODIUM_COLORS[pos] + '40'};
							border-radius: 0.75rem; padding: {isFirst ? '1.75rem 1.75rem' : '1.25rem 1.5rem'};
							min-width: 150px;
							box-shadow: 0 0 24px {PODIUM_GLOW[pos]};
							transform: translateY({isFirst ? '0' : '12px'});
						">
							<span style="font-size: {isFirst ? '2rem' : '1.5rem'}; line-height: 1;">{MEDAL[pos]}</span>
							<div style="
								width: {isFirst ? '56px' : '44px'}; height: {isFirst ? '56px' : '44px'};
								border-radius: 0.5rem; overflow: hidden;
								border: 2px solid {PODIUM_COLORS[pos]}80; background: #06060f;
							">
								<img
									src="https://mc-heads.net/avatar/{entry.username}/56"
									alt={entry.username}
									style="width: 100%; height: 100%; image-rendering: pixelated;"
									onerror={(e) => onHeadError(e, entry.uuid)}
								/>
							</div>
							<p style="font-family:'Rajdhani',sans-serif; font-size: {isFirst ? '1rem' : '0.875rem'}; font-weight: 700; color: white; margin: 0;">{entry.username}</p>
							<span style="
								font-family:'Share Tech Mono',monospace; font-size: 0.65rem;
								padding: 0.15rem 0.5rem; border-radius: 9999px;
								background: {gradeColor(entry.gradeGameplay)}20;
								color: {gradeColor(entry.gradeGameplay)};
								border: 1px solid {gradeColor(entry.gradeGameplay)}40;
								text-transform: uppercase;
							">{entry.gradeGameplay}</span>
							<p style="font-family:'Share Tech Mono',monospace; font-size: {isFirst ? '1rem' : '0.875rem'}; color: {PODIUM_COLORS[pos]}; font-weight: 700; margin: 0;">
								{statValue(entry).toLocaleString()}
								<span style="font-size: 0.65em; opacity: 0.7;">{currentUnit}</span>
							</p>
						</div>
					{/each}
				</div>
			{/if}

			<!-- Position du joueur connecté -->
			{#if me}
				{@const myEntry = entries.find(e => e.username === me)}
				{#if myEntry}
					<div style="
						display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;
						margin-bottom: 1.25rem; padding: 0.75rem 1.25rem;
						background: #7c3aed18; border: 1px solid #7c3aed50; border-radius: 0.625rem;
					">
						<div style="display: flex; align-items: center; gap: 0.6rem;">
							<span style="font-family:'Share Tech Mono',monospace; font-size: 0.75rem; color: #7c3aed;">TON RANG</span>
							<span style="font-family:'Rajdhani',sans-serif; font-size: 1.3rem; font-weight: 900; color: white;">#{myEntry.rank}</span>
						</div>
						<div style="display: flex; align-items: center; gap: 0.5rem;">
							<span style="font-family:'Rajdhani',sans-serif; font-size: 0.875rem; color: #94a3b8;">{me}</span>
							<span style="font-family:'Share Tech Mono',monospace; font-size: 0.8rem; color: #7c3aed; font-weight: 700;">
								{statValue(myEntry).toLocaleString()} {currentUnit}
							</span>
						</div>
					</div>
				{/if}
			{/if}

			<!-- Tableau rang 4+ -->
			<div style="background: #0a0a14; border: 1px solid #1e1530; border-radius: 0.75rem; overflow: hidden;">
				<table style="width: 100%; border-collapse: collapse;">
					<thead>
						<tr style="border-bottom: 1px solid #1e1530;">
							<th style="padding: 0.75rem 1rem; text-align: left; font-family:'Rajdhani',sans-serif; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.1em; width: 48px;">#</th>
							<th style="padding: 0.75rem 1rem; text-align: left; font-family:'Rajdhani',sans-serif; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.1em;">JOUEUR</th>
							<th style="padding: 0.75rem 1rem; text-align: left; font-family:'Rajdhani',sans-serif; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.1em;">GRADE</th>
							<th style="padding: 0.75rem 1rem; text-align: right; font-family:'Rajdhani',sans-serif; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.1em;">{currentUnit.toUpperCase()}</th>
						</tr>
					</thead>
					<tbody>
						{#each entries.slice(3) as entry}
						{@const isMe = me !== null && entry.username === me}
							<tr
								style="
									border-bottom: 1px solid #1e153040; transition: background 0.15s;
									background: {isMe ? '#7c3aed15' : 'transparent'};
									border-left: {isMe ? '3px solid #7c3aed' : '3px solid transparent'};
								"
								onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.background = isMe ? '#7c3aed25' : '#7c3aed08'; }}
								onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.background = isMe ? '#7c3aed15' : 'transparent'; }}
							>
								<td style="padding: 0.65rem 1rem;">
									<span style="font-family:'Share Tech Mono',monospace; font-size: 0.8rem; color: #475569; font-weight: 700;">{entry.rank}</span>
								</td>
								<td style="padding: 0.65rem 1rem;">
									<div style="display: flex; align-items: center; gap: 0.6rem;">
										<div style="width: 28px; height: 28px; border-radius: 0.25rem; overflow: hidden; border: 1px solid #1e1530; background: #06060f; flex-shrink: 0;">
											<img
												src="https://mc-heads.net/avatar/{entry.username}/28"
												alt={entry.username}
												style="width: 100%; height: 100%; image-rendering: pixelated;"
												onerror={(e) => onHeadError(e, entry.uuid)}
											/>
										</div>
										<div>
											<p style="font-family:'Rajdhani',sans-serif; font-size: 0.875rem; font-weight: 700; color: #e2e8f0; margin: 0;">{entry.username}</p>
											{#if entry.classe}
												<p style="font-size: 0.7rem; color: {classColor(entry.classe)}; margin: 0; text-transform: capitalize;">{entry.classe}</p>
											{/if}
										</div>
									</div>
								</td>
								<td style="padding: 0.65rem 1rem;">
									<span style="
										font-family:'Share Tech Mono',monospace; font-size: 0.65rem;
										padding: 0.15rem 0.5rem; border-radius: 9999px;
										background: {gradeColor(entry.gradeGameplay)}20;
										color: {gradeColor(entry.gradeGameplay)};
										border: 1px solid {gradeColor(entry.gradeGameplay)}40;
										text-transform: uppercase; white-space: nowrap;
									">{entry.gradeGameplay}</span>
								</td>
								<td style="padding: 0.65rem 1rem; text-align: right;">
									<span style="font-family:'Share Tech Mono',monospace; font-size: 0.875rem; color: #7c3aed; font-weight: 700;">
										{statValue(entry).toLocaleString()}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

	</div>
</div>
