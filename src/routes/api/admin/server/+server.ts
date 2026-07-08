import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { setConfig } from '$lib/server/siteConfig';

function isAdmin(locals: App.Locals): boolean {
	return !!(locals.user && locals.user.username === env.ADMIN_MINECRAFT_USERNAME);
}

async function daemon(path: string, method: 'GET' | 'POST' = 'GET', body?: unknown): Promise<unknown> {
	const url   = env.MINECRAFT_CONTROL_URL;
	const token = env.MINECRAFT_CONTROL_TOKEN;
	if (!url || !token) return { error: 'Daemon non configuré' };
	const res = await fetch(`${url}${path}`, {
		method,
		headers: {
			'X-Token': token,
			...(body ? { 'Content-Type': 'application/json' } : {}),
		},
		body: body ? JSON.stringify(body) : undefined,
		signal: AbortSignal.timeout(6000),
	});
	return res.json();
}

export const GET: RequestHandler = async ({ locals, url, request }) => {
	if (!isAdmin(locals)) return json({ error: 'Accès refusé' }, { status: 403 });
	const action = url.searchParams.get('action') ?? 'status';

	if (action === 'stream') {
		const daemonUrl = env.MINECRAFT_CONTROL_URL;
		const token     = env.MINECRAFT_CONTROL_TOKEN;
		if (!daemonUrl || !token) {
			return new Response('data: "[Daemon non configuré]"\n\n', {
				headers: { 'Content-Type': 'text/event-stream' },
			});
		}
		try {
			const res = await fetch(`${daemonUrl}/stream`, {
				headers: { 'X-Token': token },
				signal: request.signal,
			});
			return new Response(res.body, {
				headers: {
					'Content-Type': 'text/event-stream; charset=utf-8',
					'Cache-Control': 'no-cache',
					'X-Accel-Buffering': 'no',
				},
			});
		} catch {
			return new Response('data: "[Daemon inaccessible]"\n\n', {
				headers: { 'Content-Type': 'text/event-stream' },
			});
		}
	}

	try {
		const data = await daemon(action === 'logs' ? '/logs' : '/status');
		return json(data);
	} catch {
		return json({ error: 'Daemon inaccessible' }, { status: 503 });
	}
};

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!isAdmin(locals)) return json({ error: 'Accès refusé' }, { status: 403 });

	const body = await request.json() as {
		action: string;
		enabled?: boolean;
		endDate?: string;
		message?: string;
		cmd?: string;
	};
	const { action, enabled = true, endDate: bodyEndDate, message = 'Le serveur est en maintenance. Nous revenons très bientôt !', cmd } = body;

	if (!['start', 'stop', 'cmd'].includes(action)) {
		return json({ error: 'Action invalide' }, { status: 400 });
	}

	try {
		let result: { ok?: boolean; message?: string };

		if (action === 'cmd') {
			result = await daemon('/cmd', 'POST', { cmd }) as typeof result;
			return json({ ok: result?.ok ?? true, message: result?.message ?? '' });
		}

		result = await daemon(`/${action}`, 'POST') as typeof result;

		if (action === 'stop') {
			if (enabled) {
				const endDate = bodyEndDate ?? new Date(Date.now() + 3_600_000).toISOString().slice(0, 16);
				setConfig('maintenance_enabled', '1');
				setConfig('maintenance_end', endDate);
				setConfig('maintenance_message', message);
			}
		} else {
			setConfig('maintenance_enabled', '0');
		}

		return json({ ok: result?.ok ?? true, message: result?.message ?? '' });
	} catch {
		return json({ error: 'Daemon inaccessible' }, { status: 503 });
	}
};
