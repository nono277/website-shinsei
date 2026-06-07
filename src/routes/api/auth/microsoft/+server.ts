import { redirect } from '@sveltejs/kit';
import { MICROSOFT_CLIENT_ID } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	// State anti-CSRF
	const state = crypto.randomUUID();
	cookies.set('ms_state', state, {
		path:     '/',
		httpOnly: true,
		secure:   url.protocol === 'https:',
		sameSite: 'lax',
		maxAge:   600,
	});

	const params = new URLSearchParams({
		client_id:     MICROSOFT_CLIENT_ID,
		response_type: 'code',
		redirect_uri:  `${url.origin}/api/auth/callback`,
		scope:         'XboxLive.signin offline_access',
		state,
		prompt:        'select_account',
	});

	throw redirect(302, `https://login.live.com/oauth20_authorize.srf?${params}`);
};
