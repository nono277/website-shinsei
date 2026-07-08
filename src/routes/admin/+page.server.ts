import type { Actions, PageServerLoad } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getMaintenanceConfig, setConfig } from '$lib/server/siteConfig';

export const load: PageServerLoad = async ({ locals }) => {
	console.log('[admin] user:', locals.user?.username, '| env:', env.ADMIN_MINECRAFT_USERNAME);
	if (!locals.user || locals.user.username !== env.ADMIN_MINECRAFT_USERNAME) {
		throw redirect(302, '/');
	}
	return {
		adminUser: locals.user.username,
		maintenance: getMaintenanceConfig(),
	};
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		if (!locals.user || locals.user.username !== env.ADMIN_MINECRAFT_USERNAME) {
			return fail(403, { error: 'Accès refusé' });
		}
		const data = await request.formData();
		const enabled = data.get('enabled') === 'on';
		const endDate = (data.get('endDate') as string) ?? '';
		const message = (data.get('message') as string) ?? '';

		setConfig('maintenance_enabled', enabled ? '1' : '0');
		setConfig('maintenance_end', endDate);
		setConfig('maintenance_message', message);

		return { success: true, enabled, endDate, message };
	},
};
