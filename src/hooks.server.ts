import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { getSession } from '$lib/server/session';
import { startMcTracker } from '$lib/server/mcTracker';

if (!building) startMcTracker();

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get('shinsei_session');
	if (sessionId) {
		const session = getSession(sessionId);
		if (session) {
			event.locals.user = {
				uuid: session.uuid,
				username: session.username,
				skinUrl: session.skinUrl,
				capeUrl: session.capeUrl,
				skinVariant: session.skinVariant,
				minecraftToken: session.minecraftToken,
				sessionId,
			};
		}
	}
	return resolve(event);
};
