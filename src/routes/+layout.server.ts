import type { LayoutServerLoad } from './$types';
import { getMaintenanceConfig } from '$lib/server/siteConfig';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user
			? {
					uuid: locals.user.uuid,
					username: locals.user.username,
					skinUrl: locals.user.skinUrl,
					capeUrl: locals.user.capeUrl,
					skinVariant: locals.user.skinVariant,
				}
			: null,
		maintenance: getMaintenanceConfig(),
	};
};
