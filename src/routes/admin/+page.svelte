<script lang="ts">
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let enabled = $state(data.maintenance.enabled);
	let endDate = $state(data.maintenance.endDate || '2026-07-09T21:00');
	let message = $state(data.maintenance.message);

	let countdown = $state('');
	$effect(() => {
		if (!endDate) { countdown = ''; return; }
		const update = () => {
			const diff = new Date(endDate).getTime() - Date.now();
			if (diff <= 0) { countdown = 'Expiré'; return; }
			const h = Math.floor(diff / 3600000);
			const m = Math.floor((diff % 3600000) / 60000);
			const s = Math.floor((diff % 60000) / 1000);
			countdown = `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
		};
		update();
		const t = setInterval(update, 1000);
		return () => clearInterval(t);
	});

	function fmtDate(iso: string) {
		if (!iso) return '';
		const d = new Date(iso);
		return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
			+ ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
	}
</script>

<svelte:head>
	<title>Panel Admin — SHINSEI</title>
</svelte:head>

<div style="min-height: 80vh; padding: 2.5rem 1.25rem; max-width: 52rem; margin: 0 auto;">

	<!-- Header -->
	<div style="margin-bottom: 2.5rem;">
		<div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.4rem;">
			<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.2">
				<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
			</svg>
			<h1 style="font-family:'Rajdhani',sans-serif; font-size: 1.8rem; font-weight: 900; color: #7c3aed; text-shadow: 0 0 24px #7c3aed60; letter-spacing: 0.05em; margin: 0;">
				PANEL ADMINISTRATEUR
			</h1>
		</div>
		<div style="display: flex; align-items: center; gap: 0.5rem; font-family:'Share Tech Mono',monospace; font-size: 0.75rem; color: #64748b;">
			<div style="width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 7px #22c55e80;"></div>
			Connecté en tant que <span style="color: #06b6d4; margin-left: 0.25rem;">{data.adminUser}</span>
		</div>
	</div>

	<!-- Maintenance card -->
	<div style="background: #0d0d15; border: 1px solid #1e1530; border-radius: 0.75rem; overflow: hidden; margin-bottom: 1.5rem;">

		<!-- Card header -->
		<div style="padding: 1rem 1.5rem; border-bottom: 1px solid #1e1530; display: flex; align-items: center; justify-content: space-between; background: #0a0a12;">
			<div>
				<h2 style="font-family:'Rajdhani',sans-serif; font-size: 1.05rem; font-weight: 700; color: #e2e8f0; letter-spacing: 0.06em; margin: 0 0 0.15rem;">
					BANDEAU MAINTENANCE
				</h2>
				<p style="font-family:'Share Tech Mono',monospace; font-size: 0.68rem; color: #475569; margin: 0;">
					Affiché en haut de toutes les pages du site
				</p>
			</div>
			<div style="display: flex; align-items: center; gap: 0.5rem; font-family:'Share Tech Mono',monospace; font-size: 0.72rem;">
				<div style="width: 8px; height: 8px; border-radius: 50%; background: {data.maintenance.enabled ? '#22c55e' : '#475569'}; box-shadow: {data.maintenance.enabled ? '0 0 8px #22c55e' : 'none'}; transition: all 0.3s;"></div>
				<span style="color: {data.maintenance.enabled ? '#22c55e' : '#475569'};">{data.maintenance.enabled ? 'ACTIF' : 'INACTIF'}</span>
			</div>
		</div>

		<!-- Form -->
		<form method="POST" action="?/save" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;">

			<!-- Toggle maintenance -->
			<label style="display: flex; align-items: center; gap: 1rem; cursor: pointer; user-select: none;">
				<div style="position: relative; width: 48px; height: 26px; flex-shrink: 0;" onclick={() => enabled = !enabled} role="none">
					<input type="checkbox" name="enabled" bind:checked={enabled} style="position:absolute; opacity:0; width:0; height:0;" />
					<div style="
						width: 100%; height: 100%; border-radius: 9999px;
						background: {enabled ? '#7c3aed' : '#1e293b'};
						border: 1px solid {enabled ? '#9f67ff' : '#334155'};
						transition: background 0.25s, border-color 0.25s;
						box-shadow: {enabled ? '0 0 12px #7c3aed60' : 'none'};
					"></div>
					<div style="
						position: absolute; top: 4px; left: {enabled ? '26px' : '4px'};
						width: 16px; height: 16px; border-radius: 50%;
						background: white; transition: left 0.25s;
						box-shadow: 0 1px 3px rgba(0,0,0,0.6);
					"></div>
				</div>
				<div>
					<div style="font-family:'Rajdhani',sans-serif; font-size: 1rem; font-weight: 700; color: #e2e8f0;">
						{enabled ? 'Maintenance activée' : 'Maintenance désactivée'}
					</div>
					<div style="font-family:'Share Tech Mono',monospace; font-size: 0.68rem; color: #64748b;">
						{enabled ? 'Le bandeau rouge est visible sur tout le site' : 'Le site est accessible normalement'}
					</div>
				</div>
			</label>

			<!-- End date -->
			<div>
				<label for="endDate" style="display: block; font-family:'Share Tech Mono',monospace; font-size: 0.72rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.5rem;">
					Date et heure de fin prévue
				</label>
				<input
					id="endDate"
					type="datetime-local"
					name="endDate"
					bind:value={endDate}
					style="
						width: 100%; padding: 0.6rem 0.75rem;
						background: #13131e; border: 1px solid #2a1f3d; border-radius: 0.5rem;
						color: #e2e8f0; font-family:'Share Tech Mono',monospace; font-size: 0.875rem;
						outline: none; transition: border-color 0.2s; box-sizing: border-box;
						color-scheme: dark;
					"
					onfocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed'; }}
					onblur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#2a1f3d'; }}
				/>
				{#if endDate}
					<div style="display: flex; align-items: center; gap: 1.5rem; margin-top: 0.45rem; font-family:'Share Tech Mono',monospace; font-size: 0.7rem; color: #64748b;">
						<span>→ {fmtDate(endDate)}</span>
						{#if countdown}
							<span style="color: {countdown === 'Expiré' ? '#ef4444' : '#06b6d4'};">
								{countdown === 'Expiré' ? '⚠ Date dépassée' : `Reste : ${countdown}`}
							</span>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Message -->
			<div>
				<label for="message" style="display: block; font-family:'Share Tech Mono',monospace; font-size: 0.72rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.5rem;">
					Message du bandeau
				</label>
				<textarea
					id="message"
					name="message"
					bind:value={message}
					rows="2"
					placeholder="Ex : Mise à jour majeure du serveur en cours..."
					style="
						width: 100%; padding: 0.6rem 0.75rem;
						background: #13131e; border: 1px solid #2a1f3d; border-radius: 0.5rem;
						color: #e2e8f0; font-family:'Share Tech Mono',monospace; font-size: 0.85rem;
						outline: none; resize: vertical; transition: border-color 0.2s;
						box-sizing: border-box;
					"
					onfocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed'; }}
					onblur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#2a1f3d'; }}
				></textarea>
				<p style="font-family:'Share Tech Mono',monospace; font-size: 0.67rem; color: #475569; margin-top: 0.35rem;">
					{message.length} caractères · Sera affiché après "MAINTENANCE EN COURS —"
				</p>
			</div>

			<!-- Actions -->
			<div style="display: flex; align-items: center; gap: 1rem; padding-top: 0.25rem;">
				<button
					type="submit"
					style="
						font-family:'Rajdhani',sans-serif; font-size: 0.875rem; font-weight: 900; letter-spacing: 0.1em;
						padding: 0.6rem 1.75rem;
						background: #7c3aed; color: white; border: 1px solid #9f67ff;
						border-radius: 0.5rem; cursor: pointer;
						box-shadow: 0 0 14px #7c3aed40;
						transition: box-shadow 0.2s, transform 0.1s;
					"
					onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px #7c3aed80'; }}
					onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 14px #7c3aed40'; }}
					onmousedown={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'; }}
					onmouseup={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
				>ENREGISTRER</button>

				{#if form?.success}
					<span style="display:flex; align-items:center; gap:0.4rem; font-family:'Share Tech Mono',monospace; font-size:0.75rem; color:#22c55e;">
						<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
						Enregistré avec succès
					</span>
				{/if}
				{#if form?.error}
					<span style="font-family:'Share Tech Mono',monospace; font-size:0.75rem; color:#ef4444;">{form.error}</span>
				{/if}
			</div>
		</form>
	</div>

	<!-- Preview -->
	<div style="background: #0d0d15; border: 1px solid #1e1530; border-radius: 0.75rem; overflow: hidden;">
		<div style="padding: 1rem 1.5rem; border-bottom: 1px solid #1e1530; background: #0a0a12;">
			<h2 style="font-family:'Rajdhani',sans-serif; font-size: 1.05rem; font-weight: 700; color: #e2e8f0; letter-spacing: 0.06em; margin: 0 0 0.15rem;">
				PRÉVISUALISATION EN DIRECT
			</h2>
			<p style="font-family:'Share Tech Mono',monospace; font-size: 0.68rem; color: #475569; margin: 0;">
				Aperçu instantané du bandeau tel qu'il apparaîtra en haut du site
			</p>
		</div>
		<div style="padding: 1.25rem; background: #07070f;">
			{#if enabled}
				<div style="
					position: relative; overflow: hidden;
					height: 48px; border-radius: 0.5rem;
					display: flex; align-items: center;
					background: repeating-linear-gradient(135deg, #7f1d1d 0px, #7f1d1d 20px, #9b1c1c 20px, #9b1c1c 40px);
					border: 1px solid #ef4444;
					box-shadow: 0 0 20px rgba(239,68,68,0.4);
				">
					<div style="position: absolute; inset: 0; background: rgba(0,0,0,0.28);"></div>
					<div style="
						position: relative; z-index: 1;
						display: flex; align-items: center; gap: 0.65rem;
						padding: 0 1rem; width: 100%;
						font-family:'Share Tech Mono',monospace; font-size: 0.75rem;
						color: white; text-shadow: 0 1px 4px rgba(0,0,0,0.9);
						overflow: hidden;
					">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fde68a" stroke-width="2.2" style="flex-shrink:0;">
							<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
						</svg>
						<span style="font-weight:700; color:#fde68a; flex-shrink:0; letter-spacing:0.08em;">MAINTENANCE EN COURS</span>
						<span style="color:#fca5a5; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
							— {message || '(message vide)'}
						</span>
						{#if endDate}
							<span style="flex-shrink:0; color:#fed7aa; white-space:nowrap; font-size:0.68rem;">
								Fin le {fmtDate(endDate)}
							</span>
							{#if countdown && countdown !== 'Expiré'}
								<span style="background:rgba(0,0,0,0.5); padding:2px 8px; border-radius:4px; color:#fde68a; font-weight:700; flex-shrink:0;">{countdown}</span>
							{/if}
						{/if}
					</div>
				</div>
			{:else}
				<div style="
					height: 48px; border-radius: 0.5rem;
					display: flex; align-items: center; justify-content: center; gap: 0.5rem;
					border: 1px dashed #1e293b;
					font-family:'Share Tech Mono',monospace; font-size: 0.72rem; color: #334155;
				">
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
					Bandeau inactif — activez la maintenance pour voir la prévisualisation
				</div>
			{/if}
		</div>
	</div>

	<!-- Hint -->
	<p style="font-family:'Share Tech Mono',monospace; font-size: 0.65rem; color: #1f2937; text-align: center; margin-top: 2rem;">
		Page accessible uniquement à l'administrateur · /admin
	</p>
</div>
