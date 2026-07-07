import type { PageServerLoad } from './$types';
import { getVoteStatus } from '$lib/server/votes';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return { user: null, voteStatus: null };

	return {
		user: {
			uuid:     locals.user.uuid,
			username: locals.user.username,
		},
		voteStatus: getVoteStatus(locals.user.username),
	};
};
