<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function fmtDate(iso: string) {
		if (!iso) return '';
		const d = new Date(iso);
		return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
			+ ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
	}

	function fmt(n: number): string {
		return n >= 1000 ? (n / 1000).toFixed(1).replace('.', ',') + 'k' : String(n);
	}

	function timeAgo(ts: number): string {
		const diff = Date.now() - ts;
		const days  = Math.floor(diff / 86_400_000);
		const hours = Math.floor(diff / 3_600_000);
		const mins  = Math.floor(diff / 60_000);
		if (days  > 0) return `il y a ${days}j`;
		if (hours > 0) return `il y a ${hours}h`;
		if (mins  > 0) return `il y a ${mins}min`;
		return 'à l\'instant';
	}

	const maxLogins = $derived(Math.max(...data.dailyLogins.map(d => d.count), 1));
	const maxVotes  = $derived(Math.max(...data.topVoters.map(v => v.count), 1));

	// ── Console serveur ──────────────────────────────────────────────
	let mcRunning     = $state(false);
	let mcInitialized = $state(false);
	let mcLogs        = $state<string[]>([]);
	let mcStatus      = $state('');
	let mcLoading     = $state(false);
	let consoleEl     = $state<HTMLElement | null>(null);

	// ── Modal STOP ───────────────────────────────────────────────────
	let showStopModal = $state(false);
	let stopEnabled   = $state(true);
	let stopEndDate   = $state('');
	let stopMessage   = $state(data.maintenance.message || 'Le serveur est en maintenance. Nous revenons très bientôt !');

	function openStopModal() {
		const d = new Date(Date.now() + 3_600_000);
		stopEndDate = d.toISOString().slice(0, 16);
		stopEnabled = true;
		showStopModal = true;
	}

	// ── Commande MC ──────────────────────────────────────────────────
	let cmdInput   = $state('');
	let cmdStatus  = $state('');
	let cmdLoading = $state(false);

	async function sendCmd() {
		const cmd = cmdInput.trim();
		if (!cmd || cmdLoading) return;
		cmdLoading = true;
		cmdStatus  = '';
		try {
			const r = await fetch('/api/admin/server', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'cmd', cmd }),
			});
			const d = await r.json();
			cmdStatus = d.message ?? d.error ?? '';
			cmdInput  = '';
		} catch {
			cmdStatus = 'Erreur réseau';
		} finally {
			cmdLoading = false;
		}
	}

	async function fetchStatus() {
		try {
			const r = await fetch('/api/admin/server?action=status');
			if (!r.ok) return;
			const d = await r.json();
			const newRunning = d.running ?? false;
			if (mcInitialized && newRunning !== mcRunning) {
				mcStatus = newRunning ? '✓ Serveur en ligne' : '✓ Serveur arrêté';
				setTimeout(() => { if (mcStatus.startsWith('✓')) mcStatus = ''; }, 4000);
			}
			mcRunning = newRunning;
			mcInitialized = true;
		} catch { /* offline */ }
	}

	function autoScroll() {
		setTimeout(() => { if (consoleEl) consoleEl.scrollTop = consoleEl.scrollHeight; }, 20);
	}

	async function serverAction(action: 'start' | 'stop', opts: { enabled?: boolean; endDate?: string; message?: string } = {}) {
		mcLoading = true;
		mcStatus = '';
		try {
			const r = await fetch('/api/admin/server', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action, ...opts }),
			});
			const d = await r.json();
			mcStatus = d.message ?? d.error ?? '';
			await fetchStatus();
			await invalidateAll();
		} catch {
			mcStatus = 'Erreur réseau';
		} finally {
			mcLoading = false;
		}
	}

	function logColor(line: string): string {
		const l = line.toLowerCase();
		if (l.includes('error') || l.includes('exception') || l.includes('fatal')) return '#f87171';
		if (l.includes('warn')) return '#fbbf24';
		if (l.includes('[chat]') || l.includes('<')) return '#67e8f9';
		if (l.includes('joined') || l.includes('left') || l.includes('logged')) return '#86efac';
		return '#94a3b8';
	}

	$effect(() => {
		fetchStatus();
		mcLogs = [];

		const es = new EventSource('/api/admin/server?action=stream');
		es.onmessage = (e) => {
			try {
				const line = JSON.parse(e.data) as string;
				mcLogs = [...mcLogs.slice(-500), line];
				autoScroll();
			} catch { /* ignore */ }
		};

		const statusInterval = setInterval(fetchStatus, 2000);
		return () => { es.close(); clearInterval(statusInterval); };
	});
</script>

<svelte:head>
	<title>Panel Admin — SHINSEI</title>
</svelte:head>

<div style="min-height: 80vh; padding: 2rem 1.25rem; max-width: 64rem; margin: 0 auto;">

	<!-- Header -->
	<div style="margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
		<div>
			<div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.3rem;">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.2">
					<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
				</svg>
				<h1 style="font-family:'Rajdhani',sans-serif; font-size: 1.6rem; font-weight: 900; color: #7c3aed; text-shadow: 0 0 20px #7c3aed50; letter-spacing: 0.05em; margin: 0;">
					PANEL ADMINISTRATEUR
				</h1>
			</div>
			<div style="display: flex; align-items: center; gap: 0.5rem; font-family:'Share Tech Mono',monospace; font-size: 0.72rem; color: #64748b;">
				<div style="width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e80;"></div>
				Connecté · <span style="color: #06b6d4;">{data.adminUser}</span>
			</div>
		</div>
		<!-- Server status pill -->
		<div style="
			display: flex; align-items: center; gap: 0.6rem;
			padding: 0.4rem 1rem; border-radius: 9999px;
			background: {data.server.online ? '#052e16' : '#1c0a09'};
			border: 1px solid {data.server.online ? '#16a34a40' : '#ef444430'};
			font-family:'Share Tech Mono',monospace; font-size: 0.72rem;
		">
			<div style="width: 7px; height: 7px; border-radius: 50%; background: {data.server.online ? '#22c55e' : '#ef4444'}; box-shadow: 0 0 8px {data.server.online ? '#22c55e' : '#ef4444'};"></div>
			<span style="color: {data.server.online ? '#4ade80' : '#f87171'};">Serveur {data.server.online ? 'EN LIGNE' : 'HORS LIGNE'}</span>
			{#if data.server.online}
				<span style="color: #64748b;">·</span>
				<span style="color: #94a3b8;">{data.server.players} joueurs</span>
			{/if}
		</div>
	</div>

	<!-- Stat cards -->
	<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1rem;" class="sm:grid-cols-4">

		{#each [
			{ label: 'Sessions actives',  value: data.stats.activeSessions,  icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75', color: '#06b6d4', bg: '#0c1a2e' },
			{ label: 'Comptes enregistrés', value: data.stats.uniqueUsers,  icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8zM19 8l2 2 4-4', color: '#7c3aed', bg: '#150d2e' },
			{ label: 'Lancements launcher', value: data.stats.totalDownloads, icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3', color: '#f59e0b', bg: '#1c1203' },
			{ label: 'Votes reçus',        value: data.stats.totalVotes,    icon: 'M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3', color: '#22c55e', bg: '#051a0e' },
		] as card}
			<div style="background: {card.bg}; border: 1px solid {card.color}20; border-radius: 0.75rem; padding: 1rem 1.25rem;">
				<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
					<span style="font-family:'Share Tech Mono',monospace; font-size: 0.65rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em;">{card.label}</span>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={card.color} stroke-width="2" opacity="0.7">
						<path d={card.icon}/>
					</svg>
				</div>
				<div style="font-family:'Rajdhani',sans-serif; font-size: 2rem; font-weight: 900; color: {card.color}; text-shadow: 0 0 16px {card.color}40; line-height: 1;">
					{fmt(card.value)}
				</div>
			</div>
		{/each}
	</div>

	<!-- Server details + Top voters -->
	<div class="two-col-grid" style="display: grid; gap: 0.75rem; margin-bottom: 1rem;">

		<!-- Server details -->
		<div style="background: #0d0d15; border: 1px solid #1e1530; border-radius: 0.75rem; padding: 1.25rem;">
			<p style="font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 1rem;">Serveur Minecraft</p>
			{#if data.server.online}
				{#each [
					{ label: 'Joueurs en ligne', value: data.server.players, color: '#4ade80' },
					{ label: 'Donjons actifs',  value: data.server.donjons,  color: '#c084fc' },
					{ label: 'Failles ouvertes', value: data.server.failles, color: '#38bdf8' },
				] as row}
					<div style="display: flex; align-items: center; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid #1e153040;">
						<span style="font-family:'Share Tech Mono',monospace; font-size: 0.72rem; color: #64748b;">{row.label}</span>
						<span style="font-family:'Rajdhani',sans-serif; font-size: 1.1rem; font-weight: 700; color: {row.color};">{row.value}</span>
					</div>
				{/each}
				<div style="display: flex; align-items: center; justify-content: space-between; padding: 0.4rem 0;">
					<span style="font-family:'Share Tech Mono',monospace; font-size: 0.72rem; color: #64748b;">Connexions totales</span>
					<span style="font-family:'Rajdhani',sans-serif; font-size: 1.1rem; font-weight: 700; color: #7c3aed;">{fmt(data.stats.totalLogins)}</span>
				</div>
			{:else}
				<div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: #1c0a09; border-radius: 0.5rem; font-family:'Share Tech Mono',monospace; font-size: 0.72rem; color: #f87171;">
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
					Serveur inaccessible
				</div>
			{/if}
		</div>

		<!-- Top voters -->
		<div style="background: #0d0d15; border: 1px solid #1e1530; border-radius: 0.75rem; padding: 1.25rem;">
			<p style="font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 1rem;">Top voteurs <span style="color:#374151; font-size:0.65rem;">(30 jours)</span></p>
			{#if data.topVoters.length === 0}
				<p style="font-family:'Share Tech Mono',monospace; font-size: 0.72rem; color: #374151;">Aucun vote ce mois</p>
			{:else}
				{#each data.topVoters as voter, i}
					<div style="margin-bottom: 0.6rem;">
						<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.2rem;">
							<span style="font-family:'Share Tech Mono',monospace; font-size: 0.68rem; color: {i === 0 ? '#fde68a' : i === 1 ? '#94a3b8' : i === 2 ? '#c2884f' : '#475569'};">
								{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {voter.username}
							</span>
							<span style="font-family:'Rajdhani',sans-serif; font-size: 0.9rem; font-weight: 700; color: #22c55e;">{voter.count}</span>
						</div>
						<div style="height: 3px; background: #1e1530; border-radius: 9999px; overflow: hidden;">
							<div style="height: 100%; width: {Math.round((voter.count / maxVotes) * 100)}%; background: linear-gradient(to right, #16a34a, #4ade80); border-radius: 9999px;"></div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<!-- Daily logins chart -->
	<div style="background: #0d0d15; border: 1px solid #1e1530; border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1rem;">
		<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
			<p style="font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin: 0;">Connexions par jour</p>
			<span style="font-family:'Share Tech Mono',monospace; font-size: 0.65rem; color: #374151;">14 derniers jours</span>
		</div>

		<!-- Bars -->
		<div style="display: flex; align-items: flex-end; gap: 3px; height: 100px; padding-bottom: 0;">
			{#each data.dailyLogins as day}
				{@const pct = Math.round((day.count / maxLogins) * 100)}
				<div
					style="flex: 1; height: {Math.max(pct, day.count > 0 ? 3 : 0)}%; min-height: {day.count > 0 ? '4px' : '2px'};
					background: {day.count > 0 ? 'linear-gradient(to top, #7c3aed, #a78bfa)' : '#1e1530'};
					border-radius: 2px 2px 0 0; transition: height 0.3s; cursor: default;"
					title="{day.count} connexion{day.count !== 1 ? 's' : ''} · {day.date}"
				></div>
			{/each}
		</div>

		<!-- X axis labels (every 2nd label to avoid overlap) -->
		<div style="display: flex; gap: 3px; margin-top: 5px;">
			{#each data.dailyLogins as day, i}
				<div style="flex: 1; text-align: center; font-family:'Share Tech Mono',monospace; font-size: 0.5rem; color: {i % 2 === 0 ? '#475569' : 'transparent'}; white-space: nowrap; overflow: hidden;">
					{day.label}
				</div>
			{/each}
		</div>
	</div>

	<!-- Console serveur Minecraft -->
	<div style="background: #0d0d15; border: 1px solid #1e1530; border-radius: 0.75rem; overflow: hidden; margin-bottom: 1rem;">

		<!-- Header -->
		<div style="padding: 1rem 1.5rem; border-bottom: 1px solid #1e1530; background: #0a0a12; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
			<div>
				<h2 style="font-family:'Rajdhani',sans-serif; font-size: 1.05rem; font-weight: 700; color: #e2e8f0; letter-spacing: 0.06em; margin: 0 0 0.15rem;">
					CONSOLE SERVEUR MINECRAFT
				</h2>
				<p style="font-family:'Share Tech Mono',monospace; font-size: 0.68rem; color: #475569; margin: 0;">
					/home/shinsei-serv · screen shinsei-mc · logs/latest.log
				</p>
			</div>

			<!-- Status + boutons -->
			<div style="display: flex; align-items: center; gap: 0.75rem;">
				<!-- Status pill -->
				<div style="display: flex; align-items: center; gap: 0.45rem; font-family:'Share Tech Mono',monospace; font-size: 0.7rem; padding: 0.3rem 0.75rem; border-radius: 9999px; background: {mcRunning ? '#052e16' : '#1c0a09'}; border: 1px solid {mcRunning ? '#16a34a40' : '#ef444430'};">
					<div style="width: 6px; height: 6px; border-radius: 50%; background: {mcRunning ? '#22c55e' : '#ef4444'}; box-shadow: 0 0 6px {mcRunning ? '#22c55e' : '#ef4444'};"></div>
					<span style="color: {mcRunning ? '#4ade80' : '#f87171'};">{mcRunning ? 'EN LIGNE' : 'HORS LIGNE'}</span>
				</div>

				<!-- Stop -->
				<button
					onclick={() => { if (mcRunning && !mcLoading) openStopModal(); }}
					disabled={!mcRunning || mcLoading}
					style="
						display: flex; align-items: center; gap: 0.4rem;
						font-family:'Rajdhani',sans-serif; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em;
						padding: 0.4rem 1rem; border-radius: 0.4rem; cursor: {!mcRunning || mcLoading ? 'not-allowed' : 'pointer'};
						background: {!mcRunning || mcLoading ? '#1c1c1c' : '#450a0a'};
						border: 1px solid {!mcRunning || mcLoading ? '#374151' : '#ef444450'};
						color: {!mcRunning || mcLoading ? '#4b5563' : '#f87171'};
						transition: all 0.2s;
					"
					onmouseenter={(e) => { if (mcRunning && !mcLoading) (e.currentTarget as HTMLElement).style.background = '#7f1d1d'; }}
					onmouseleave={(e) => { if (mcRunning && !mcLoading) (e.currentTarget as HTMLElement).style.background = '#450a0a'; }}
				>
					<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
					STOP
				</button>

				<!-- Start -->
				<button
					onclick={() => serverAction('start')}
					disabled={mcRunning || mcLoading}
					style="
						display: flex; align-items: center; gap: 0.4rem;
						font-family:'Rajdhani',sans-serif; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em;
						padding: 0.4rem 1rem; border-radius: 0.4rem; cursor: {mcRunning || mcLoading ? 'not-allowed' : 'pointer'};
						background: {mcRunning || mcLoading ? '#1c1c1c' : '#052e16'};
						border: 1px solid {mcRunning || mcLoading ? '#374151' : '#16a34a50'};
						color: {mcRunning || mcLoading ? '#4b5563' : '#4ade80'};
						transition: all 0.2s;
					"
					onmouseenter={(e) => { if (!mcRunning && !mcLoading) (e.currentTarget as HTMLElement).style.background = '#14532d'; }}
					onmouseleave={(e) => { if (!mcRunning && !mcLoading) (e.currentTarget as HTMLElement).style.background = '#052e16'; }}
				>
					<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
					START
				</button>
			</div>
		</div>

		<!-- Message retour action -->
		{#if mcStatus}
			<div style="padding: 0.5rem 1.5rem; background: #0d0d15; border-bottom: 1px solid #1e1530; font-family:'Share Tech Mono',monospace; font-size: 0.72rem; color: #06b6d4;">
				→ {mcStatus}
			</div>
		{/if}

		<!-- Console logs -->
		<div
			bind:this={consoleEl}
			style="
				height: 420px; overflow-y: auto; padding: 0.75rem 1rem;
				background: #020204; font-family: 'Share Tech Mono', monospace; font-size: 0.7rem;
				line-height: 1.5;
				scrollbar-width: thin; scrollbar-color: #1e1530 transparent;
			"
		>
			{#if mcLogs.length === 0}
				<span style="color: #374151;">Chargement des logs...</span>
			{:else}
				{#each mcLogs as line}
					<div style="color: {logColor(line)}; white-space: pre-wrap; word-break: break-all;">{line}</div>
				{/each}
			{/if}
		</div>

		<!-- Command input -->
		<div style="padding: 0.5rem 0.75rem; background: #07070f; border-top: 1px solid #1e1530; display: flex; align-items: center; gap: 0.5rem;">
			<span style="font-family:'Share Tech Mono',monospace; font-size: 0.8rem; color: #4ade80; flex-shrink: 0; user-select: none;">›</span>
			<input
				type="text"
				bind:value={cmdInput}
				placeholder={mcRunning ? 'say Bonjour, tp @a ~ ~ ~, ...' : 'Serveur hors ligne'}
				disabled={!mcRunning || cmdLoading}
				onkeydown={(e) => { if (e.key === 'Enter') sendCmd(); }}
				style="
					flex: 1; background: transparent; border: none; outline: none;
					font-family:'Share Tech Mono',monospace; font-size: 0.78rem;
					color: {mcRunning ? '#e2e8f0' : '#374151'};
					caret-color: #4ade80;
				"
			/>
			{#if cmdStatus}
				<span style="font-family:'Share Tech Mono',monospace; font-size: 0.68rem; color: #06b6d4; flex-shrink: 0; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title={cmdStatus}>{cmdStatus}</span>
			{/if}
			<button
				onclick={sendCmd}
				disabled={!mcRunning || cmdLoading || !cmdInput.trim()}
				style="
					font-family:'Rajdhani',sans-serif; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em;
					padding: 0.25rem 0.75rem; border-radius: 0.35rem; flex-shrink: 0;
					background: {mcRunning && cmdInput.trim() && !cmdLoading ? '#052e16' : '#0d0d15'};
					border: 1px solid {mcRunning && cmdInput.trim() && !cmdLoading ? '#16a34a50' : '#1e1530'};
					color: {mcRunning && cmdInput.trim() && !cmdLoading ? '#4ade80' : '#374151'};
					cursor: {mcRunning && cmdInput.trim() && !cmdLoading ? 'pointer' : 'not-allowed'};
					transition: all 0.15s;
				"
			>{cmdLoading ? '...' : 'ENVOYER'}</button>
		</div>

		<!-- Footer -->
		<div style="padding: 0.4rem 1rem; background: #0a0a12; border-top: 1px solid #1e153060; display: flex; align-items: center; justify-content: space-between;">
			<span style="font-family:'Share Tech Mono',monospace; font-size: 0.62rem; color: #374151;">
				Streaming temps réel · {mcLogs.length} lignes
			</span>
			<button
				onclick={() => fetchStatus()}
				style="font-family:'Share Tech Mono',monospace; font-size: 0.62rem; color: #475569; background: none; border: none; cursor: pointer; padding: 0.2rem 0.5rem;"
				onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.color = '#7c3aed'; }}
				onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.color = '#475569'; }}
			>↺ Rafraîchir</button>
		</div>
	</div>

	<p style="font-family:'Share Tech Mono',monospace; font-size: 0.6rem; color: #1f2937; text-align: center; margin-top: 1.5rem;">
		/admin · accès restreint
	</p>
</div>

<!-- Modal STOP -->
{#if showStopModal}
<div
	style="position: fixed; inset: 0; z-index: 500; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.72); backdrop-filter: blur(4px);"
	onclick={(e) => { if (e.target === e.currentTarget) showStopModal = false; }}
	role="dialog" aria-modal="true" aria-label="Arrêt du serveur"
>
	<div style="background: #0d0d15; border: 1px solid rgba(239,68,68,0.35); border-radius: 1rem; padding: 2rem; max-width: 440px; width: 90%; box-shadow: 0 0 60px rgba(239,68,68,0.18), 0 0 0 1px rgba(239,68,68,0.08);">

		<!-- Title -->
		<div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2">
				<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
				<line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
			</svg>
			<div>
				<h3 style="font-family:'Rajdhani',sans-serif; font-size: 1.2rem; font-weight: 900; color: #f87171; margin: 0 0 0.1rem; letter-spacing: 0.05em;">
					ARRÊT DU SERVEUR
				</h3>
				<p style="font-family:'Share Tech Mono',monospace; font-size: 0.65rem; color: #64748b; margin: 0;">
					Le bandeau maintenance sera activé automatiquement
				</p>
			</div>
		</div>

		<!-- Toggle bandeau -->
		<div style="display: flex; align-items: center; gap: 1rem; cursor: pointer; user-select: none; margin-bottom: 1.25rem;"
			role="none" onclick={() => stopEnabled = !stopEnabled}>
			<div style="position: relative; width: 48px; height: 26px; flex-shrink: 0; pointer-events: none;">
				<div style="width:100%; height:100%; border-radius:9999px; background:{stopEnabled ? '#ef4444' : '#1e293b'}; border:1px solid {stopEnabled ? '#f87171' : '#334155'}; transition:all 0.25s; box-shadow:{stopEnabled ? '0 0 12px #ef444460' : 'none'};"></div>
				<div style="position:absolute; top:4px; left:{stopEnabled ? '26px' : '4px'}; width:16px; height:16px; border-radius:50%; background:white; transition:left 0.25s; box-shadow:0 1px 3px rgba(0,0,0,0.6);"></div>
			</div>
			<div>
				<div style="font-family:'Rajdhani',sans-serif; font-size: 0.95rem; font-weight: 700; color: #e2e8f0;">
					{stopEnabled ? 'Bandeau maintenance activé' : 'Bandeau maintenance désactivé'}
				</div>
				<div style="font-family:'Share Tech Mono',monospace; font-size: 0.65rem; color: #64748b;">
					{stopEnabled ? 'Le bandeau rouge sera affiché sur tout le site' : 'Le site restera accessible normalement'}
				</div>
			</div>
		</div>

		{#if stopEnabled}
		<!-- Fin prévue + message -->
		<div class="stop-modal-grid" style="display: grid; gap: 0.75rem; margin-bottom: 0.75rem;">
			<div>
				<p style="font-family:'Share Tech Mono',monospace; font-size: 0.68rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; margin: 0 0 0.45rem;">Fin prévue</p>
				<div style="display: flex; gap: 0.3rem; flex-wrap: wrap; margin-bottom: 0.45rem;">
					{#each [[30,'30m'],[60,'1h'],[120,'2h'],[240,'4h']] as [mins, label]}
						<button onclick={() => { const d = new Date(Date.now() + (mins as number)*60000); stopEndDate = d.toISOString().slice(0,16); }}
							style="font-family:'Share Tech Mono',monospace; font-size: 0.65rem; padding: 0.2rem 0.55rem; border-radius: 0.3rem; border: 1px solid #1e1530; background: #13131e; color: #475569; cursor: pointer; transition: all 0.15s;"
							onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor='#ef444450'; (e.currentTarget as HTMLElement).style.color='#f87171'; }}
							onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.borderColor='#1e1530'; (e.currentTarget as HTMLElement).style.color='#475569'; }}
						>{label}</button>
					{/each}
				</div>
				<input type="datetime-local" bind:value={stopEndDate}
					style="width: 100%; padding: 0.45rem 0.6rem; background: #13131e; border: 1px solid #2a1f3d; border-radius: 0.45rem; color: #e2e8f0; font-family:'Share Tech Mono',monospace; font-size: 0.75rem; outline: none; color-scheme: dark; box-sizing: border-box; transition: border-color 0.2s;"
					onfocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#ef4444'; }}
					onblur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#2a1f3d'; }}
				/>
			</div>
			<div>
				<p style="font-family:'Share Tech Mono',monospace; font-size: 0.68rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; margin: 0 0 0.45rem;">Message</p>
				<textarea bind:value={stopMessage} rows="4"
					style="width: 100%; padding: 0.45rem 0.6rem; background: #13131e; border: 1px solid #2a1f3d; border-radius: 0.45rem; color: #e2e8f0; font-family:'Share Tech Mono',monospace; font-size: 0.75rem; outline: none; resize: none; box-sizing: border-box; transition: border-color 0.2s;"
					onfocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#ef4444'; }}
					onblur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#2a1f3d'; }}
				></textarea>
			</div>
		</div>

		<!-- Preview -->
		<div style="position: relative; overflow: hidden; height: 36px; border-radius: 0.4rem; display: flex; align-items: center; margin-bottom: 1.25rem;
			background: repeating-linear-gradient(135deg, #7f1d1d 0px, #7f1d1d 14px, #9b1c1c 14px, #9b1c1c 28px);
			border: 1px solid #ef444440;">
			<div style="position: absolute; inset: 0; background: rgba(0,0,0,0.28);"></div>
			<div style="position: relative; z-index:1; display:flex; align-items:center; gap:0.5rem; padding: 0 0.75rem; width:100%; font-family:'Share Tech Mono',monospace; font-size:0.66rem; color:white; overflow:hidden;">
				<span style="font-weight:700; color:#fde68a; flex-shrink:0;">⚙ MAINTENANCE EN COURS</span>
				<span style="color:#fca5a5; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">— {stopMessage || '...'}</span>
				{#if stopEndDate}<span style="flex-shrink:0; color:#fed7aa; font-size:0.6rem;">{fmtDate(stopEndDate)}</span>{/if}
			</div>
		</div>
		{:else}
		<div style="margin-bottom: 1.25rem;"></div>
		{/if}

		<!-- Action buttons -->
		<div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
			<button
				onclick={() => showStopModal = false}
				style="font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; padding: 0.5rem 1.25rem; background: transparent; border: 1px solid #374151; border-radius: 0.5rem; color: #6b7280; cursor: pointer; transition: border-color 0.2s, color 0.2s;"
				onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#6b7280'; (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
				onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#374151'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
			>Annuler</button>
			<button
				onclick={() => { showStopModal = false; serverAction('stop', { enabled: stopEnabled, endDate: stopEndDate, message: stopMessage }); }}
				style="font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 900; padding: 0.5rem 1.5rem; background: #7f1d1d; border: 1px solid rgba(239,68,68,0.4); border-radius: 0.5rem; color: #f87171; cursor: pointer; letter-spacing: 0.08em; box-shadow: 0 0 18px rgba(239,68,68,0.25); transition: background 0.2s, box-shadow 0.2s;"
				onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.background = '#991b1b'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px rgba(239,68,68,0.45)'; }}
				onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.background = '#7f1d1d'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 18px rgba(239,68,68,0.25)'; }}
			>CONFIRMER L'ARRÊT</button>
		</div>
	</div>
</div>
{/if}

<style>
	/* Server details + Top voters: 2-col on sm+, 1-col on mobile */
	.two-col-grid {
		grid-template-columns: 1fr 1fr;
	}

	/* Stop modal inner grid: 2-col on sm+, 1-col on mobile */
	.stop-modal-grid {
		grid-template-columns: 1fr 1fr;
	}

	@media (max-width: 640px) {
		.two-col-grid {
			grid-template-columns: 1fr;
		}
		.stop-modal-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
