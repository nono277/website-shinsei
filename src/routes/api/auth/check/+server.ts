import { json, error } from '@sveltejs/kit';
import { getVerification, deleteVerification } from '$lib/server/verification';
import type { RequestHandler } from './$types';

// Pollé par le client toutes les 2s : GET /api/auth/check?code=123456
export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	if (!code) throw error(400, 'code requis');

	const v = getVerification(code);
	if (!v) return json({ status: 'expired' });
	if (!v.sessionId) return json({ status: 'pending' });

	// Session prête — la transmettre au client via cookie
	cookies.set('shinsei_session', v.sessionId, {
		path:     '/',
		httpOnly: true,
		secure:   false,
		sameSite: 'lax',
		maxAge:   86400,
	});

	deleteVerification(code);
	return json({ status: 'ok' });
};
