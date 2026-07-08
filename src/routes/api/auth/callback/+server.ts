import { redirect } from '@sveltejs/kit';
import { MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET } from '$env/static/private';
import { createSession, createPartialAuth } from '$lib/server/session';
import { recordLogin } from '$lib/server/siteConfig';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code        = url.searchParams.get('code');
	const state       = url.searchParams.get('state');
	const errorParam  = url.searchParams.get('error');
	const savedState  = cookies.get('ms_state');

	console.log('[Callback] params:', Object.fromEntries(url.searchParams));
	console.log('[Callback] savedState:', savedState, '| received state:', state);

	if (errorParam === 'access_denied') throw redirect(302, '/connexion?error=access_denied');
	if (!code) throw redirect(302, '/connexion?error=no_code');
	if (!savedState || state !== savedState) throw redirect(302, '/connexion?error=state_mismatch');

	cookies.delete('ms_state', { path: '/' });

	const redirectUri = `${url.origin}/api/auth/callback`;

	try {
		// 1. Exchange code for Microsoft access token via live.com
		const tokenRes = await fetch('https://login.microsoftonline.com/consumers/oauth2/v2.0/token', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id:     MICROSOFT_CLIENT_ID,
				client_secret: MICROSOFT_CLIENT_SECRET,
				grant_type:    'authorization_code',
				code,
				redirect_uri:  redirectUri,
			}),
		});
		const tokenData = await tokenRes.json();
		if (!tokenRes.ok) throw new Error(`MS token: ${JSON.stringify(tokenData)}`);
		const msAccessToken: string = tokenData.access_token;

		// 2. Xbox Live authentication
		const xblRes = await fetch('https://user.auth.xboxlive.com/user/authenticate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
			body: JSON.stringify({
				Properties: {
					AuthMethod: 'RPS',
					SiteName:   'user.auth.xboxlive.com',
					RpsTicket:  `d=${msAccessToken}`,
				},
				RelyingParty: 'http://auth.xboxlive.com',
				TokenType:    'JWT',
			}),
		});
		const xblData = await xblRes.json();
		if (!xblRes.ok) throw new Error(`XBL failed: ${JSON.stringify(xblData)}`);
		const xblToken: string = xblData.Token;
		const userHash: string = xblData.DisplayClaims.xui[0].uhs;

		// 3. XSTS token (pour Xbox API)
		const xstsRes = await fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
			body: JSON.stringify({
				Properties:   { SandboxId: 'RETAIL', UserTokens: [xblToken] },
				RelyingParty: 'http://xboxlive.com',
				TokenType:    'JWT',
			}),
		});
		const xstsData = await xstsRes.json();
		if (!xstsRes.ok) {
			if (xstsData.XErr === 2148916238) throw redirect(302, '/connexion?error=no_xbox');
			if (xstsData.XErr === 2148916233) throw redirect(302, '/connexion?error=xbox_banned');
			throw new Error(`XSTS failed: ${JSON.stringify(xstsData)}`);
		}
		const xstsToken: string = xstsData.Token;

		// 4. Récupérer le gamertag Xbox
		const xboxProfileRes = await fetch(
			'https://profile.xboxlive.com/users/me/profile/settings?settings=Gamertag,UniqueModernGamertag',
			{
				headers: {
					Authorization:            `XBL3.0 x=${userHash};${xstsToken}`,
					'x-xbl-contract-version': '2',
					Accept:                   'application/json',
					'Accept-Language':        'en-US',
				},
			}
		);
		if (!xboxProfileRes.ok) throw new Error(`Xbox profile failed: ${xboxProfileRes.status}`);
		const xboxProfileData = await xboxProfileRes.json();
		const settings: { id: string; value: string }[] =
			xboxProfileData.profileUsers?.[0]?.settings ?? [];
		const gamertag: string | undefined = settings.find(s => s.id === 'Gamertag')?.value;
		const modernGamertag: string | undefined = settings.find(s => s.id === 'UniqueModernGamertag')?.value;
		console.log('[Auth] Gamertag:', gamertag, '| ModernGamertag:', modernGamertag);
		if (!gamertag) throw new Error('Could not get Xbox gamertag');

		// Le gamertag moderne peut contenir un suffixe #1234 — on essaie la partie avant #
		const gamertagBase = gamertag.replace(/#\d+$/, '').trim();

		// 5. Vérifier la licence Minecraft via API Mojang publique
		// On essaie : gamertag exact → base sans suffixe
		let mojangProfile: { id: string; name: string } | null = null;
		for (const name of [...new Set([gamertag, gamertagBase])]) {
			const r = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(name)}`);
			console.log('[Auth] Mojang lookup', name, '→', r.status);
			if (r.ok) { mojangProfile = await r.json(); break; }
		}
		if (!mojangProfile) {
			// Gamertag ≠ username Minecraft → page de liaison manuelle
			const partialId = createPartialAuth(gamertag);
			cookies.set('partial_auth', partialId, {
				path: '/', httpOnly: true,
				secure: url.protocol === 'https:',
				sameSite: 'lax', maxAge: 900,
			});
			throw redirect(302, '/connexion/lier');
		}

		console.log('[Auth] Minecraft profile:', mojangProfile);
		recordLogin(mojangProfile.name);
		const sessionId = createSession({
			minecraftToken: '',
			uuid:           mojangProfile.id,
			username:       mojangProfile.name,
			skinUrl:        `https://crafatar.com/avatars/${mojangProfile.id}?overlay=true`,
			capeUrl:        undefined,
			skinVariant:    'classic',
		});

		cookies.set('shinsei_session', sessionId, {
			path:     '/',
			httpOnly: true,
			secure:   url.protocol === 'https:',
			sameSite: 'lax',
			maxAge:   86400,
		});

		throw redirect(302, '/profil');
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e) throw e;
		console.error('[Auth] Error:', e);
		throw redirect(302, '/connexion?error=auth_failed');
	}
};
