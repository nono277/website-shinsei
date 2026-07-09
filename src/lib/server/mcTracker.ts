import { randomUUID } from 'node:crypto';
import { env } from '$env/dynamic/private';
import db from './db';

/**
 * Suivi des connexions au serveur Minecraft, côté site.
 *
 * Toutes les 30 s :
 *  - échantillonne le nombre de joueurs en ligne → mc_player_samples (courbe temps réel)
 *  - met à jour le pic du jour → server_daily_peaks (plus besoin d'une visite admin)
 *  - détecte les arrivées de joueurs → mc_join_events (connexions/jour + total par joueur)
 *
 * Source principale : GET /players/online du plugin (identité des joueurs).
 * Repli si le plugin ne l'expose pas encore : delta du compteur de GET /stats
 * (les connexions sont alors comptées mais anonymes, uuid = '').
 */

const BASE      = env.MC_STATS_URL ?? 'http://play.playshinsei.fr:8080';
const POLL_MS   = 30_000;
const RETENTION = 48 * 3_600_000; // échantillons temps réel conservés 48 h

const insertSample = db.prepare('INSERT OR REPLACE INTO mc_player_samples (ts, count) VALUES (?, ?)');
const pruneSamples = db.prepare('DELETE FROM mc_player_samples WHERE ts < ?');
const upsertPeak   = db.prepare(`
	INSERT INTO server_daily_peaks (date, peak) VALUES (?, ?)
	ON CONFLICT(date) DO UPDATE SET peak = MAX(peak, excluded.peak)
`);
const insertJoin   = db.prepare('INSERT INTO mc_join_events (id, uuid, username, date, ts) VALUES (?, ?, ?, ?, ?)');

type OnlinePlayer = { username: string; uuid: string };

// Baseline null = pas de photo précédente fiable (démarrage, serveur injoignable) :
// on n'enregistre pas de joins sur ce tour pour ne pas recompter les joueurs déjà en jeu.
let prevPlayers: Map<string, string> | null = null;
let prevCount: number | null = null;

async function poll(): Promise<void> {
	const now  = Date.now();
	const date = new Date(now).toISOString().slice(0, 10);

	// 1) Liste nominative des joueurs en ligne (nécessite le plugin à jour)
	let players: OnlinePlayer[] | null = null;
	try {
		const r = await fetch(`${BASE}/players/online`, { signal: AbortSignal.timeout(5000) });
		if (r.ok) {
			const raw = await r.json();
			if (Array.isArray(raw)) players = raw.filter(p => p?.uuid && p?.username);
		}
	} catch { /* endpoint absent ou serveur injoignable */ }

	// 2) Repli : compteur global de /stats
	let count: number | null = players ? players.length : null;
	if (count === null) {
		try {
			const r = await fetch(`${BASE}/stats`, { signal: AbortSignal.timeout(5000) });
			if (r.ok) count = ((await r.json()).players as number) ?? 0;
		} catch { /* serveur injoignable */ }
	}

	if (count === null) {
		// Serveur hors ligne : courbe à zéro, et on repart d'une baseline vierge.
		insertSample.run(now, 0);
		pruneSamples.run(now - RETENTION);
		prevPlayers = null;
		prevCount = null;
		return;
	}

	insertSample.run(now, count);
	pruneSamples.run(now - RETENTION);
	upsertPeak.run(date, count);

	if (players !== null) {
		const current = new Map(players.map(p => [p.uuid, p.username]));
		if (prevPlayers !== null) {
			for (const [uuid, username] of current) {
				if (!prevPlayers.has(uuid)) insertJoin.run(randomUUID(), uuid, username, date, now);
			}
		}
		prevPlayers = current;
		prevCount = count;
	} else {
		// Anonyme : le compteur monte de N → N connexions sans identité.
		if (prevCount !== null && count > prevCount) {
			for (let i = prevCount; i < count; i++) insertJoin.run(randomUUID(), '', '?', date, now);
		}
		prevCount = count;
		prevPlayers = null;
	}
}

export function startMcTracker(): void {
	const g = globalThis as { __shinseiMcTracker?: boolean };
	if (g.__shinseiMcTracker) return; // déjà démarré (HMR en dev)
	g.__shinseiMcTracker = true;

	void poll().catch(() => {});
	const timer = setInterval(() => void poll().catch(() => {}), POLL_MS);
	timer.unref?.(); // ne bloque pas l'arrêt du process
}
