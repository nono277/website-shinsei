import type { LayoutServerLoad } from './$types';
import { getMaintenanceConfig } from '$lib/server/siteConfig';
import { env } from '$env/dynamic/private';

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
		isAdmin: !!(locals.user && locals.user.username === env.ADMIN_MINECRAFT_USERNAME),
		maintenance: getMaintenanceConfig(),
	};
};
