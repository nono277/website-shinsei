import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
	return json({ version: '1.0.1', url: 'http://cdn.playshinsei.fr/launcher/SHINSEI-Setup.exe', size: '148MB', mcVersion: '1.20.1', forge: true });
};
