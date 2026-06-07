import { json, error } from '@sveltejs/kit';
import { createVerification } from '$lib/server/verification';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { username } = await request.json();

	if (!username || typeof username !== 'string') throw error(400, 'Pseudo requis');

	const clean = username.trim();
	if (!/^[a-zA-Z0-9_]{3,16}$/.test(clean)) {
		throw error(400, 'Pseudo invalide (3-16 caractères, lettres/chiffres/_)');
	}

	// Résoudre le pseudo en UUID via Mojang
	const uuidRes = await fetch(
		`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(clean)}`
	);
	if (uuidRes.status === 404) throw error(404, 'Joueur introuvable — vérifie ton pseudo Minecraft Java Edition');
	if (!uuidRes.ok) throw error(502, 'API Mojang indisponible, réessaie dans quelques secondes');

	const { id: uuid, name: realName } = await uuidRes.json();

	// Récupérer skin/cape
	let skinUrl: string | undefined;
	let capeUrl: string | undefined;
	let skinVariant = 'classic';

	const profileRes = await fetch(
		`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}?unsigned=false`
	);
	if (profileRes.ok) {
		const profile = await profileRes.json();
		const texturesProp = profile.properties?.find((p: { name: string }) => p.name === 'textures');
		if (texturesProp) {
			try {
				const decoded = JSON.parse(atob(texturesProp.value));
				skinUrl = decoded.textures?.SKIN?.url;
				capeUrl = decoded.textures?.CAPE?.url;
				if (decoded.textures?.SKIN?.metadata?.model === 'slim') skinVariant = 'slim';
			} catch { /* pas de textures custom */ }
		}
	}

	// Créer une vérification en attente
	const code = createVerification({ uuid, username: realName, skinUrl, capeUrl, skinVariant });

	return json({ code, username: realName, uuid });
};
