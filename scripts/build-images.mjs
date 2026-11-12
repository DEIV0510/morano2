// Optimiza las fotografías de moranogruppo.com (descargadas en
// Desktop\MATERIAL-CLIENTES\morano-gruppo\web-actual). Solo cambia formato y
// tamaño: no recorta ni retoca. Salida: public/img/<nombre>-<ancho>.{avif,webp,jpg}
// + src/data/images.json (dimensiones, anchos y color de fondo).
//
// Uso: npm run images  [carpeta de originales]
import sharp from 'sharp';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = process.argv[2] || join(homedir(), 'Desktop', 'MATERIAL-CLIENTES', 'morano-gruppo', 'web-actual');
const OUT = join(root, 'public', 'img');
mkdirSync(OUT, { recursive: true });

// nombre → [archivo original, tipo]. Tipos: hero (pantalla completa), foto, noticia.
const PHOTOS = {
  // Portada
  'planta-tanques': ['2026_10_Morano-Gruppo-scaled.jpeg', 'hero'],
  'cultivo-palma': ['2025_03_WhatsApp-Image-2025-03-03-at-15.26.22-scaled-e1741034070721.jpeg', 'foto'],
  'cosecha-racimo': ['2025_02_WhatsApp-Image-2025-02-26-at-13.06.41-1-scaled.jpeg', 'foto'],
  'planta-exterior': ['2026_08_WhatsApp-Image-2026-07-17-at-22.31.28.jpeg', 'foto'],
  // Tarjetas de empresas (las mismas que usa hoy la portada)
  'card-oleo': ['2026_08_WhatsApp-Image-2026-07-17-at-22.26.07.jpeg', 'foto'],
  'card-motrade': ['2026_08_william-william-NndKt2kF1L4-unsplash-scaled.jpg', 'foto'],
  'card-bio': ['2026_08_WhatsApp-Image-2026-08-06-at-22.52.16-scaled.jpeg', 'foto'],
  'card-usa': ['2026_06_WhatsApp-Image-2026-06-25-at-20.32.07-scaled.jpeg', 'foto'],
  'card-europe': ['2026_08_Ci-Motrade.webp', 'foto'],
  'card-famar': ['2026_08_WhatsApp-Image-2026-08-06-at-23.03.28.jpeg', 'foto'],
  // Páginas de cada empresa
  'oleo-planta': ['2026_08_MORANO-OLEO.jpeg', 'foto'],
  'bio-fruto': ['2025_12_92da8a_e405100a3cb44699bd90ce3f1e629e14mv2-scaled.avif', 'foto'],
  'bio-envasado': ['2026_08_WhatsApp-Image-2026-07-17-at-22.26.07-2.jpeg', 'foto'],
  'motrade-planta': ['2026_06_WhatsApp-Image-2026-06-25-at-20.32.05-scaled.jpeg', 'foto'],
  'famar-bodega': ['2026_08_WhatsApp-Image-2026-07-17-at-22.26.06-1.jpeg', 'foto'],
  'europe-refineria': ['2026_08_WhatsApp-Image-2026-07-17-at-22.26.06.jpeg', 'foto'],
  'usa-bodega': ['2026_08_WhatsApp-Image-2026-08-06-at-22.58.26.jpeg', 'foto'],
  // Productos y soluciones
  'racimo': ['2025_02_WhatsApp-Image-2025-02-26-at-13.05.59-3-scaled.jpeg', 'foto'],
  // Etiqueta nueva de El Tesoro (enviada por el cliente el 2026-11-11)
  'tesoro-anuncio': ['el-tesoro-etiqueta-nueva-2026-11.jpeg', 'foto'],
  // Noticias (imagen destacada de cada una)
  'n-india': ['2026_09_KYOIMB5QWRFLPNECO5XYQYI6GY.avif', 'noticia'],
  'n-semana': ['2026_09_LBXME2WMX5AXPCUC3TMU7R3HKM.avif', 'noticia'],
  'n-bienestar': ['2025_02_WhatsApp-Image-2025-02-28-at-09.57.32.jpeg', 'noticia'],
  'n-encuentro-1': ['2025_03_WhatsApp-Image-2025-02-28-at-15.33.00.jpeg', 'noticia'],
  'n-nitrofert': ['2025_03_WhatsApp-Image-2025-02-28-at-15.29.32-scaled-e1740841067967.jpeg', 'noticia'],
  'n-educacion': ['2025_03_WhatsApp-Image-2025-02-28-at-15.34.54-scaled.jpeg', 'noticia'],
  'n-esquemas': ['2025_03_WhatsApp-Image-2025-03-03-at-16.52.08.jpeg', 'noticia'],
  'n-manos-mar': ['2025_03_WhatsApp-Image-2025-03-24-at-08.34.43-scaled.jpeg', 'noticia'],
  'n-encuentro-2': ['2025_03_WhatsApp-Image-2025-03-25-at-13.36.34.jpeg', 'noticia'],
  'n-ninos': ['2025_04_WhatsApp-Image-2025-05-08-at-14.29.36.jpeg', 'noticia'],
  'n-vallenato': ['2025_05_WhatsApp-Image-2025-05-08-at-14.36.27-1-e1746733537777.jpeg', 'noticia'],
  'n-santa-marta': ['2025_05_WhatsApp-Image-2025-05-31-at-14.49.07.jpeg', 'noticia'],
  'n-icp': ['2025_05_WhatsApp-Image-2025-05-31-at-14.49.22-scaled.jpeg', 'noticia'],
  'n-36-anos': ['2025_06_WhatsApp-Image-2025-06-18-at-16.58.04-scaled.jpeg', 'noticia'],
  'n-tesoro-cuba': ['2025_11_PHOTO-2025-08-25-10-03-12-580x387-1.jpg', 'noticia'],
};
const WIDTHS = { hero: [960, 1440, 1920], foto: [640, 960, 1280], noticia: [480, 800, 1200] };

const manifest = {};
for (const [name, [file, kind]] of Object.entries(PHOTOS)) {
  const input = join(SRC, file);
  if (!existsSync(input)) throw new Error(`Falta el original: ${file}`);
  const meta = await sharp(input).rotate().metadata();
  const { width, height } = meta.autoOrient ?? meta;
  const widths = [...new Set(WIDTHS[kind].map((w) => Math.min(w, width)))];
  const { dominant } = await sharp(input).stats();
  const color = `#${[dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  for (const w of widths) {
    const pipe = sharp(input).rotate().resize({ width: w, withoutEnlargement: true });
    await pipe.clone().avif({ quality: 50, effort: 6 }).toFile(join(OUT, `${name}-${w}.avif`));
    await pipe.clone().webp({ quality: 74, effort: 6 }).toFile(join(OUT, `${name}-${w}.webp`));
    await pipe.clone().jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(join(OUT, `${name}-${w}.jpg`));
  }
  manifest[name] = { width, height, widths, color };
  console.log(name, `${width}×${height}`, widths.join('/'));
}

// Logotipos de las empresas: sin fondo, a 2x del tamaño de uso, en WebP y PNG.
const LOGOS = {
  'logo-oleo': '2026_08_Logo-Morano-Oleo-Planta-de-beneficio-sin-fondo-scaled-1.webp',
  'logo-tesoro': '2025_02_Logo-El-tesoro.webp',
  'logo-bio': '2026_08_Bio-Industria.avif',
  'logo-motrade': '2026_08_LOGO-C.I-MOTRADE-e1761669258415-768x106-1.webp',
  'logo-famar': '2026_08_logo-Famar-completo.webp',
  'logo-usa': '2026_08_cropped-LOGO-PNG-MORANO-USA.webp',
};
const logos = {};
// Fondo transparente: los que vienen sobre blanco (Motrade, USA) pierden el blanco
// (alfa según la distancia al blanco), para poder ir sobre la foto en las tarjetas.
async function sinFondo(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const opaca = [0, W - 1, (H - 1) * W, H * W - 1].some((i) => data[i * 4 + 3] > 200);
  if (!opaca) return sharp(input).png().toBuffer();
  for (let i = 0; i < data.length; i += 4) {
    const d = Math.max(255 - data[i], 255 - data[i + 1], 255 - data[i + 2]);
    data[i + 3] = Math.round(data[i + 3] * Math.max(0, Math.min(1, (d - 12) / 60)));
  }
  return sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}
for (const [name, file] of Object.entries(LOGOS)) {
  const input = join(SRC, file);
  if (!existsSync(input)) throw new Error(`Falta el logotipo: ${file}`);
  const img = sharp(await sinFondo(input)).trim({ threshold: 12 });
  const buf = await img.resize({ width: 720, height: 240, fit: 'inside', withoutEnlargement: true }).png().toBuffer();
  const m = await sharp(buf).metadata();
  await sharp(buf).webp({ quality: 92, alphaQuality: 100 }).toFile(join(OUT, `${name}.webp`));
  await sharp(buf).png({ compressionLevel: 9 }).toFile(join(OUT, `${name}.png`));
  logos[name] = { width: m.width, height: m.height };
  console.log(name, `${m.width}×${m.height}`);
}
// Morano Europe: el SVG vectorizado de su propia web.
// Con width/height en el propio SVG para que se escale como una imagen normal.
const europeSvg = readFileSync(join(root, '_material', 'logo-morano-europe.svg'), 'utf8').replace('<svg ', '<svg width="1296" height="166" ');
writeFileSync(join(OUT, 'logo-europe.svg'), europeSvg);
logos['logo-europe'] = { width: 1296, height: 166, svg: true };
// Sello ISCC «Certificate Holder».
await sharp(join(SRC, '2026_08_Certification_Holder_Banner_BLACK_positive_RGB.webp'))
  .resize({ width: 520 })
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(join(OUT, 'iscc-520.webp'));

// Imagen para redes (1200×630): foto + sombra cálida + logotipo para fondo oscuro.
const lock = await sharp(join(root, 'public', 'brand', 'gruppo-v-reverse.png')).resize({ height: 300 }).png().toBuffer();
const lockMeta = await sharp(lock).metadata();
const shade = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0F0E0C" stop-opacity=".93"/><stop offset=".65" stop-color="#0F0E0C" stop-opacity=".8"/><stop offset="1" stop-color="#0F0E0C" stop-opacity=".35"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/></svg>`
);
await sharp(join(SRC, PHOTOS['planta-tanques'][0]))
  .resize(1200, 630, { fit: 'cover' })
  .composite([
    { input: shade, top: 0, left: 0 },
    { input: lock, top: Math.round((630 - lockMeta.height) / 2), left: 80 },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(join(OUT, 'og-morano-gruppo.jpg'));

writeFileSync(join(root, 'src', 'data', 'images.json'), JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(join(root, 'src', 'data', 'logos.json'), JSON.stringify(logos, null, 2) + '\n');
console.log(`${Object.keys(manifest).length} fotos, ${Object.keys(logos).length} logotipos → src/data/images.json, logos.json`);
