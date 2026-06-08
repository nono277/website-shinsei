import { json, error } from '@sveltejs/kit';
import { writeFile, unlink, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { updateSession } from '$lib/server/session';
import type { RequestHandler } from './$types';

const SKINS_DIR = join(process.cwd(), 'static', 'skins');

async function ensureDir() {
	if (!existsSync(SKINS_DIR)) await mkdir(SKINS_DIR, { recursive: true });
}

export const POST: RequestHandler = async ({ request, locals, url }) => {
	if (!locals.user) throw error(401, 'Non authentifié');

	const form = await request.formData();
	const skinFile = form.get('skin') as File | null;
	const variant  = (form.get('variant') as string) || 'classic';

	if (!skinFile || skinFile.type !== 'image/png') throw error(400, 'Fichier PNG requis');
	if (skinFile.size > 1_048_576)                  throw error(400, 'Fichier trop volumineux (max 1 MB)');

	await ensureDir();
	const filename = `${locals.user.uuid}.png`;
	const dest     = join(SKINS_DIR, filename);
	await writeFile(dest, Buffer.from(await skinFile.arrayBuffer()));

	const skinUrl = `${url.origin}/skins/${filename}`;
	updateSession(locals.user.sessionId, { skinUrl, skinVariant: variant });

	return json({ success: true, skinUrl, variant });
};

export const DELETE: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Non authentifié');

	const dest = join(SKINS_DIR, `${locals.user.uuid}.png`);
	if (existsSync(dest)) await unlink(dest).catch(() => {});

	updateSession(locals.user.sessionId, { skinUrl: undefined, skinVariant: 'classic' });
	return json({ success: true });
};
