import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getVoteStatus } from '$lib/server/votes';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, `/connexion?redirect=${encodeURIComponent(url.pathname)}`);

	return {
		user: {
			uuid:     locals.user.uuid,
			username: locals.user.username,
		},
		voteStatus: getVoteStatus(locals.user.username),
	};
};
