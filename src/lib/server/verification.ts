interface PendingVerification {
	code: string;
	uuid: string;
	username: string;
	skinUrl?: string;
	capeUrl?: string;
	skinVariant?: string;
	expiresAt: number;
	sessionId?: string;
}

const pending = new Map<string, PendingVerification>();

function randomCode(): string {
	return String(Math.floor(100000 + Math.random() * 900000));
}

export function createVerification(data: Omit<PendingVerification, 'code' | 'expiresAt' | 'sessionId'>): string {
	const code = randomCode();
	pending.set(code, { ...data, code, expiresAt: Date.now() + 600_000 });
	return code;
}

export function getVerification(code: string): PendingVerification | null {
	const v = pending.get(code);
	if (!v) return null;
	if (Date.now() > v.expiresAt) { pending.delete(code); return null; }
	return v;
}

export function completeVerification(code: string, sessionId: string): boolean {
	const v = pending.get(code);
	if (!v || Date.now() > v.expiresAt) return false;
	v.sessionId = sessionId;
	return true;
}

export function deleteVerification(code: string): void {
	pending.delete(code);
}
