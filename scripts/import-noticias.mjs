// Importa las noticias de moranogruppo.com (copia de la API de WordPress en
// MATERIAL-CLIENTES\morano-gruppo\web-actual\_noticias.json) a src/data/noticias.json.
//
// - Notas propias del grupo: texto completo (solo párrafos, negritas, cursivas y enlaces).
// - Notas de prensa (Semana, Caracol, Cubadebate, Opinión Caribe): no se copia el
//   artículo ajeno; se muestra un resumen propio y el enlace a la fuente original.
//
// Uso: npm run noticias  [carpeta de originales]
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = process.argv[2] || join(homedir(), 'Desktop', 'MATERIAL-CLIENTES', 'morano-gruppo', 'web-actual');
const posts = JSON.parse(readFileSync(join(SRC, '_noticias.json'), 'utf8'));

// Orden y foto de cada nota, tal como aparecen hoy en /noticias/.
const ORDER = [
  ['sector-palmero-del-magdalena-fortalece-su-apuesta-internacional-y-anuncia-llegada-a-la-india', 'n-india'],
  ['grupo-empresarial-de-la-costa-se-transforma-ahora-su-foco-sera-la-agroindustria-en-el-sector-palmero', 'n-semana'],
  ['en-morano-el-bienestar-mental-es-una-prioridad', 'n-bienestar'],
  ['morano-oleo-realiza-el-i-encuentro-conexion-nucleo-palmero-para-fortalecer-el-sector', 'n-encuentro-1'],
  ['nueva-alianza-entre-morano-y-nitrofert-para-impulsar-a-los-palmicultores', 'n-nitrofert'],
  ['morano-impulsa-la-educacion-ambiental-en-la-zona-bananera', 'n-educacion'],
  ['grupo-morano-rompiendo-esquemas', 'n-esquemas'],
  ['manos-al-mar-morano-gruppo-lidero-exitosa-jornada-ambiental-en-el-dia-mundial-del-agua', 'n-manos-mar'],
  ['ii-encuentro-conexion-nucleo-palmero-de-morano-oleo', 'n-encuentro-2'],
  ['morano-regalo-sonrisas-y-cine-a-mas-de-200-ninos-en-santa-marta-en-su-dia-especial', 'n-ninos'],
  ['el-rey-vallenato-2025-ivan-zuleta-cumple-suenos-entregara-50-acordeones-y-morano-da-los-primeros-pasos', 'n-vallenato'],
  ['morano-se-une-a-vamos-por-santa-marta-en-el-embellecimiento-de-la-ciudad-por-sus-500-anos', 'n-santa-marta'],
  ['formacion-del-instituto-de-ciencia-politica-hernan-echavarria-olozaga-fortalece-el-espiritu-empresarial-en-morano', 'n-icp'],
  ['morano-gruppo-celebra-36-anos-de-historia-crecimiento-y-transformacion', 'n-36-anos'],
  ['morano-gruppo-presenta-el-tesoro-un-aliado-estrategico-para-la-industria-alimentaria-cubana', 'n-tesoro-cuba'],
];

// Notas de prensa: fuente, enlace y resumen propio (no se reproduce el artículo).
const PRENSA = {
  'sector-palmero-del-magdalena-fortalece-su-apuesta-internacional-y-anuncia-llegada-a-la-india': {
    fuente: 'Caracol Radio',
    url: 'https://caracol.com.co/2026/09/28/sector-palmero-del-magdalena-fortalece-su-apuesta-internacional-y-anuncia-llegada-a-la-india/',
    fecha: '2026-09-28',
    resumen: 'Caracol Radio repasa el avance del sector palmero del Magdalena hacia nuevos mercados, entre ellos la India, y recoge las declaraciones de Jorge Camilo Gnecco sobre la producción sostenible del aceite de palma colombiano.',
  },
  'grupo-empresarial-de-la-costa-se-transforma-ahora-su-foco-sera-la-agroindustria-en-el-sector-palmero': {
    fuente: 'Semana',
    url: 'https://www.semana.com/economia/empresas/articulo/grupo-empresarial-de-la-costa-se-transforma-ahora-su-foco-sera-la-agroindustria-en-el-sector-palmero/202629/',
    fecha: '2026-09-28',
    resumen: 'En entrevista con Semana, Jorge Camilo Gnecco, presidente ejecutivo de Morano Gruppo, explica la nueva etapa del grupo: dejar la construcción, el sector inmobiliario y el cerámico para concentrarse en la agroindustria de la palma.',
  },
  'grupo-morano-rompiendo-esquemas': {
    fuente: 'Opinión Caribe',
    url: 'https://www.opinioncaribe.com/2017/06/28/grupo-morano-rompiendo-esquemas/',
    fecha: '2017-06-28',
    resumen: 'Opinión Caribe perfila a Morano Gruppo y a su presidente ejecutivo, Jorge Camilo Gnecco Espinosa, y su apuesta por la diversificación y la calidad.',
  },
  'morano-gruppo-presenta-el-tesoro-un-aliado-estrategico-para-la-industria-alimentaria-cubana': {
    fuente: 'Cubadebate',
    url: 'http://www.cubadebate.cu/noticias/2025/11/28/morano-gruppo-presenta-el-tesoro-un-aliado-estrategico-para-la-industria-alimentaria-cubana/',
    fecha: '2025-11-28',
    resumen: 'Cubadebate reseña la participación de Morano Gruppo en la 41 Feria Internacional de La Habana, donde presentó su aceite vegetal El Tesoro para la industria alimentaria cubana.',
  },
};

const dec = (s) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8230;/g, '…')
    .replace(/&#038;|&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Párrafo → HTML mínimo y seguro: texto escapado + <strong>, <em>, <a href> externos.
function paragraph(html) {
  const tokens = [];
  const re = /<(\/?)(strong|b|em|i)\b[^>]*>|<a\b[^>]*href="([^"]+)"[^>]*>|<\/a>|<[^>]+>|([^<]+)/gi;
  let m;
  let inLink = false;
  while ((m = re.exec(html))) {
    if (m[2]) {
      const tag = /^(strong|b)$/i.test(m[2]) ? 'strong' : 'em';
      tokens.push(`<${m[1]}${tag}>`);
    } else if (m[3]) {
      const href = dec(m[3]);
      if (/^https?:\/\//.test(href)) {
        tokens.push(`<a href="${escape(href)}" rel="noopener" target="_blank">`);
        inLink = true;
      }
    } else if (m[0].toLowerCase() === '</a>') {
      if (inLink) tokens.push('</a>');
      inLink = false;
    } else if (m[4]) tokens.push(escape(dec(m[4])));
  }
  return tokens.join('').replace(/\s+/g, ' ').replace(/<(strong|em)>\s*<\/\1>/g, '').trim();
}

const out = ORDER.map(([slug, image]) => {
  const p = posts.find((x) => x.slug === slug);
  if (!p) throw new Error(`No está la noticia ${slug}`);
  const title = dec(p.title.rendered.replace(/<[^>]+>/g, ''))
    .replace(/\s*\|\s*Fuente:.*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  const prensa = PRENSA[slug];
  if (prensa) return { slug, title, image, prensa };
  const paragraphs = [...p.content.rendered.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => paragraph(m[1]))
    .filter((t) => t && !/^Fuente:/i.test(t.replace(/<[^>]+>/g, '')));
  const plain = paragraphs.map((t) => t.replace(/<[^>]+>/g, '')).join(' ');
  const excerpt = plain.length > 190 ? plain.slice(0, plain.lastIndexOf(' ', 185)) + '…' : plain;
  return { slug, title, image, excerpt, paragraphs };
});

writeFileSync(join(root, 'src', 'data', 'noticias.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`${out.length} noticias (${out.filter((n) => n.prensa).length} de prensa) → src/data/noticias.json`);
