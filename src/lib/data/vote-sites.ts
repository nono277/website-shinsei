// Clés API officielles — vérification directe sur leur API, impossible à faker.
export const MINECRAFT_MP_API_KEY  = '84STfIGkEZnlwTVOBjtQQ7LDNfYvyypdoX6';
export const TOP_SERVEURS_API_KEY  = 'EIN76KAEIFKAYQ';

// Tokens secrets pour les sites sans API de vérification (à coller dans leur panneau admin).
// Format callback : https://playshinsei.fr/api/vote/callback/SITE?token=TOKEN
export const VOTE_TOKENS: Record<string, string> = {
	'serveur-minecraft':  '5532e453753ba076c16eebc5c0e35ab1a8e48995',
	'serveurs-minecraft': 'd9652c78c8d58b2b5cda608e074ea2a445e31a66',
};

export const VOTE_SITES = {
	'minecraft-mp': {
		label: 'Minecraft-MP',
		url: 'https://minecraft-mp.com/server/360433/vote/',
		cooldownMs: 24 * 60 * 60 * 1000,
		color: '#22c55e',
		period: 'Toutes les 24h',
	},
	'top-serveurs': {
		label: 'Top-Serveurs.net',
		url: 'https://top-serveurs.net/minecraft/vote/shinsei',
		cooldownMs: 2 * 60 * 60 * 1000,
		color: '#f59e0b',
		period: 'Toutes les 2h',
	},
	'serveur-minecraft': {
		label: 'Serveur-Minecraft.com',
		url: 'https://serveur-minecraft.com/5785',
		cooldownMs: 3 * 60 * 60 * 1000,
		color: '#06b6d4',
		period: 'Toutes les 3h',
	},
	'serveurs-minecraft': {
		label: 'Serveurs-Minecraft.org',
		url: 'http://www.serveurs-minecraft.org/vote.php?id=63991',
		cooldownMs: 24 * 60 * 60 * 1000,
		color: '#a855f7',
		period: 'Toutes les 24h',
	},
} as const;

export type SiteKey = keyof typeof VOTE_SITES;

export const VOTE_REWARDS = {
	perVote:  { xp: 500, dollars: 250, eclats: 3 },
	bonusAll: { xp: 1000, dollars: 500, eclats: 10, cles: 1 },
} as const;
