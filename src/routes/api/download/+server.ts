import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
	return json({ version: '1.0', url: 'http://cdn.playshinsei.fr/launcher/shinsei-setup.exe', size: '180MB', mcVersion: '1.20.1', forge: true });
};
