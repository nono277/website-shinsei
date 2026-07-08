import type { RequestHandler } from '@sveltejs/kit';

const SITE = 'https://playshinsei.fr';
const TODAY = new Date().toISOString().slice(0, 10);

const pages = [
	{ path: '/',                              priority: '1.0', changefreq: 'weekly',  lastmod: TODAY  },
	{ path: '/telecharger',                   priority: '0.9', changefreq: 'weekly',  lastmod: TODAY  },
	{ path: '/classes',                       priority: '0.8', changefreq: 'monthly', lastmod: TODAY  },
	{ path: '/wiki',                          priority: '0.8', changefreq: 'weekly',  lastmod: TODAY  },
	{ path: '/boutique',                      priority: '0.7', changefreq: 'monthly', lastmod: TODAY  },
	{ path: '/classement',                    priority: '0.7', changefreq: 'daily',   lastmod: TODAY  },
	{ path: '/vote',                          priority: '0.7', changefreq: 'daily',   lastmod: TODAY  },
	{ path: '/map',                           priority: '0.6', changefreq: 'daily',   lastmod: TODAY  },
	{ path: '/recrutement',                   priority: '0.6', changefreq: 'monthly', lastmod: TODAY  },
	{ path: '/support',                       priority: '0.5', changefreq: 'monthly', lastmod: TODAY  },
	{ path: '/mentions-legales',              priority: '0.3', changefreq: 'yearly',  lastmod: TODAY  },
	{ path: '/politique-de-confidentialite',  priority: '0.3', changefreq: 'yearly',  lastmod: TODAY  },
	{ path: '/cgu',                           priority: '0.3', changefreq: 'yearly',  lastmod: TODAY  },
];

export const GET: RequestHandler = () => {
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(({ path, priority, changefreq, lastmod }) => `  <url>
    <loc>${SITE}${path}</loc>
    <lastmod>${lastmod}</lastmod>
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
