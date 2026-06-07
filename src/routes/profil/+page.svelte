<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let user = $derived(data.user!);
	let uuidShort = $derived(user.uuid.slice(0, 8) + '…' + user.uuid.slice(-4));

	// Skin render (bust cache après upload avec timestamp)
	let skinCacheBust = $state(Date.now());
	let skinRenderUrl = $derived(
		`https://crafatar.com/renders/body/${user.uuid}?scale=6&overlay&v=${skinCacheBust}`
	);
	let avatarUrl = $derived(
		`https://crafatar.com/avatars/${user.uuid}?size=96&overlay&v=${skinCacheBust}`
	);

	// Skin change state
	let skinFile = $state<File | null>(null);
	let skinPreview = $state<string | null>(null);
	let skinVariant = $state<'classic' | 'slim'>(
		(user.skinVariant as 'classic' | 'slim') ?? 'classic'
	);
	let uploading = $state(false);
	let resetting = $state(false);
	let feedback = $state<{ type: 'success' | 'error'; msg: string } | null>(null);
	let fileInput: HTMLInputElement;

	function onFileChange(e: Event) {
		const f = (e.currentTarget as HTMLInputElement).files?.[0] ?? null;
		if (!f) return;
		skinFile = f;
		skinPreview = URL.createObjectURL(f);
	}

	function clearFeedback() {
		setTimeout(() => (feedback = null), 4000);
	}

	async function uploadSkin() {
		if (!skinFile || uploading) return;
		uploading = true;
		feedback = null;
		try {
			const form = new FormData();
			form.append('skin', skinFile);
			form.append('variant', skinVariant);
			const res = await fetch('/api/profile/skin', { method: 'POST', body: form });
			if (!res.ok) throw new Error((await res.json()).message ?? 'Erreur');
			feedback = { type: 'success', msg: 'Skin mis à jour avec succès !' };
			skinFile = null;
			skinPreview = null;
			skinCacheBust = Date.now();
		} catch (e: unknown) {
			feedback = { type: 'error', msg: e instanceof Error ? e.message : 'Erreur inconnue' };
		} finally {
			uploading = false;
			clearFeedback();
		}
	}

	async function resetSkin() {
		if (resetting) return;
		resetting = true;
		feedback = null;
		try {
			const res = await fetch('/api/profile/skin', { method: 'DELETE' });
			if (!res.ok) throw new Error('Erreur lors de la réinitialisation');
			feedback = { type: 'success', msg: 'Skin réinitialisé au défaut.' };
			skinCacheBust = Date.now();
		} catch (e: unknown) {
			feedback = { type: 'error', msg: e instanceof Error ? e.message : 'Erreur inconnue' };
		} finally {
			resetting = false;
			clearFeedback();
		}
	}

	// Placeholder stats
	const stats = [
		{ label: 'Heures jouées', value: '—', icon: '⏱' },
		{ label: 'Donjons complétés', value: '—', icon: '⚔' },
		{ label: 'Failles fermées', value: '—', icon: '🌀' },
		{ label: 'Rang actuel', value: '—', icon: '✦' },
	];
</script>

<svelte:head>
	<title>{user.username} — SHINSEI 新世</title>
</svelte:head>

<div style="min-height: 100vh; padding: 2rem 1.5rem 4rem; max-width: 72rem; margin: 0 auto;">

	<!-- Header -->
	<div in:fade={{ duration: 300 }}>
		<div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem;">
			<span style="font-family:'Share Tech Mono',monospace; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.15em; text-transform: uppercase;">PORTAIL</span>
			<span style="color: #1e1530;">›</span>
			<span style="font-family:'Share Tech Mono',monospace; font-size: 0.7rem; font-weight: 700; color: #7c3aed; letter-spacing: 0.15em; text-transform: uppercase;">PROFIL</span>
		</div>
	</div>

	<!-- Identity card -->
	<div
		in:fly={{ y: 20, duration: 400, delay: 80 }}
		style="
			background: #0d0d15; border: 1px solid #1e1530; border-radius: 1.25rem;
			padding: 2rem; margin-bottom: 1.5rem;
			box-shadow: 0 0 60px #7c3aed10;
			display: grid; gap: 2rem;
		"
		class="lg:grid-cols-profile"
	>
		<!-- Skin render column -->
		<div style="display: flex; flex-direction: column; align-items: center; gap: 1rem; min-width: 140px;">
			<div style="
				position: relative; width: 140px; height: 200px;
				background: #13131e; border: 1px solid #1e1530; border-radius: 1rem;
				display: flex; align-items: center; justify-content: center; overflow: hidden;
			">
				<div style="
					position: absolute; inset: 0;
					background: radial-gradient(ellipse at 50% 100%, #7c3aed15, transparent 60%);
					pointer-events: none;
				"></div>
				<img
					src={skinRenderUrl}
					alt="Skin de {user.username}"
					style="height: 190px; image-rendering: pixelated; position: relative; z-index: 1;"
					onerror={(e) => { (e.currentTarget as HTMLImageElement).src = `https://crafatar.com/renders/body/8667ba71b85a4004af54457a9734eed7?scale=6&overlay`; }}
				/>
			</div>
			<span style="
				font-family:'Share Tech Mono',monospace; font-size: 0.65rem; color: #475569;
				letter-spacing: 0.08em; text-transform: uppercase;
			">SKIN ACTUEL</span>
		</div>

		<!-- Info column -->
		<div style="flex: 1; display: flex; flex-direction: column; gap: 1.25rem; justify-content: center;">
			<!-- Username + avatar -->
			<div style="display: flex; align-items: center; gap: 1rem;">
				<div style="
					width: 56px; height: 56px; border-radius: 0.5rem; overflow: hidden;
					border: 2px solid #7c3aed40; flex-shrink: 0;
					background: #13131e;
				">
					<img
						src={avatarUrl}
						alt={user.username}
						style="width: 100%; height: 100%; image-rendering: pixelated;"
						onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
					/>
				</div>
				<div>
					<h1 style="font-family:'Rajdhani',sans-serif; font-size: 1.75rem; font-weight: 900; color: white; letter-spacing: 0.04em; line-height: 1.1;">
						{user.username}
					</h1>
					<p style="font-family:'Share Tech Mono',monospace; font-size: 0.7rem; color: #475569; letter-spacing: 0.05em; margin-top: 0.2rem;">
						UUID · {uuidShort}
					</p>
				</div>
			</div>

			<!-- Badges -->
			<div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
				<span style="
					font-family:'Rajdhani',sans-serif; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em;
					padding: 0.3rem 0.75rem; border-radius: 9999px;
					background: #7c3aed20; border: 1px solid #7c3aed50; color: #a78bfa;
				">ÉVEILLÉ</span>
				<span style="
					font-family:'Rajdhani',sans-serif; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em;
					padding: 0.3rem 0.75rem; border-radius: 9999px;
					background: #06b6d415; border: 1px solid #06b6d430; color: #67e8f9;
				">JAVA EDITION</span>
				<span style="
					font-family:'Rajdhani',sans-serif; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em;
					padding: 0.3rem 0.75rem; border-radius: 9999px;
					background: #22c55e15; border: 1px solid #22c55e30; color: #86efac;
				">CONNECTÉ</span>
			</div>

			<!-- Separator -->
			<div style="height: 1px; background: #1e1530;"></div>

			<!-- Stats grid -->
			<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;" class="sm:grid-cols-4">
				{#each stats as stat}
					<div style="
						background: #13131e; border: 1px solid #1e1530; border-radius: 0.75rem;
						padding: 0.85rem 1rem;
					">
						<p style="font-size: 0.75rem; color: #475569; margin-bottom: 0.3rem;">{stat.icon} {stat.label}</p>
						<p style="font-family:'Rajdhani',sans-serif; font-size: 1.1rem; font-weight: 700; color: #94a3b8;">{stat.value}</p>
					</div>
				{/each}
			</div>

			<!-- Disconnect -->
			<div>
				<form method="POST" action="/api/auth/logout" style="margin: 0;">
					<button
						type="submit"
						style="
							font-family:'Rajdhani',sans-serif; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em;
							padding: 0.5rem 1.25rem; border-radius: 0.5rem;
							background: transparent; border: 1px solid #374151; color: #6b7280;
							cursor: pointer; transition: all 0.18s;
						"
						onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#ef4444'; (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
						onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#374151'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
					>
						SE DÉCONNECTER
					</button>
				</form>
			</div>
		</div>
	</div>

	<!-- Skin management -->
	<div
		in:fly={{ y: 20, duration: 400, delay: 160 }}
		style="
			background: #0d0d15; border: 1px solid #1e1530; border-radius: 1.25rem;
			padding: 2rem; box-shadow: 0 0 60px #06b6d408;
		"
	>
		<div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2">
				<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
			</svg>
			<h2 style="font-family:'Rajdhani',sans-serif; font-size: 1.25rem; font-weight: 900; color: white; letter-spacing: 0.04em;">
				GESTION DU SKIN
			</h2>
		</div>

		<!-- Feedback -->
		{#if feedback}
			<div
				in:fade={{ duration: 200 }}
				out:fade={{ duration: 200 }}
				style="
					margin-bottom: 1.25rem; padding: 0.85rem 1rem; border-radius: 0.75rem;
					background: {feedback.type === 'success' ? '#22c55e12' : '#ef444412'};
					border: 1px solid {feedback.type === 'success' ? '#22c55e30' : '#ef444430'};
					color: {feedback.type === 'success' ? '#86efac' : '#f87171'};
					font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;
				"
			>
				{#if feedback.type === 'success'}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
				{:else}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
				{/if}
				{feedback.msg}
			</div>
		{/if}

		<div style="display: grid; gap: 1.5rem;" class="md:grid-cols-skin">

			<!-- Preview -->
			<div style="display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
				<div style="
					width: 120px; height: 120px; border-radius: 0.75rem;
					background: #13131e; border: 2px dashed {skinPreview ? '#7c3aed60' : '#1e1530'};
					display: flex; align-items: center; justify-content: center; overflow: hidden;
					transition: border-color 0.2s;
				">
					{#if skinPreview}
						<img src={skinPreview} alt="Aperçu" style="width: 100%; height: 100%; image-rendering: pixelated;" />
					{:else}
						<div style="text-align: center; padding: 1rem;">
							<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="1.5" style="margin: 0 auto 0.5rem;">
								<rect x="3" y="3" width="18" height="18" rx="2"/>
								<path d="M3 9h18M9 21V9"/>
							</svg>
							<p style="font-size: 0.65rem; color: #374151; line-height: 1.4;">Aperçu<br/>du skin</p>
						</div>
					{/if}
				</div>
				<p style="font-family:'Share Tech Mono',monospace; font-size: 0.65rem; color: #475569; text-align: center; text-transform: uppercase; letter-spacing: 0.08em;">
					{skinPreview ? 'Nouveau skin' : 'Skin actuel'}
				</p>
			</div>

			<!-- Controls -->
			<div style="flex: 1; display: flex; flex-direction: column; gap: 1.25rem;">

				<!-- Variant selector -->
				<div>
					<p style="font-family:'Share Tech Mono',monospace; font-size: 0.7rem; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.6rem;">
						VARIANTE DU MODÈLE
					</p>
					<div style="display: flex; gap: 0.5rem;">
						{#each (['classic', 'slim'] as const) as v}
							<button
								onclick={() => skinVariant = v}
								style="
									flex: 1; padding: 0.6rem; border-radius: 0.5rem; cursor: pointer;
									font-family:'Rajdhani',sans-serif; font-size: 0.875rem; font-weight: 700; letter-spacing: 0.06em;
									background: {skinVariant === v ? '#7c3aed25' : '#13131e'};
									border: 1px solid {skinVariant === v ? '#7c3aed60' : '#1e1530'};
									color: {skinVariant === v ? '#a78bfa' : '#64748b'};
									transition: all 0.18s;
								"
							>
								{v === 'classic' ? 'CLASSIQUE' : 'ÉLANCÉ (SLIM)'}
							</button>
						{/each}
					</div>
					<p style="font-size: 0.72rem; color: #475569; margin-top: 0.4rem;">
						{skinVariant === 'classic' ? 'Bras larges (Steve) — modèle par défaut' : 'Bras fins (Alex) — modèle mince'}
					</p>
				</div>

				<!-- File picker -->
				<div>
					<p style="font-family:'Share Tech Mono',monospace; font-size: 0.7rem; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.6rem;">
						FICHIER SKIN (.PNG · 64×64)
					</p>
					<input
						bind:this={fileInput}
						type="file"
						accept="image/png"
						onchange={onFileChange}
						style="display: none;"
					/>
					<button
						onclick={() => fileInput.click()}
						style="
							width: 100%; padding: 0.75rem 1rem; border-radius: 0.6rem; cursor: pointer;
							background: #13131e; border: 1px dashed #374151; color: #64748b;
							font-family:'Rajdhani',sans-serif; font-size: 0.875rem; font-weight: 700; letter-spacing: 0.05em;
							display: flex; align-items: center; justify-content: center; gap: 0.5rem;
							transition: border-color 0.18s, color 0.18s;
						"
						onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed60'; (e.currentTarget as HTMLElement).style.color = '#a78bfa'; }}
						onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#374151'; (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
						</svg>
						{skinFile ? skinFile.name : 'CHOISIR UN FICHIER…'}
					</button>
				</div>

				<!-- Action buttons -->
				<div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
					<button
						onclick={uploadSkin}
						disabled={!skinFile || uploading}
						style="
							flex: 1; padding: 0.75rem 1.25rem; border-radius: 0.6rem; cursor: {!skinFile || uploading ? 'not-allowed' : 'pointer'};
							font-family:'Rajdhani',sans-serif; font-size: 0.9rem; font-weight: 700; letter-spacing: 0.06em;
							background: {!skinFile || uploading ? '#1a1a2e' : '#7c3aed'};
							border: 1px solid {!skinFile || uploading ? '#1e1530' : '#9f67ff'};
							color: {!skinFile || uploading ? '#374151' : 'white'};
							box-shadow: {!skinFile || uploading ? 'none' : '0 0 20px #7c3aed35'};
							transition: all 0.18s; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
						"
					>
						{#if uploading}
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite;">
								<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
							</svg>
							MISE À JOUR…
						{:else}
							SAUVEGARDER LE SKIN
						{/if}
					</button>

					<button
						onclick={resetSkin}
						disabled={resetting}
						style="
							padding: 0.75rem 1rem; border-radius: 0.6rem; cursor: {resetting ? 'not-allowed' : 'pointer'};
							font-family:'Rajdhani',sans-serif; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.06em;
							background: transparent; border: 1px solid #374151; color: #6b7280;
							transition: all 0.18s; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
							white-space: nowrap;
						"
						onmouseenter={(e) => { if (!resetting) { (e.currentTarget as HTMLElement).style.borderColor = '#4b5563'; (e.currentTarget as HTMLElement).style.color = '#9ca3af'; } }}
						onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#374151'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
					>
						{resetting ? 'RÉINIT…' : 'RÉINITIALISER'}
					</button>
				</div>
			</div>
		</div>

		<!-- Info note -->
		<div style="
			margin-top: 1.5rem; padding: 0.85rem 1rem;
			background: #06b6d408; border: 1px solid #06b6d415; border-radius: 0.75rem;
			display: flex; align-items: flex-start; gap: 0.6rem;
		">
			<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" style="margin-top: 1px; flex-shrink: 0;">
				<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
			</svg>
			<p style="font-size: 0.78rem; color: #475569; line-height: 1.6;">
				Les changements de skin s'appliquent sur <strong style="color: #64748b;">tous</strong> les serveurs Minecraft. Le skin uploadé doit être en PNG de taille 64×64 ou 64×32 pixels. La propagation peut prendre quelques minutes.
			</p>
		</div>
	</div>
</div>

<style>
	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
	:global(.lg\:grid-cols-profile) {
		grid-template-columns: auto 1fr;
	}
	:global(.md\:grid-cols-skin) {
		grid-template-columns: auto 1fr;
	}
	@media (max-width: 640px) {
		:global(.lg\:grid-cols-profile),
		:global(.md\:grid-cols-skin) {
			grid-template-columns: 1fr;
		}
	}
	:global(.sm\:grid-cols-4) {
		grid-template-columns: repeat(4, 1fr);
	}
	@media (max-width: 600px) {
		:global(.sm\:grid-cols-4) {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
