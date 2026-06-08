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

const sessions     = new Map<string, SessionData>();
const partialAuths = new Map<string, PartialAuth>();

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
	sessions.set(id, { ...data, expiresAt: Date.now() + 86_400_000 });
	return id;
}

export function getSession(id: string): SessionData | null {
	const s = sessions.get(id);
	if (!s) return null;
	if (Date.now() > s.expiresAt) {
		sessions.delete(id);
		return null;
	}
	return s;
}

export function updateSession(id: string, patch: Partial<SessionData>): void {
	const s = sessions.get(id);
	if (s) sessions.set(id, { ...s, ...patch });
}

export function deleteSession(id: string): void {
	sessions.delete(id);
}
