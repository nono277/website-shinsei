// Clés API officielles — vérification directe sur leur API, impossible à faker.
export const MINECRAFT_MP_API_KEY = '84STfIGkEZnlwTVOBjtQQ7LDNfYvyypdoX6';
export const TOP_SERVEURS_API_KEY = 'EIN76KAEIFKAYQ';

// Vérification par IP — aucun token ni callback nécessaire.
export const SERVEURS_MC_SERVER_ID     = '63991'; // serveurs-minecraft.org
export const SERVEURS_MC_ORG_SERVER_ID = '7652';  // serveursminecraft.org

export const REWARD_SITES = ['minecraft-mp', 'top-serveurs', 'serveurs-minecraft', 'serveursminecraft'] as const;
export type RewardSiteKey = typeof REWARD_SITES[number];

export const VOTE_SITES = {
	'minecraft-mp': {
		label: 'Minecraft-MP',
		url: 'https://minecraft-mp.com/server/360433/vote/',
		cooldownMs: 24 * 60 * 60 * 1000,
		color: '#22c55e',
		period: 'Toutes les 24h',
		verifyBy: 'username' as const,
		urlParam: 'username' as const,
	},
	'top-serveurs': {
		label: 'Top-Serveurs.net',
		url: 'https://top-serveurs.net/minecraft/vote/shinsei',
		cooldownMs: 2 * 60 * 60 * 1000,
		color: '#f59e0b',
		period: 'Toutes les 2h',
		verifyBy: 'ip' as const,
	},
	'serveurs-minecraft': {
		label: 'Serveurs-Minecraft.org',
		url: 'http://www.serveurs-minecraft.org/vote.php?id=63991',
		cooldownMs: 24 * 60 * 60 * 1000,
		color: '#a855f7',
		period: 'Toutes les 24h',
		verifyBy: 'ip' as const,
	},
	'serveursminecraft': {
		label: 'ServeursMinecraft.org',
		url: 'https://www.serveursminecraft.org/serveur/7652/',
		cooldownMs: 24 * 60 * 60 * 1000,
		color: '#06b6d4',
		period: 'Toutes les 24h',
		verifyBy: 'ip' as const,
	},
} as const;

export type SiteKey = keyof typeof VOTE_SITES;

// Calibré pour ne pas déséquilibrer l'économie : l'ARGENT (seule monnaie de marché) reste modeste
// car les votes sont quotidiens et répétables. Total ×4 sites + bonus = 1200 XP / 300 $ / 20 éclats / 1 clé.
export const VOTE_REWARDS = {
	perVote:  { xp: 200, dollars: 50, eclats: 3 },
	bonusAll: { xp: 400, dollars: 100, eclats: 8, cles: 1 },
} as const;
