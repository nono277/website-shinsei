import { redirect } from '@sveltejs/kit';
import { MICROSOFT_CLIENT_ID } from '$env/static/private';
import { createSession } from '$lib/server/session';
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
		const tokenRes = await fetch('https://login.live.com/oauth20_token.srf', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id:    MICROSOFT_CLIENT_ID,
				grant_type:   'authorization_code',
				code,
				redirect_uri: redirectUri,
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

		// 3. XSTS token
		const xstsRes = await fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
			body: JSON.stringify({
				Properties:   { SandboxId: 'RETAIL', UserTokens: [xblToken] },
				RelyingParty: 'rp://api.minecraftservices.com/',
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

		// 4. Minecraft authentication
		const mcRes = await fetch(
			'https://api.minecraftservices.com/authentication/login_with_xbox',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ identityToken: `XBL3.0 x=${userHash};${xstsToken}` }),
			}
		);
		const mcData = await mcRes.json();
		if (!mcRes.ok) throw new Error(`Minecraft auth failed: ${JSON.stringify(mcData)}`);
		const mcToken: string = mcData.access_token;

		// 5. Get Minecraft profile
		const profileRes = await fetch('https://api.minecraftservices.com/minecraft/profile', {
			headers: { Authorization: `Bearer ${mcToken}` },
		});
		if (profileRes.status === 404) throw redirect(302, '/connexion?error=no_minecraft');
		if (!profileRes.ok) throw new Error('Profile fetch failed');
		const profile = await profileRes.json();

		const activeSkin = profile.skins?.find((s: { state: string }) => s.state === 'ACTIVE');
		const activeCape = profile.capes?.find((c: { state: string }) => c.state === 'ACTIVE');

		const sessionId = createSession({
			minecraftToken: mcToken,
			uuid:           profile.id,
			username:       profile.name,
			skinUrl:        activeSkin?.url,
			capeUrl:        activeCape?.url,
			skinVariant:    activeSkin?.variant?.toLowerCase() ?? 'classic',
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
