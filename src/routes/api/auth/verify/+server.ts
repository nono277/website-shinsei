import { json, error } from '@sveltejs/kit';
import { getVerification, completeVerification } from '$lib/server/verification';
import { createSession } from '$lib/server/session';
import type { RequestHandler } from './$types';

// Appelé par le plugin Minecraft : POST /api/auth/verify { code, uuid }
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);
	if (!body?.code || !body?.uuid) throw error(400, 'code et uuid requis');

	const v = getVerification(body.code);
	if (!v) throw error(404, 'Code invalide ou expiré');
	if (v.uuid !== body.uuid) throw error(403, 'UUID ne correspond pas au code');
	if (v.sessionId) return json({ ok: true }); // déjà vérifié

	const sessionId = createSession({
		minecraftToken: '',
		uuid:           v.uuid,
		username:       v.username,
		skinUrl:        v.skinUrl,
		capeUrl:        v.capeUrl,
		skinVariant:    v.skinVariant,
	});

	completeVerification(body.code, sessionId);

	return json({ ok: true });
};
