import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/connexion');

	return {
		user: {
			uuid: locals.user.uuid,
			username: locals.user.username,
			skinUrl: locals.user.skinUrl,
			capeUrl: locals.user.capeUrl,
			skinVariant: locals.user.skinVariant ?? 'classic',
		},
	};
};
