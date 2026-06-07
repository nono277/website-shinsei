import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
	return json({ players: 247, status: 'online' });
};
