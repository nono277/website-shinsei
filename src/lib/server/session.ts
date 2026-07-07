import db from './db';

interface SessionData {
	minecraftToken: string;
	uuid: string;
	username: string;
	skinUrl?: string;
	capeUrl?: string;
	skinVariant?: string;
	expiresAt: number;
}

export interface PartialAuth {
	gamertag: string;
	expiresAt: number;
}

// Partial auths restent en mémoire (courte durée, 15min)
const partialAuths = new Map<string, PartialAuth>();

const stmtGetSession    = db.prepare<[string], { minecraft_token: string; uuid: string; username: string; skin_url: string | null; cape_url: string | null; skin_variant: string | null; expires_at: number }>('SELECT * FROM sessions WHERE id = ?');
const stmtInsertSession = db.prepare<[string, string, string, string, string | null, string | null, string | null, number]>('INSERT OR REPLACE INTO sessions (id, minecraft_token, uuid, username, skin_url, cape_url, skin_variant, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
const stmtUpdateSession = db.prepare<[string | null, string | null, string | null, string]>('UPDATE sessions SET skin_url = ?, cape_url = ?, skin_variant = ? WHERE id = ?');
const stmtDeleteSession = db.prepare<[string]>('DELETE FROM sessions WHERE id = ?');
const stmtPurge         = db.prepare<[number]>('DELETE FROM sessions WHERE expires_at < ?');

// Purge des sessions expirées au démarrage
stmtPurge.run(Date.now());

export function createPartialAuth(gamertag: string): string {
	const id = crypto.randomUUID();
	partialAuths.set(id, { gamertag, expiresAt: Date.now() + 15 * 60 * 1000 });
	return id;
}

export function getPartialAuth(id: string): PartialAuth | null {
	const p = partialAuths.get(id);
	if (!p) return null;
	if (Date.now() > p.expiresAt) { partialAuths.delete(id); return null; }
	return p;
}

export function deletePartialAuth(id: string): void {
	partialAuths.delete(id);
}

export function createSession(data: Omit<SessionData, 'expiresAt'>): string {
	const id = crypto.randomUUID();
	const expiresAt = Date.now() + 30 * 86_400_000; // 30 jours
	stmtInsertSession.run(id, data.minecraftToken, data.uuid, data.username, data.skinUrl ?? null, data.capeUrl ?? null, data.skinVariant ?? null, expiresAt);
	return id;
}

export function getSession(id: string): SessionData | null {
	const row = stmtGetSession.get(id);
	if (!row) return null;
	if (Date.now() > row.expires_at) { stmtDeleteSession.run(id); return null; }
	return {
		minecraftToken: row.minecraft_token,
		uuid:           row.uuid,
		username:       row.username,
		skinUrl:        row.skin_url  ?? undefined,
		capeUrl:        row.cape_url  ?? undefined,
		skinVariant:    row.skin_variant ?? undefined,
		expiresAt:      row.expires_at,
	};
}

export function updateSession(id: string, patch: Partial<SessionData>): void {
	const row = stmtGetSession.get(id);
	if (!row) return;
	stmtUpdateSession.run(
		patch.skinUrl     !== undefined ? patch.skinUrl     : row.skin_url,
		patch.capeUrl     !== undefined ? patch.capeUrl     : row.cape_url,
		patch.skinVariant !== undefined ? patch.skinVariant : row.skin_variant,
		id,
	);
}

export function deleteSession(id: string): void {
	stmtDeleteSession.run(id);
}
