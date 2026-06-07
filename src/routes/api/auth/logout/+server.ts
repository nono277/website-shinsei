import { redirect } from '@sveltejs/kit';
import { deleteSession } from '$lib/server/session';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	const sessionId = cookies.get('shinsei_session');
	if (sessionId) {
		deleteSession(sessionId);
		cookies.delete('shinsei_session', { path: '/' });
	}
	throw redirect(302, '/');
};
