import type { RequestHandler } from '@sveltejs/kit';

const SITE = 'https://playshinsei.fr';

const pages = [
	{ path: '/',            priority: '1.0', changefreq: 'weekly'  },
	{ path: '/wiki',        priority: '0.8', changefreq: 'weekly'  },
	{ path: '/boutique',    priority: '0.8', changefreq: 'weekly'  },
	{ path: '/telecharger', priority: '0.9', changefreq: 'monthly' },
	{ path: '/recrutement', priority: '0.7', changefreq: 'monthly' },
	{ path: '/classement',  priority: '0.6', changefreq: 'daily'   },
];

export const GET: RequestHandler = () => {
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(({ path, priority, changefreq }) => `  <url>
    <loc>${SITE}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600',
		},
	});
};
