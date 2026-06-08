import { redirect, json } from '@sveltejs/kit';
import { getPartialAuth, deletePartialAuth, createSession } from '$lib/server/session';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies, url }) => {
	const partialId = cookies.get('partial_auth');
	if (!partialId) throw redirect(302, '/connexion?error=auth_failed');

	const partial = getPartialAuth(partialId);
	if (!partial) throw redirect(302, '/connexion?error=auth_failed');

	const body = await request.formData();
	const username = (body.get('username') as string | null)?.trim();
	if (!username || username.length < 3 || username.length > 16)
		return json({ error: 'Nom invalide.' }, { status: 400 });

	const mojangRes = await fetch(
		`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`
	);
	if (!mojangRes.ok)
		return json({ error: 'Aucune licence Minecraft Java trouvée pour ce nom.' }, { status: 404 });

	const profile: { id: string; name: string } = await mojangRes.json();

	deletePartialAuth(partialId);
	cookies.delete('partial_auth', { path: '/' });

	const sessionId = createSession({
		minecraftToken: '',
		uuid:           profile.id,
		username:       profile.name,
		skinUrl:        `https://crafatar.com/avatars/${profile.id}?overlay=true`,
		capeUrl:        undefined,
		skinVariant:    'classic',
	});

	cookies.set('shinsei_session', sessionId, {
		path:     '/',
		httpOnly: true,
		secure:   url.protocol === 'https:',
		sameSite: 'lax',
		maxAge:   86400,
	});

	throw redirect(302, '/profil');
};
