import { json } from '@sveltejs/kit';
import { getDiscordLink, verifyBearerToken } from '$lib/server/discordLink';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, url }) => {
	if (!verifyBearerToken(request.headers.get('authorization'))) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const discordId = url.searchParams.get('discordId');
	if (!discordId) return json({ error: 'discordId requis' }, { status: 400 });

	const link = getDiscordLink(discordId);
	if (!link) return json({ linked: false });

	return json({
		linked: true,
		minecraftUuid: link.minecraftUuid,
		minecraftUsername: link.minecraftUsername,
	});
};
