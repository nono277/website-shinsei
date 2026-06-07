interface SessionData {
	minecraftToken: string;
	uuid: string;
	username: string;
	skinUrl?: string;
	capeUrl?: string;
	skinVariant?: string;
	expiresAt: number;
}

const sessions = new Map<string, SessionData>();

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
