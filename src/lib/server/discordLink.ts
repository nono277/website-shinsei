import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';
import db from './db';

export interface DiscordLink {
	discordId: string;
	minecraftUuid: string;
	minecraftUsername: string;
	linkedAt: number;
}

function requireToken(): string {
	const token = env.DISCORD_VERIFY_TOKEN;
	if (!token) throw new Error('DISCORD_VERIFY_TOKEN manquant dans .env');
	return token;
}

/** Vérifie qu'un lien de vérification a bien été signé par le bot Discord. */
export function verifyDiscordSignature(discordId: string, signature: string): boolean {
	const expected = createHmac('sha256', requireToken()).update(discordId).digest('hex');
	const a = Buffer.from(expected);
	const b = Buffer.from(signature);
	return a.length === b.length && timingSafeEqual(a, b);
}

/** Vérifie le token porteur envoyé par le bot pour interroger l'état d'une liaison. */
export function verifyBearerToken(authorization: string | null): boolean {
	if (!authorization?.startsWith('Bearer ')) return false;
	const token = authorization.slice('Bearer '.length);
	const expected = requireToken();
	const a = Buffer.from(token);
	const b = Buffer.from(expected);
	return a.length === b.length && timingSafeEqual(a, b);
}

export function linkDiscordAccount(discordId: string, minecraftUuid: string, minecraftUsername: string): void {
	db.prepare(
		`INSERT INTO discord_links (discord_id, minecraft_uuid, minecraft_username, linked_at)
		 VALUES (?, ?, ?, ?)
		 ON CONFLICT(discord_id) DO UPDATE SET minecraft_uuid = excluded.minecraft_uuid,
		   minecraft_username = excluded.minecraft_username, linked_at = excluded.linked_at`,
	).run(discordId, minecraftUuid, minecraftUsername, Date.now());
}

export function getDiscordLink(discordId: string): DiscordLink | null {
	const row = db
		.prepare('SELECT discord_id, minecraft_uuid, minecraft_username, linked_at FROM discord_links WHERE discord_id = ?')
		.get(discordId) as
		| { discord_id: string; minecraft_uuid: string; minecraft_username: string; linked_at: number }
		| undefined;
	if (!row) return null;
	return {
		discordId: row.discord_id,
		minecraftUuid: row.minecraft_uuid,
		minecraftUsername: row.minecraft_username,
		linkedAt: row.linked_at,
	};
}
