import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

function isAdmin(locals: App.Locals): boolean {
	return !!(locals.user && locals.user.username === env.ADMIN_MINECRAFT_USERNAME);
}

async function daemon(path: string, method: 'GET' | 'POST' = 'GET'): Promise<unknown> {
	const url = env.MINECRAFT_CONTROL_URL;
	const token = env.MINECRAFT_CONTROL_TOKEN;
	if (!url || !token) return { error: 'Daemon non configuré' };
	const res = await fetch(`${url}${path}`, {
		method,
		headers: { 'X-Token': token },
		signal: AbortSignal.timeout(6000),
	});
	return res.json();
}

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!isAdmin(locals)) return json({ error: 'Accès refusé' }, { status: 403 });
	const action = url.searchParams.get('action') ?? 'status';
	try {
		const data = await daemon(action === 'logs' ? '/logs' : '/status');
		return json(data);
	} catch {
		return json({ error: 'Daemon inaccessible' }, { status: 503 });
	}
};

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!isAdmin(locals)) return json({ error: 'Accès refusé' }, { status: 403 });
	const { action } = await request.json() as { action: string };
	if (action !== 'start' && action !== 'stop') {
		return json({ error: 'Action invalide' }, { status: 400 });
	}
	try {
		const data = await daemon(`/${action}`, 'POST');
		return json(data);
	} catch {
		return json({ error: 'Daemon inaccessible' }, { status: 503 });
	}
};
