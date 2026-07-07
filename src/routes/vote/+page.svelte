<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { VOTE_SITES, VOTE_REWARDS, REWARD_SITES, type SiteKey } from '$lib/data/vote-sites';

	let { data }: { data: PageData } = $props();

	const sites = Object.entries(VOTE_SITES) as [SiteKey, (typeof VOTE_SITES)[SiteKey]][];

	// Reactive clock — updates every second for countdown display
	let now = $state(Date.now());

	// Server-side vote status (callback confirmed) — seule source de vérité pour les récompenses
	type SiteStatus = {
		lastVoteAt: number | null;
		canVote: boolean;
		nextVoteAt: number | null;
		countsForReward: boolean;
	};
	type VoteStatus = {
		sites: Record<SiteKey, SiteStatus>;
		rewardVotedCount: number;
		rewardTotal: number;
		pendingRewards: number;
	};
	let serverOverride = $state<VoteStatus | null>(null);
	let serverStatus   = $derived<VoteStatus | null>(serverOverride ?? (data.voteStatus as VoteStatus | null));

	// Sites où le bouton a été cliqué mais callback pas encore reçu
	let pendingClick = $state<Set<SiteKey>>(new Set());
	let clickedAt    = $state<Partial<Record<SiteKey, number>>>({});

	// Claim state
	let claiming     = $state(false);
	let claimSuccess = $state(false);
	let claimError   = $state('');

	const rewardSiteSet = new Set(REWARD_SITES as readonly string[]);

	// Info par site — "VOTÉ" uniquement sur confirmation serveur (callback reçu)
	let voteInfo = $derived(
		sites.map(([key, site]) => {
			const srv           = serverStatus?.sites[key];
			const canVote       = srv ? srv.canVote || now >= (srv.nextVoteAt ?? 0) : true;
			const nextVoteAt    = srv?.nextVoteAt ?? null;
			const timeLeft      = !canVote && nextVoteAt ? Math.max(0, nextVoteAt - now) : 0;
			const countsForReward = rewardSiteSet.has(key);

			const clickTs  = clickedAt[key];
			const isPending = canVote && pendingClick.has(key) && clickTs != null && (now - clickTs) < 3 * 60_000;

			return { key, site, canVote, nextVoteAt, timeLeft, isPending, countsForReward };
		})
	);

	let rewardVotedCount = $derived(serverStatus?.rewardVotedCount ?? 0);
	let rewardTotal      = $derived(serverStatus?.rewardTotal ?? REWARD_SITES.length);
	let allRewardVoted   = $derived(rewardVotedCount >= rewardTotal);
	let pendingCount     = $derived(serverStatus?.pendingRewards ?? 0);
	let hasPendingReward = $derived(pendingCount > 0);

	function fmtTime(ms: number): string {
		if (ms <= 0) return '';
		const h = Math.floor(ms / 3_600_000);
		const m = Math.floor((ms % 3_600_000) / 60_000);
		const s = Math.floor((ms % 60_000) / 1_000);
		if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
		if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
		return `${s}s`;
	}

	function fmtPending(key: SiteKey): string {
		const ts = clickedAt[key];
		if (!ts) return '';
		const elapsed = Math.floor((now - ts) / 1000);
		if (elapsed < 60) return `Il y a ${elapsed}s`;
		return `Il y a ${Math.floor(elapsed / 60)}m`;
	}

	function buildVoteUrl(key: SiteKey, url: string): string {
		if (!data.user) return url;
		const site = VOTE_SITES[key];
		if (site.verifyBy !== 'username') return url;
		const name  = encodeURIComponent(data.user.username);
		const sep   = url.includes('?') ? '&' : '?';
		return `${url}${sep}${site.urlParam}=${name}`;
	}

	function handleVote(key: SiteKey, url: string): void {
		console.log(`[vote] click ${key} — user=${data.user?.username ?? 'NON CONNECTÉ'}`);
		if (data.user) {
			clickedAt    = { ...clickedAt, [key]: Date.now() };
			pendingClick = new Set([...pendingClick, key]);
			startFastPoll();
		}
		window.open(buildVoteUrl(key, url), '_blank', 'noopener,noreferrer');
	}

	let fastPollActive = false;
	function startFastPoll(): void {
		if (fastPollActive) return;
		fastPollActive = true;
		let count = 0;
		const id = setInterval(async () => {
			count++;
			await refreshStatus();
			if (count >= 36) { clearInterval(id); fastPollActive = false; }
		}, 5_000);
	}

	async function refreshStatus(): Promise<void> {
		if (!data.user) return;
		try {
			const res = await fetch('/api/vote/status');
			if (!res.ok) return;
			const json = await res.json();
			if (!json.authenticated) return;
			const { sites: siteMap, rewardVotedCount, rewardTotal, pendingRewards } = json;
			serverOverride = { sites: siteMap, rewardVotedCount, rewardTotal, pendingRewards };

			const newPending = new Set(pendingClick);
			for (const [k] of sites) {
				if (siteMap[k] && !siteMap[k].canVote) newPending.delete(k as SiteKey);
			}
			pendingClick = newPending;
		} catch { /* ignore */ }
	}

	async function claimRewards(): Promise<void> {
		claiming = true; claimError = ''; claimSuccess = false;
		try {
			const res = await fetch('/api/vote/claim', { method: 'POST' });
			if (res.ok) { claimSuccess = true; await refreshStatus(); }
			else {
				const j = await res.json().catch(() => ({}));
				claimError = j.error ?? 'Erreur lors de la réclamation.';
			}
		} catch { claimError = 'Erreur réseau.'; }
		finally { claiming = false; }
	}

	onMount(() => {
		const clockTimer = setInterval(() => { now = Date.now(); }, 1000);
		const slowPoll   = data.user ? setInterval(refreshStatus, 30_000) : null;

		// Poll immédiat quand l'utilisateur revient sur l'onglet après avoir voté
		function onVisibility() {
			if (document.visibilityState === 'visible' && fastPollActive) refreshStatus();
		}
		document.addEventListener('visibilitychange', onVisibility);

		return () => {
			clearInterval(clockTimer);
			if (slowPoll) clearInterval(slowPoll);
			document.removeEventListener('visibilitychange', onVisibility);
		};
	});
</script>

<svelte:head>
	<title>Vote — SHINSEI</title>
	<meta name="description" content="Votez chaque jour pour SHINSEI sur les sites partenaires et gagnez des récompenses exclusives en jeu." />
</svelte:head>

<div style="min-height: 100vh; background: #06060f; padding-top: 80px; padding-bottom: 60px;">
	<div style="max-width: 960px; margin: 0 auto; padding: 0 1.5rem;">

		<!-- Bannière login -->
		{#if !data.user}
			<div style="margin-bottom:1.5rem;padding:0.85rem 1.25rem;background:#ef444412;border:1px solid #ef444440;border-radius:0.75rem;display:flex;align-items:center;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;">
				<p style="color:#f87171;font-size:0.875rem;margin:0;">⚠️ Connecte-toi pour que tes votes soient suivis et recevoir tes récompenses en jeu.</p>
				<a href="/connexion" style="font-family:'Rajdhani',sans-serif;font-size:0.8rem;font-weight:900;letter-spacing:0.08em;padding:0.4rem 1rem;background:#7c3aed;color:white;border-radius:0.375rem;text-decoration:none;white-space:nowrap;">SE CONNECTER</a>
			</div>
		{:else}
			<div style="margin-bottom:1.5rem;padding:0.6rem 1rem;background:#7c3aed12;border:1px solid #7c3aed30;border-radius:0.75rem;display:flex;align-items:center;gap:0.6rem;">
				<img src="https://mc-heads.net/avatar/{data.user.username}/20" alt="" style="width:20px;height:20px;border-radius:3px;image-rendering:pixelated;" />
				<p style="font-family:'Share Tech Mono',monospace;font-size:0.7rem;color:#7c3aed;margin:0;">Connecté · votes suivis pour <strong style="color:#a855f7;">{data.user.username}</strong></p>
			</div>
		{/if}

		<!-- Header -->
		<div style="text-align: center; margin-bottom: 3rem; padding-top: 1rem;">
			<p style="font-family:'Share Tech Mono',monospace; font-size: 0.75rem; color: #7c3aed; letter-spacing: 0.2em; margin: 0 0 0.4rem;">SOUTENEZ LE SERVEUR</p>
			<h1 style="font-family:'Rajdhani',sans-serif; font-size: clamp(2rem,5vw,3rem); font-weight: 900; color: white; letter-spacing: 0.04em; margin: 0 0 0.6rem;">
				VOTE &amp; RÉCOMPENSES
			</h1>
			<p style="color: #64748b; font-size: 0.9rem; max-width: 520px; margin: 0 auto;">
				Votez sur les sites partenaires. Les récompenses sont créditées automatiquement une fois le vote <strong style="color:#475569;">confirmé</strong> par le site.
			</p>
		</div>

		<!-- Vote cards -->
		<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
			{#each voteInfo as info (info.key)}
				{@const voted   = !info.canVote}
				{@const pending = info.isPending}
				<div style="
					position: relative; overflow: hidden;
					background: {voted ? info.site.color + '0d' : pending ? '#0f1020' : '#0f0f1a'};
					border: 1px solid {voted ? info.site.color + '50' : pending ? '#3b4bd080' : info.countsForReward ? '#1e1530' : '#161622'};
					border-radius: 0.75rem; padding: 1.25rem;
					transition: border-color 0.25s, background 0.25s;
					opacity: {info.countsForReward ? 1 : 0.8};
				">
					{#if voted}
						<div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;background:radial-gradient({info.site.color}30,transparent 70%);pointer-events:none;"></div>
					{/if}
					{#if pending}
						<div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(to right,transparent,#3b82f6,transparent);animation:shimmer 2s ease-in-out infinite;"></div>
					{/if}

					<!-- Badge "bonus" pour les sites sans tracking -->
					{#if !info.countsForReward}
						<div style="position:absolute;top:0.6rem;right:0.6rem;background:#1e1530;border:1px solid #2d2540;border-radius:9999px;padding:0.1rem 0.5rem;">
							<span style="font-size:0.6rem;color:#475569;font-family:'Share Tech Mono',monospace;">BONUS</span>
						</div>
					{/if}

					<!-- Period + label -->
					<div style="display:flex;align-items:center;gap:0.45rem;margin-bottom:0.25rem;">
						<span style="width:7px;height:7px;border-radius:50%;flex-shrink:0;background:{info.site.color};box-shadow:0 0 6px {info.site.color};"></span>
						<span style="font-family:'Share Tech Mono',monospace;font-size:0.62rem;color:{info.site.color};letter-spacing:0.1em;">{info.site.period.toUpperCase()}</span>
					</div>
					<h2 style="font-family:'Rajdhani',sans-serif;font-size:1.05rem;font-weight:900;color:white;letter-spacing:0.03em;margin:0 0 0.85rem;">{info.site.label}</h2>

					<!-- Récompenses par vote -->
					<div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:1rem;">
						<span style="font-size:0.65rem;color:#94a3b8;background:#ffffff08;padding:0.15rem 0.45rem;border-radius:9999px;border:1px solid #1e1530;">⚡ {VOTE_REWARDS.perVote.xp} XP</span>
						<span style="font-size:0.65rem;color:#94a3b8;background:#ffffff08;padding:0.15rem 0.45rem;border-radius:9999px;border:1px solid #1e1530;">💰 {VOTE_REWARDS.perVote.dollars}$</span>
						<span style="font-size:0.65rem;color:#94a3b8;background:#ffffff08;padding:0.15rem 0.45rem;border-radius:9999px;border:1px solid #1e1530;">💎 {VOTE_REWARDS.perVote.eclats} Éclats</span>
					</div>

					<!-- Action -->
					{#if voted}
						<div style="padding:0.55rem 0.9rem;background:{info.site.color}12;border:1px solid {info.site.color}35;border-radius:0.5rem;text-align:center;">
							<p style="font-family:'Share Tech Mono',monospace;font-size:0.68rem;color:{info.site.color};margin:0 0 0.1rem;letter-spacing:0.06em;">✓ VOTE CONFIRMÉ</p>
							{#if info.timeLeft > 0}
								<p style="font-family:'Rajdhani',sans-serif;font-size:0.78rem;color:#475569;margin:0;">Prochain : <span style="color:#64748b;font-weight:700;">{fmtTime(info.timeLeft)}</span></p>
							{/if}
						</div>
					{:else if pending}
						<div style="padding:0.55rem 0.9rem;background:#3b82f615;border:1px solid #3b82f640;border-radius:0.5rem;text-align:center;">
							<p style="font-family:'Share Tech Mono',monospace;font-size:0.65rem;color:#60a5fa;margin:0 0 0.1rem;letter-spacing:0.06em;">⏳ EN ATTENTE</p>
							<p style="font-size:0.72rem;color:#334155;margin:0;">Ouvert {fmtPending(info.key)}</p>
						</div>
					{:else if !data.user}
						<a href="/connexion" style="display:block;width:100%;box-sizing:border-box;font-family:'Rajdhani',sans-serif;font-size:0.875rem;font-weight:900;letter-spacing:0.1em;padding:0.55rem 1rem;text-align:center;text-decoration:none;background:#1a1a2e;color:#334155;border:1px solid #1e1530;border-radius:0.5rem;">&#x1F512; CONNEXION REQUISE</a>
					{:else}
						{#if VOTE_SITES[info.key].verifyBy === 'username'}
							<p style="font-family:'Share Tech Mono',monospace;font-size:0.62rem;color:#475569;margin:0 0 0.45rem;letter-spacing:0.04em;">
								Pseudo : <span style="color:#94a3b8;font-weight:700;">{data.user.username}</span>
							</p>
						{:else if VOTE_SITES[info.key].verifyBy === 'ip'}
							<p style="font-family:'Share Tech Mono',monospace;font-size:0.62rem;color:#475569;margin:0 0 0.45rem;letter-spacing:0.04em;">
								Vérifié par adresse IP
							</p>
						{/if}
						<button
							onclick={() => handleVote(info.key, info.site.url)}
							style="
								width:100%;box-sizing:border-box;
								font-family:'Rajdhani',sans-serif;font-size:0.875rem;font-weight:900;letter-spacing:0.1em;
								padding:0.55rem 1rem;
								background:{info.site.color}22;color:{info.site.color};
								border:1px solid {info.site.color}55;border-radius:0.5rem;cursor:pointer;
								transition: background 0.15s, box-shadow 0.15s;
							"
							onmouseenter={(e) => {
								const el = e.currentTarget as HTMLElement;
								el.style.background = info.site.color + '35';
								el.style.boxShadow  = `0 0 18px ${info.site.color}45`;
							}}
							onmouseleave={(e) => {
								const el = e.currentTarget as HTMLElement;
								el.style.background = info.site.color + '22';
								el.style.boxShadow  = 'none';
							}}
						>VOTER →</button>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Progress bar — basée sur les 3 sites trackables -->
		<div style="background:#0f0f1a;border:1px solid #1e1530;border-radius:0.75rem;padding:1.25rem;margin-bottom:1.5rem;">
			<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
				<p style="font-family:'Rajdhani',sans-serif;font-size:0.85rem;font-weight:700;color:#64748b;letter-spacing:0.08em;margin:0;">PROGRESSION RÉCOMPENSES</p>
				<p style="font-family:'Share Tech Mono',monospace;font-size:0.85rem;color:{allRewardVoted ? '#22c55e' : '#7c3aed'};margin:0;">{rewardVotedCount}/{rewardTotal} confirmés</p>
			</div>
			<div style="background:#1a1a2e;border-radius:9999px;height:10px;overflow:hidden;">
				<div style="
					height:100%;border-radius:9999px;
					width:{rewardTotal > 0 ? (rewardVotedCount / rewardTotal) * 100 : 0}%;
					background:linear-gradient(to right, #7c3aed, {allRewardVoted ? '#22c55e' : '#9f67ff'});
					box-shadow:0 0 10px {allRewardVoted ? '#22c55e60' : '#7c3aed60'};
					transition: width 0.6s cubic-bezier(0.4,0,0.2,1), background 0.6s;
				"></div>
			</div>
			<div style="display:flex;gap:1rem;margin-top:0.6rem;flex-wrap:wrap;">
				{#each voteInfo.filter(v => v.countsForReward) as info}
					<div style="display:flex;align-items:center;gap:0.35rem;">
						<span style="width:6px;height:6px;border-radius:50%;flex-shrink:0;background:{!info.canVote ? info.site.color : '#1e1530'};transition:background 0.3s;"></span>
						<span style="font-size:0.65rem;color:{!info.canVote ? info.site.color : '#334155'};transition:color 0.3s;">{info.site.label}</span>
					</div>
				{/each}
			</div>
			{#if allRewardVoted}
				<p style="font-family:'Rajdhani',sans-serif;font-size:0.8rem;color:#22c55e;margin:0.6rem 0 0;letter-spacing:0.04em;">✓ Tous les votes confirmés — réclamez vos récompenses !</p>
			{/if}
		</div>

		<!-- Rewards section -->
		<div style="background:#0f0f1a;border:1px solid #1e1530;border-radius:0.75rem;padding:1.5rem;">
			<p style="font-family:'Share Tech Mono',monospace;font-size:0.7rem;color:#7c3aed;letter-spacing:0.2em;margin:0 0 0.3rem;">RÉCOMPENSES</p>
			<h2 style="font-family:'Rajdhani',sans-serif;font-size:1.5rem;font-weight:900;color:white;margin:0 0 1.5rem;letter-spacing:0.03em;">CE QUE VOUS GAGNEZ</h2>

			<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.5rem;">
				<div>
					<p style="font-family:'Rajdhani',sans-serif;font-size:0.7rem;font-weight:700;color:#475569;letter-spacing:0.12em;margin:0 0 0.6rem;">PAR VOTE (×{rewardTotal})</p>
					<div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
						<div style="background:#7c3aed15;border:1px solid #7c3aed30;border-radius:0.5rem;padding:0.55rem 0.8rem;">
							<p style="font-family:'Rajdhani',sans-serif;font-size:1.15rem;font-weight:900;color:#a855f7;margin:0;">{VOTE_REWARDS.perVote.xp} XP</p>
							<p style="font-size:0.6rem;color:#475569;margin:0;">par vote</p>
						</div>
						<div style="background:#f59e0b15;border:1px solid #f59e0b30;border-radius:0.5rem;padding:0.55rem 0.8rem;">
							<p style="font-family:'Rajdhani',sans-serif;font-size:1.15rem;font-weight:900;color:#fbbf24;margin:0;">{VOTE_REWARDS.perVote.dollars}$</p>
							<p style="font-size:0.6rem;color:#475569;margin:0;">par vote</p>
						</div>
						<div style="background:#06b6d415;border:1px solid #06b6d430;border-radius:0.5rem;padding:0.55rem 0.8rem;">
							<p style="font-family:'Rajdhani',sans-serif;font-size:1.15rem;font-weight:900;color:#22d3ee;margin:0;">{VOTE_REWARDS.perVote.eclats} Éclats</p>
							<p style="font-size:0.6rem;color:#475569;margin:0;">par vote</p>
						</div>
					</div>
				</div>
				<div>
					<p style="font-family:'Rajdhani',sans-serif;font-size:0.7rem;font-weight:700;color:#22c55e80;letter-spacing:0.12em;margin:0 0 0.6rem;">BONUS {rewardTotal}/{rewardTotal} VOTES</p>
					<div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
						<div style="background:#22c55e10;border:1px solid #22c55e30;border-radius:0.5rem;padding:0.55rem 0.8rem;">
							<p style="font-family:'Rajdhani',sans-serif;font-size:1.15rem;font-weight:900;color:#4ade80;margin:0;">+{VOTE_REWARDS.bonusAll.xp} XP</p>
							<p style="font-size:0.6rem;color:#475569;margin:0;">bonus</p>
						</div>
						<div style="background:#f59e0b10;border:1px solid #f59e0b30;border-radius:0.5rem;padding:0.55rem 0.8rem;">
							<p style="font-family:'Rajdhani',sans-serif;font-size:1.15rem;font-weight:900;color:#fbbf24;margin:0;">+{VOTE_REWARDS.bonusAll.dollars}$</p>
							<p style="font-size:0.6rem;color:#475569;margin:0;">bonus</p>
						</div>
						<div style="background:#06b6d410;border:1px solid #06b6d430;border-radius:0.5rem;padding:0.55rem 0.8rem;">
							<p style="font-family:'Rajdhani',sans-serif;font-size:1.15rem;font-weight:900;color:#22d3ee;margin:0;">+{VOTE_REWARDS.bonusAll.eclats} Éclats</p>
							<p style="font-size:0.6rem;color:#475569;margin:0;">bonus</p>
						</div>
						<div style="background:#7c3aed10;border:1px solid #7c3aed30;border-radius:0.5rem;padding:0.55rem 0.8rem;">
							<p style="font-family:'Rajdhani',sans-serif;font-size:1.15rem;font-weight:900;color:#a855f7;margin:0;">{VOTE_REWARDS.bonusAll.cles} Clé</p>
							<p style="font-size:0.6rem;color:#475569;margin:0;">coffre vote</p>
						</div>
					</div>
				</div>
			</div>

			<div style="height:1px;background:#1e1530;margin-bottom:1.25rem;"></div>

			<!-- Claim zone -->
			{#if !data.user}
				<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;">
					<p style="color:#334155;font-size:0.85rem;margin:0;">Connectez-vous pour que vos votes soient suivis et les récompenses créditées.</p>
					<a href="/connexion" style="
						font-family:'Rajdhani',sans-serif;font-size:0.85rem;font-weight:900;letter-spacing:0.08em;
						padding:0.55rem 1.25rem;background:#7c3aed20;color:#9f67ff;
						border:1px solid #7c3aed50;border-radius:0.5rem;text-decoration:none;transition:box-shadow 0.15s;
					"
					onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px #7c3aed40'; }}
					onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
					>CONNEXION</a>
				</div>
			{:else if claimSuccess}
				<div style="background:#22c55e12;border:1px solid #22c55e40;border-radius:0.5rem;padding:0.9rem 1rem;">
					<p style="font-family:'Rajdhani',sans-serif;font-size:0.95rem;font-weight:700;color:#4ade80;margin:0;">⚡ Récompenses envoyées ! Elles apparaîtront en jeu dans quelques instants.</p>
				</div>
			{:else if claimError}
				<div style="background:#ef444412;border:1px solid #ef444440;border-radius:0.5rem;padding:0.9rem 1rem;">
					<p style="font-family:'Rajdhani',sans-serif;font-size:0.9rem;color:#f87171;margin:0;">{claimError}</p>
				</div>
			{:else if hasPendingReward}
				<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;">
					<div>
						<p style="font-family:'Rajdhani',sans-serif;font-size:0.95rem;font-weight:700;color:#22c55e;margin:0 0 0.1rem;">🎁 {pendingCount} récompense{pendingCount > 1 ? 's' : ''} à réclamer !</p>
						<p style="font-size:0.8rem;color:#475569;margin:0;">Chaque vote confirmé est réclamable — votez sur les 4 sites pour le bonus.</p>
					</div>
					<button
						onclick={claimRewards}
						disabled={claiming}
						style="
							font-family:'Rajdhani',sans-serif;font-size:0.9rem;font-weight:900;letter-spacing:0.08em;
							padding:0.65rem 1.75rem;
							background:linear-gradient(135deg, #7c3aed, #22c55e);
							color:white;border:none;border-radius:0.5rem;cursor:pointer;
							box-shadow:0 0 20px #7c3aed50;opacity:{claiming ? 0.65 : 1};
							transition:opacity 0.2s, box-shadow 0.2s;
						"
						onmouseenter={(e) => { if (!claiming) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px #7c3aed70'; }}
						onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px #7c3aed50'; }}
					>{claiming ? 'RÉCLAMATION…' : '⚡ RÉCLAMER MES RÉCOMPENSES'}</button>
				</div>
			{:else}
				<p style="font-size:0.85rem;color:#334155;margin:0;">
					Votez sur un site : la récompense devient réclamable dès qu'il est confirmé (quelques secondes).
					Les 4 sites confirmés = bonus supplémentaire.
				</p>
			{/if}
		</div>

		<!-- Lien classement votes -->
		<div style="margin-top:1.25rem;background:#0f0f1a;border:1px solid #1e1530;border-radius:0.75rem;padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;">
			<p style="font-family:'Rajdhani',sans-serif;font-size:0.875rem;color:#64748b;margin:0;">🏆 Consultez le classement des meilleurs voteurs !</p>
			<a href="/classement" style="
				font-family:'Rajdhani',sans-serif;font-size:0.8rem;font-weight:900;letter-spacing:0.08em;
				padding:0.45rem 1rem;background:#7c3aed20;color:#9f67ff;
				border:1px solid #7c3aed50;border-radius:0.5rem;text-decoration:none;
				white-space:nowrap;transition:box-shadow 0.15s;
			"
			onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 14px #7c3aed40'; }}
			onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
			>VOIR LE CLASSEMENT →</a>
		</div>

		<!-- How it works -->
		<div style="margin-top:1.25rem;padding:1rem 1.25rem;background:#0d0d15;border:1px solid #1e1530;border-radius:0.75rem;display:flex;gap:0.75rem;align-items:flex-start;">
			<span style="font-size:1rem;flex-shrink:0;margin-top:0.1rem;">ℹ️</span>
			<div>
				<p style="font-family:'Rajdhani',sans-serif;font-size:0.8rem;font-weight:700;color:#475569;letter-spacing:0.05em;margin:0 0 0.2rem;">COMMENT ÇA MARCHE ?</p>
				<p style="font-size:0.78rem;color:#334155;margin:0;line-height:1.55;">
					Connectez-vous, cliquez <strong style="color:#64748b;">VOTER</strong>, entrez votre pseudo Minecraft sur le site et validez.
					Le statut passe à <strong style="color:#64748b;">✓ VOTE CONFIRMÉ</strong> automatiquement (quelques secondes).
					Une fois les <strong style="color:#64748b;">{rewardTotal} sites</strong> confirmés, le bouton Réclamer s'active.
				</p>
			</div>
		</div>

	</div>
</div>

<style>
	@keyframes shimmer {
		0%   { opacity: 0.4; }
		50%  { opacity: 1;   }
		100% { opacity: 0.4; }
	}
</style>
