import type { APIRoute } from 'astro';
import { EMPRESAS } from '../data/empresas.ts';
import { NOTICIAS } from '../lib/noticias.ts';
import { SITE } from '../lib/site.ts';

export const GET: APIRoute = () => {
  const pages: [string, string][] = [
    ['/', '1.0'],
    ...EMPRESAS.map((e) => [`/${e.slug}/`, '0.8'] as [string, string]),
    ['/productos-y-soluciones/', '0.8'],
    ['/noticias/', '0.6'],
    ...NOTICIAS.map((n) => [`/${n.slug}/`, '0.4'] as [string, string]),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
    .map(([p, pr]) => `  <url><loc>${SITE.url}${p}</loc><priority>${pr}</priority></url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
