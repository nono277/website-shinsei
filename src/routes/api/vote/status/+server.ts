import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getVoteStatus } from '$lib/server/votes';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) return json({ authenticated: false });
	return json({ authenticated: true, ...getVoteStatus(locals.user.username) });
};
