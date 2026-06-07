import { json, error } from '@sveltejs/kit';
import { updateSession } from '$lib/server/session';
import type { RequestHandler } from './$types';

const SKINS_URL = 'https://api.minecraftservices.com/minecraft/profile/skins';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Non authentifié');

	const form = await request.formData();
	const skinFile = form.get('skin') as File | null;
	const variant = (form.get('variant') as string) || 'classic';

	if (!skinFile || skinFile.type !== 'image/png') {
		throw error(400, 'Fichier PNG requis');
	}
	if (skinFile.size > 1_048_576) {
		throw error(400, 'Fichier trop volumineux (max 1 MB)');
	}

	const body = new FormData();
	body.append('variant', variant);
	body.append('file', skinFile, 'skin.png');

	const res = await fetch(SKINS_URL, {
		method: 'POST',
		headers: { Authorization: `Bearer ${locals.user.minecraftToken}` },
		body,
	});

	if (!res.ok) {
		const txt = await res.text();
		console.error('[Skin upload]', res.status, txt);
		throw error(500, 'Échec de la mise à jour du skin');
	}

	const profile = await res.json();
	const active = profile.skins?.find((s: { state: string }) => s.state === 'ACTIVE');

	updateSession(locals.user.sessionId, {
		skinUrl: active?.url,
		skinVariant: variant,
	});

	return json({ success: true, skinUrl: active?.url, variant });
};

export const DELETE: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Non authentifié');

	const res = await fetch(`${SKINS_URL}/active`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${locals.user.minecraftToken}` },
	});

	if (!res.ok && res.status !== 204) {
		throw error(500, 'Échec de la réinitialisation du skin');
	}

	updateSession(locals.user.sessionId, { skinUrl: undefined, skinVariant: 'classic' });

	return json({ success: true });
};
