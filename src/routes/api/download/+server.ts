import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { recordDownload } from '$lib/server/siteConfig';

export const GET: RequestHandler = () => {
	recordDownload();
	return json({ version: '1.0.1', url: 'https://cdn.playshinsei.fr/launcher/SHINSEI-Setup.exe', size: '148MB', mcVersion: '1.20.1', forge: true });
};
