<script lang="ts">
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import iconbar from '$lib/img/icon/iconbar.png';

	let { topOffset = 0 }: { topOffset?: number } = $props();
	let scrolled = $state(false);
	let menuOpen = $state(false);

	let currentPath = $derived(page.url.pathname);
	let user = $derived(page.data.user as { uuid: string; username: string } | null | undefined);
	let isAdmin = $derived(page.data.isAdmin as boolean | undefined);

	const links = [
		{ href: '/',            label: 'Accueil'    },
		{ href: '/classes',     label: 'Classes'    },
		{ href: '/classement',  label: 'Classement' },
		{ href: '/vote',        label: 'Vote'        },
		{ href: '/wiki',        label: 'Wiki'        },
		{ href: '/map',         label: 'Carte'      },
		{ href: '/recrutement', label: 'Recrutement' },
	];

	function isActive(href: string): boolean {
		if (href.includes('#')) return false;
		if (href === '/') return currentPath === '/';
		return currentPath.startsWith(href);
	}

	onMount(() => {
		const onScroll = () => { scrolled = window.scrollY > 20; };
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<!-- Nav principale -->
<nav style="
	position: fixed;
	top: {topOffset}px; left: 0; right: 0;
	z-index: 50;
	height: 60px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 1.5rem;
	background: {scrolled ? 'rgba(13,13,21,0.96)' : '#0d0d15'};
	border-bottom: 1px solid #1e1530;
	backdrop-filter: {scrolled ? 'blur(12px)' : 'none'};
	transition: background 0.3s, backdrop-filter 0.3s;
">
	<!-- Logo -->
	<a href="/" style="display: flex; align-items: center; gap: 0.6rem;">
		<img src={iconbar} alt="SHINSEI" style="width: 34px; height: 34px; border-radius: 50%; box-shadow: 0 0 12px #7c3aed60;" />
		<span style="font-family:'Rajdhani',sans-serif; font-size: 1.35rem; font-weight: 900; color: #7c3aed; text-shadow: 0 0 18px #7c3aed70; letter-spacing: 0.05em;">SHINSEI</span>
		<span style="font-family:'Rajdhani',sans-serif; font-size: 1rem; font-weight: 700; color: #06b6d4; text-shadow: 0 0 12px #06b6d460;">新世</span>
	</a>

	<!-- Liens desktop -->
	<div style="align-items: center; gap: 1.5rem;" class="hidden md:flex">
		{#each links as link}
			<a
				href={link.href}
				style="
					font-family:'Rajdhani',sans-serif;
					font-size: 0.875rem;
					font-weight: 700;
					letter-spacing: 0.05em;
					color: {isActive(link.href) ? '#7c3aed' : '#94a3b8'};
					border-bottom: {isActive(link.href) ? '2px solid #7c3aed' : '2px solid transparent'};
					padding-bottom: 2px;
					transition: color 0.2s, border-color 0.2s;
				"
				onmouseenter={(e) => { if (!isActive(link.href)) (e.currentTarget as HTMLElement).style.color = '#e2e8f0'; }}
				onmouseleave={(e) => { if (!isActive(link.href)) (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
			>
				{link.label}
			</a>
		{/each}
	</div>

	<!-- Auth zone desktop -->
	<div style="align-items: center; gap: 0.75rem;" class="hidden md:flex">
		{#if user}
			<!-- Logged in: avatar + profil link + logout -->
			<a
				href="/profil"
				style="
					display: flex; align-items: center; gap: 0.6rem;
					padding: 0.35rem 0.75rem 0.35rem 0.35rem;
					background: {currentPath.startsWith('/profil') ? '#7c3aed20' : '#13131e'};
					border: 1px solid {currentPath.startsWith('/profil') ? '#7c3aed50' : '#1e1530'};
					border-radius: 9999px; text-decoration: none; transition: all 0.18s;
				"
				onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed50'; (e.currentTarget as HTMLElement).style.background = '#7c3aed15'; }}
				onmouseleave={(e) => {
					if (!currentPath.startsWith('/profil')) {
						(e.currentTarget as HTMLElement).style.borderColor = '#1e1530';
						(e.currentTarget as HTMLElement).style.background = '#13131e';
					}
				}}
			>
				<div style="width: 26px; height: 26px; border-radius: 50%; overflow: hidden; border: 1px solid #7c3aed40; background: #0d0d15; flex-shrink: 0;">
					<img
						src={`https://mc-heads.net/avatar/${user.username}/32`}
						alt={user.username}
						style="width: 100%; height: 100%; image-rendering: pixelated;"
						onerror={(e) => {
							const img = e.currentTarget as HTMLImageElement;
							if (!img.dataset.tried) {
								img.dataset.tried = '1';
								img.src = `https://crafatar.com/avatars/${user.uuid}?size=32&overlay`;
							}
						}}
					/>
				</div>
				<span style="font-family:'Rajdhani',sans-serif; font-size: 0.85rem; font-weight: 700; color: #e2e8f0; letter-spacing: 0.04em;">{user.username}</span>
			</a>
			{#if isAdmin}
				<a
					href="/admin"
					title="Panel Admin"
					style="
						display: flex; align-items: center; justify-content: center;
						width: 34px; height: 34px; border-radius: 50%;
						background: {currentPath.startsWith('/admin') ? '#7c3aed20' : 'transparent'};
						border: 1px solid {currentPath.startsWith('/admin') ? '#7c3aed50' : '#1e1530'};
						color: {currentPath.startsWith('/admin') ? '#a78bfa' : '#475569'};
						transition: all 0.18s; text-decoration: none;
					"
					onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#7c3aed50'; (e.currentTarget as HTMLElement).style.color = '#a78bfa'; (e.currentTarget as HTMLElement).style.background = '#7c3aed15'; }}
					onmouseleave={(e) => {
						if (!currentPath.startsWith('/admin')) {
							(e.currentTarget as HTMLElement).style.borderColor = '#1e1530';
							(e.currentTarget as HTMLElement).style.color = '#475569';
							(e.currentTarget as HTMLElement).style.background = 'transparent';
						}
					}}
				>
					<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
						<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
					</svg>
				</a>
			{/if}
			<form method="POST" action="/api/auth/logout" style="margin: 0;">
				<button
					type="submit"
					title="Se déconnecter"
					style="
						display: flex; align-items: center; justify-content: center;
						width: 34px; height: 34px; border-radius: 50%;
						background: transparent; border: 1px solid #1e1530; color: #475569;
						cursor: pointer; transition: all 0.18s;
					"
					onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#ef444440'; (e.currentTarget as HTMLElement).style.color = '#f87171'; (e.currentTarget as HTMLElement).style.background = '#ef444410'; }}
					onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#1e1530'; (e.currentTarget as HTMLElement).style.color = '#475569'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
				>
					<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
						<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
						<polyline points="16 17 21 12 16 7"/>
						<line x1="21" y1="12" x2="9" y2="12"/>
					</svg>
				</button>
			</form>
		{:else}
			<!-- Not logged in: connexion + jouer -->
			<a href="/connexion" style="
				font-family:'Rajdhani',sans-serif; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.06em;
				padding: 0.4rem 0.9rem; color: #94a3b8; border: 1px solid #1e1530; border-radius: 0.375rem;
				text-decoration: none; transition: all 0.18s;
			"
				onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.color = '#e2e8f0'; (e.currentTarget as HTMLElement).style.borderColor = '#374151'; }}
				onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.color = '#94a3b8'; (e.currentTarget as HTMLElement).style.borderColor = '#1e1530'; }}
			>CONNEXION</a>
			<a href="/telecharger" style="
				font-family:'Rajdhani',sans-serif; font-size: 0.8rem; font-weight: 900; letter-spacing: 0.08em;
				padding: 0.4rem 1rem; background: #7c3aed; color: white;
				border-radius: 0.375rem; text-decoration: none;
				border: 1px solid #9f67ff; box-shadow: 0 0 14px #7c3aed40; transition: box-shadow 0.18s;
			"
				onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px #7c3aed70'; }}
				onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 14px #7c3aed40'; }}
			>JOUER</a>
		{/if}
	</div>

	<!-- Burger -->
	<button
		onclick={() => menuOpen = !menuOpen}
		aria-label="Menu"
		style="display: flex; align-items: center; justify-content: center; padding: 0.5rem; color: #94a3b8; background: none; border: none; cursor: pointer;"
		class="md:hidden"
	>
		<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
			{#if menuOpen}
				<path d="M18 6L6 18M6 6l12 12"/>
			{:else}
				<path d="M3 12h18M3 6h18M3 18h18"/>
			{/if}
		</svg>
	</button>
</nav>

<!-- Menu mobile -->
{#if menuOpen}
	<div
		transition:fly={{ y: -10, duration: 180 }}
		style="position: fixed; top: {60 + topOffset}px; left: 0; right: 0; z-index: 40; background: #0d0d15; border-bottom: 1px solid #1e1530;"
	>
		{#each links as link}
			<a
				href={link.href}
				onclick={() => menuOpen = false}
				style="
					display: block;
					padding: 0.85rem 1.5rem;
					font-family:'Rajdhani',sans-serif;
					font-size: 0.9rem;
					font-weight: 700;
					color: {isActive(link.href) ? '#7c3aed' : '#94a3b8'};
					border-bottom: 1px solid #1e153040;
					background: {isActive(link.href) ? '#7c3aed10' : 'transparent'};
				"
			>
				{link.label}
			</a>
		{/each}

		<div style="padding: 0.85rem 1.5rem; border-top: 1px solid #1e1530;">
			{#if user}
				<a
					href="/profil"
					onclick={() => menuOpen = false}
					style="
						display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.75rem;
						background: #7c3aed15; border: 1px solid #7c3aed30; border-radius: 0.5rem;
						text-decoration: none; margin-bottom: 0.5rem;
					"
				>
					<div style="width: 32px; height: 32px; border-radius: 0.375rem; overflow: hidden; border: 1px solid #7c3aed40; background: #0d0d15; flex-shrink: 0;">
						<img
					src={`https://mc-heads.net/avatar/${user.username}/32`}
					alt={user.username}
					style="width: 100%; height: 100%; image-rendering: pixelated;"
					onerror={(e) => {
						const img = e.currentTarget as HTMLImageElement;
						if (!img.dataset.tried) {
							img.dataset.tried = '1';
							img.src = `https://crafatar.com/avatars/${user.uuid}?size=32&overlay`;
						}
					}}
				/>
					</div>
					<div>
						<p style="font-family:'Rajdhani',sans-serif; font-size: 0.9rem; font-weight: 700; color: white;">{user.username}</p>
						<p style="font-size: 0.7rem; color: #7c3aed;">Voir mon profil →</p>
					</div>
				</a>
				{#if isAdmin}
					<a
						href="/admin"
						onclick={() => menuOpen = false}
						style="
							display: flex; align-items: center; gap: 0.5rem;
							width: 100%; font-family:'Rajdhani',sans-serif; font-size: 0.8rem; font-weight: 700;
							padding: 0.55rem 0.75rem; background: #7c3aed15; border: 1px solid #7c3aed30; color: #a78bfa;
							border-radius: 0.375rem; text-decoration: none; margin-bottom: 0.4rem;
						"
					>
						<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
							<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
						</svg>
						PANEL ADMIN
					</a>
				{/if}
				<form method="POST" action="/api/auth/logout" style="margin: 0;">
					<button type="submit" onclick={() => menuOpen = false} style="
						width: 100%; font-family:'Rajdhani',sans-serif; font-size: 0.8rem; font-weight: 700;
						padding: 0.55rem; background: transparent; border: 1px solid #374151; color: #6b7280;
						border-radius: 0.375rem; cursor: pointer;
					">DÉCONNEXION</button>
				</form>
			{:else}
				<div style="display: flex; flex-direction: column; gap: 0.5rem;">
					<a href="/connexion" onclick={() => menuOpen = false} style="
						display: flex; align-items: center; justify-content: center;
						width: 100%; font-family:'Rajdhani',sans-serif; font-size: 0.875rem; font-weight: 700; letter-spacing: 0.06em;
						padding: 0.65rem 0; background: transparent; color: #94a3b8;
						border-radius: 0.375rem; text-decoration: none;
						border: 1px solid #374151;
					">CONNEXION</a>
					<a href="/telecharger" onclick={() => menuOpen = false} style="
						display: flex; align-items: center; justify-content: center;
						width: 100%; font-family:'Rajdhani',sans-serif; font-size: 0.875rem; font-weight: 900; letter-spacing: 0.08em;
						padding: 0.65rem 0; background: #7c3aed; color: white;
						border-radius: 0.375rem; text-decoration: none;
						border: 1px solid #9f67ff; box-shadow: 0 0 14px #7c3aed40;
					">JOUER</a>
					<a href="https://discord.gg/YtsrPnwz5T" target="_blank" rel="noopener noreferrer" onclick={() => menuOpen = false} style="
						display: flex; align-items: center; justify-content: center; gap: 0.6rem;
						width: 100%; font-family:'Rajdhani',sans-serif; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.06em;
						padding: 0.55rem 0; background: #5865f210; color: #a5b4fc;
						border-radius: 0.375rem; text-decoration: none;
						border: 1px solid #5865f230;
					">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="#a5b4fc"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
						DISCORD
					</a>
				</div>
			{/if}
		</div>
	</div>
{/if}
