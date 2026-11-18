// Empaqueta la web compilada (dist/) como plugin de WordPress para el
// WordPress de moranogruppo.com (el mismo método que Morano Europe).
//
//   dist-wp/morano-gruppo-web/
//     morano-gruppo-web.php   decide qué página servir en cada dirección
//     pages/                  HTML + redirects.json (solo lo lee PHP; acceso directo bloqueado)
//     site/                   CSS, JS, fuentes, imágenes (los sirve el servidor)
//   dist-wp/morano-gruppo-web.zip  → WordPress: Plugins → Añadir nuevo → Subir plugin
//   dist-wp/morano-gruppo-imagenes-N.zip → Ajustes → Web Morano Gruppo → Subir imágenes
//     (las imágenes van en wp-content/uploads/morano-gruppo-web/img/: no se
//     borran al actualizar el plugin; cada paquete pesa menos de 7 MB)
//
// Las rutas absolutas de recursos (/img/…, /_astro/…) se reescriben a la
// carpeta del plugin. Las redirecciones de vercel.json pasan a redirects.json.
// Al final se comprueba que no quede ninguna ruta sin reescribir, que cada
// recurso citado exista y que cada enlace interno apunte a una página que existe.
//
// Uso: npm run wp   (compila y empaqueta)
import { cpSync, rmSync, mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = join(root, 'dist');
const SLUG = 'morano-gruppo-web';
const OUT_ROOT = join(root, 'dist-wp');
const OUT = join(OUT_ROOT, SLUG);
const SITE = 'https://moranogruppo.com';
const BASE = `/wp-content/plugins/${SLUG}/site`;
const IMG_BASE = '/wp-content/uploads/morano-gruppo-web/img';
const IMG_OUT = join(OUT_ROOT, 'imagenes', 'img');
const PART_MAX = 7 * 1024 * 1024; // el navegador sube como mucho 10 MB por vez

const ASSETS = ['_astro', 'img', 'fonts', 'brand', 'intro.js', 'favicon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'site.webmanifest'];
const FILES = ['index.html', '404.html', 'sitemap.xml'];
const SKIP = ['robots.txt']; // robots.txt es de WordPress (el plugin le añade el mapa del sitio)

if (!existsSync(join(DIST, 'index.html'))) throw new Error('Falta dist/: ejecuta antes npm run build');

rmSync(OUT_ROOT, { recursive: true, force: true });
mkdirSync(join(OUT, 'pages'), { recursive: true });
mkdirSync(join(OUT, 'site'), { recursive: true });

for (const entry of readdirSync(DIST)) {
  const src = join(DIST, entry);
  if (entry === 'img') cpSync(src, IMG_OUT, { recursive: true });
  else if (ASSETS.includes(entry)) cpSync(src, join(OUT, 'site', entry), { recursive: true });
  else if (FILES.includes(entry)) cpSync(src, join(OUT, 'pages', entry));
  else if (SKIP.includes(entry)) continue;
  else if (statSync(src).isDirectory() && existsSync(join(src, 'index.html')) && /^[a-z0-9][a-z0-9-]*$/.test(entry))
    cpSync(src, join(OUT, 'pages', entry), { recursive: true });
  else throw new Error(`Entrada no prevista en dist/: ${entry} (añádela a ASSETS, FILES o SKIP)`);
}

// ── Redirecciones de la web anterior (vercel.json → redirects.json) ──
const vercel = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
const redirects = { exact: {}, prefix: {} };
for (const r of vercel.redirects ?? []) {
  const m = r.source.match(/^(\/[a-z0-9/-]*?)\/:path\*\/?$/);
  if (m) redirects.prefix[m[1]] = r.destination;
  else if (/^\/[a-z0-9/-]*$/.test(r.source)) redirects.exact[r.source.replace(/(.)\/$/, '$1')] = r.destination;
  else throw new Error(`Redirección no soportada por el plugin: ${r.source}`);
}
writeFileSync(join(OUT, 'pages', 'redirects.json'), JSON.stringify(redirects, null, 1));

// Versión: 1.0.<número de commits> para que WordPress muestre una versión creciente.
const commits = execFileSync('git', ['rev-list', '--count', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const version = `1.0.${commits}`;
const php = readFileSync(join(root, 'wordpress', `${SLUG}.php`), 'utf8').replaceAll('__MGW_VERSION__', version);
writeFileSync(join(OUT, `${SLUG}.php`), php);
cpSync(join(root, 'wordpress', 'uninstall.php'), join(OUT, 'uninstall.php'));

// ── Reescritura de rutas ──
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ROOTS = ASSETS.map(esc).join('|');
const STOP = `(?=[/"'?#)\\s,]|$)`;
const REWRITE = new RegExp(`(^|[\\s"'(,=])(${esc(SITE)})?/(${ROOTS})${STOP}`, 'g');
const LEFTOVER = new RegExp(`(^|[\\s"'(,=])(https://(?:www\\.)?moranogruppo\\.com)?/(${ROOTS})${STOP}`, 'g');
const TEXT = new Set(['.html', '.css', '.js', '.webmanifest', '.xml']);

const walk = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

let rewritten = 0;
for (const file of walk(OUT)) {
  if (!TEXT.has(extname(file))) continue;
  const src = readFileSync(file, 'utf8');
  const out = src.replace(REWRITE, (_, pre, domain, rest) => {
    rewritten++;
    const base = rest === 'img' || rest.startsWith('img/') ? IMG_BASE.slice(0, -'/img'.length) : BASE;
    return `${pre}${domain ? SITE : ''}${base}/${rest}`;
  });
  if (out !== src) writeFileSync(file, out);
}

// ── Comprobaciones ──
const problems = [];
const pageExists = (path) => {
  const clean = path.split(/[?#]/)[0].replace(/\/$/, '');
  if (clean === '' || clean.startsWith('/wp-content/') || clean === '/sitemap.xml') return true;
  return existsSync(join(OUT, 'pages', clean, 'index.html'));
};
let pages = 0;
for (const file of walk(OUT)) {
  if (!TEXT.has(extname(file))) continue;
  const text = readFileSync(file, 'utf8');
  const rel = file.slice(OUT.length + 1);
  if (text.includes('www.moranogruppo.com')) problems.push(`${rel}: dominio con www`);
  for (const m of text.matchAll(LEFTOVER)) problems.push(`${rel}: ruta sin reescribir ${m[0].trim()}`);
  for (const m of text.matchAll(new RegExp(`${esc(BASE)}/([^"'\\s),?#]+)`, 'g'))) {
    if (!existsSync(join(OUT, 'site', m[1]))) problems.push(`${rel}: falta el recurso ${m[1]}`);
  }
  for (const m of text.matchAll(new RegExp(`${esc(IMG_BASE)}/([^"'\\s),?#]+)`, 'g'))) {
    if (!existsSync(join(IMG_OUT, m[1]))) problems.push(`${rel}: falta la imagen ${m[1]}`);
  }
  if (extname(file) === '.html') {
    pages++;
    for (const m of text.matchAll(/href="((?:https:\/\/moranogruppo\.com)?\/(?!\/)[^"]*)"/g)) {
      const path = m[1].replace(SITE, '') || '/';
      if (!pageExists(path)) problems.push(`${rel}: enlace a página inexistente ${path}`);
    }
  }
}
for (const to of [...Object.values(redirects.exact), ...Object.values(redirects.prefix)]) {
  if (!pageExists(to)) problems.push(`redirects.json: destino inexistente ${to}`);
}
if (problems.length) {
  console.error([...new Set(problems)].join('\n'));
  throw new Error(`${problems.length} problemas en el paquete de WordPress`);
}

// Seguridad y caché de las carpetas.
const silence = '<?php\n// Silence is golden.\n';
for (const dir of [OUT, join(OUT, 'pages'), ...['', '_astro', 'fonts', 'brand'].map((d) => join(OUT, 'site', d))]) {
  if (existsSync(dir) && !existsSync(join(dir, 'index.php'))) writeFileSync(join(dir, 'index.php'), silence);
}
writeFileSync(
  join(OUT, 'pages', '.htaccess'),
  '# Las páginas solo se sirven a través del plugin.\n<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Order allow,deny\n  Deny from all\n</IfModule>\n'
);
writeFileSync(
  join(OUT, 'site', '.htaccess'),
  '<IfModule mod_mime.c>\n  AddType application/manifest+json .webmanifest\n  AddType font/woff2 .woff2\n  AddType image/avif .avif\n</IfModule>\n<IfModule mod_headers.c>\n  <FilesMatch "\\.(avif|webp|jpe?g|png|svg|woff2|webmanifest)$">\n    Header set Cache-Control "public, max-age=2592000"\n  </FilesMatch>\n  <Files "intro.js">\n    Header set Cache-Control "public, max-age=86400"\n  </Files>\n</IfModule>\n'
);
// Archivos con huella en el nombre: caché de un año.
writeFileSync(
  join(OUT, 'site', '_astro', '.htaccess'),
  '<IfModule mod_headers.c>\n  <FilesMatch "\\.(css|js)$">\n    Header set Cache-Control "public, max-age=31536000, immutable"\n  </FilesMatch>\n</IfModule>\n'
);

// ── Imágenes: manifiesto (nombre → md5) y paquetes de menos de 7 MB ──
const imgs = readdirSync(IMG_OUT).filter((n) => statSync(join(IMG_OUT, n)).isFile()).sort();
for (const n of imgs) {
  if (!/^[a-z0-9][a-z0-9._-]*\.(avif|webp|jpe?g|png|svg)$/i.test(n)) throw new Error(`Nombre de imagen no admitido por el plugin: ${n}`);
}
const manifest = Object.fromEntries(imgs.map((n) => [n, createHash('md5').update(readFileSync(join(IMG_OUT, n))).digest('hex')]));
writeFileSync(join(OUT, 'pages', 'img-manifest.json'), JSON.stringify(manifest));
const parts = [[]];
let partSize = 0;
for (const n of imgs) {
  const size = statSync(join(IMG_OUT, n)).size;
  if (partSize + size > PART_MAX && parts.at(-1).length) {
    parts.push([]);
    partSize = 0;
  }
  parts.at(-1).push(n);
  partSize += size;
}

// ZIP con el tar de Windows (bsdtar): rutas con «/», válidas en el servidor Linux.
const makeZip = (zipPath, cwd, entries) => {
  if (process.platform === 'win32') execFileSync('C:\\Windows\\System32\\tar.exe', ['-a', '-c', '-f', zipPath, ...entries], { cwd });
  else execFileSync('zip', ['-qr', zipPath, ...entries], { cwd });
};
const zip = join(OUT_ROOT, `${SLUG}.zip`);
makeZip(zip, OUT_ROOT, [SLUG]);
parts.forEach((list, i) => {
  const partZip = join(OUT_ROOT, `morano-gruppo-imagenes-${i + 1}.zip`);
  makeZip(partZip, join(OUT_ROOT, 'imagenes'), list.map((n) => `img/${n}`));
  if (statSync(partZip).size > 10 * 1024 * 1024) throw new Error(`El paquete de imágenes ${i + 1} pesa más de 10 MB`);
});

const mb = (statSync(zip).size / 1048576).toFixed(2);
console.log(`Plugin ${SLUG} ${version}: ${pages} HTML, ${rewritten} rutas reescritas, ${Object.keys(redirects.exact).length} + ${Object.keys(redirects.prefix).length} redirecciones, sin problemas. ZIP ${mb} MB → ${zip}`);
console.log(`Imágenes: ${imgs.length} en ${parts.length} paquetes (morano-gruppo-imagenes-1…${parts.length}.zip)`);
