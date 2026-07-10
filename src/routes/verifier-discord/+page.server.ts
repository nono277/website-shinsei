import { fail } from '@sveltejs/kit';
import { getDiscordLink, linkDiscordAccount, verifyDiscordSignature } from '$lib/server/discordLink';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const discordId = url.searchParams.get('discordId') ?? '';
	const signature = url.searchParams.get('sig') ?? '';

	const validSignature = discordId.length > 0 && signature.length > 0 && verifyDiscordSignature(discordId, signature);
	const existingLink = validSignature ? getDiscordLink(discordId) : null;

	return {
		discordId,
		signature,
		validSignature,
		alreadyLinked: existingLink?.minecraftUsername ?? null,
		user: locals.user ? { username: locals.user.username } : null,
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: "Connecte-toi d'abord avec ton compte Minecraft." });

		const form = await request.formData();
		const discordId = (form.get('discordId') as string | null) ?? '';
		const signature = (form.get('signature') as string | null) ?? '';

		if (!discordId || !signature || !verifyDiscordSignature(discordId, signature)) {
			return fail(400, { error: 'Lien de vérification invalide ou expiré.' });
		}

		linkDiscordAccount(discordId, locals.user.uuid, locals.user.username);
		return { success: true, minecraftUsername: locals.user.username };
	},
};
