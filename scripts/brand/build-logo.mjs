// Piezas de marca a partir del logotipo oficial de Morano Gruppo
// (_material/logo-morano-gruppo.png, fondo transparente). No se redibuja nada:
// solo se recorta, se reordena y se cambia el negro por marfil en la versión
// para fondos oscuros.
//
//   public/brand/gruppo-v.png / gruppo-v-reverse.png   logotipo completo: marca arriba, nombre abajo
//   public/brand/gruppo-mark.png / -reverse.png        solo la marca (pantalla de carga)
//   public/brand/gruppo-word-reverse.png               solo el nombre (pantalla de carga)
//   public/brand/gruppo.png                            logotipo original (JSON-LD)
//   public/favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png
//
// Uso: npm run brand
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = join(root, '_material', 'logo-morano-gruppo.png');
const OUT = join(root, 'public', 'brand');
mkdirSync(OUT, { recursive: true });

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;

// Bandas horizontales con contenido (alfa > 60): la marca arriba, el nombre abajo.
const rows = [];
for (let y = 0; y < H; y++) {
  let x0 = W, x1 = -1;
  for (let x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3] > 60) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
  rows.push(x1 >= 0 ? [x0, x1] : null);
}
const bands = [];
for (let y = 0, start = -1; y <= H; y++) {
  const on = y < H && rows[y];
  if (on && start < 0) start = y;
  if (!on && start >= 0) {
    let x0 = W, x1 = -1;
    for (let k = start; k < y; k++) { x0 = Math.min(x0, rows[k][0]); x1 = Math.max(x1, rows[k][1]); }
    bands.push({ left: x0, top: start, width: x1 - x0 + 1, height: y - start });
    start = -1;
  }
}
if (bands.length < 2) throw new Error('No se distinguen la marca y el nombre en el logotipo');
const PAD = 6;
const box = (b) => ({ left: Math.max(0, b.left - PAD), top: Math.max(0, b.top - PAD), width: Math.min(W, b.width + PAD * 2), height: Math.min(H, b.height + PAD * 2) });
const markBox = box(bands[0]);
const wordBox = box(bands[bands.length - 1]);

// Versión para fondos oscuros: los píxeles negros/neutros oscuros pasan a marfil.
const IVORY = [244, 241, 234];
const reverse = Buffer.from(data);
for (let i = 0; i < reverse.length; i += 4) {
  const r = reverse[i], g = reverse[i + 1], b = reverse[i + 2];
  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (sat < 40 && lum < 140) [reverse[i], reverse[i + 1], reverse[i + 2]] = IVORY;
}
const variants = {
  '': sharp(data, { raw: { width: W, height: H, channels: 4 } }),
  '-reverse': sharp(reverse, { raw: { width: W, height: H, channels: 4 } }),
};

const png = (img) => img.png({ compressionLevel: 9, adaptiveFiltering: true });
// Logotipo completo tal cual (marca arriba, nombre abajo), recortado al contenido.
const left = Math.min(markBox.left, wordBox.left);
const top = markBox.top;
const fullBox = {
  left,
  top,
  width: Math.max(markBox.left + markBox.width, wordBox.left + wordBox.width) - left,
  height: wordBox.top + wordBox.height - top,
};
for (const [suffix, img] of Object.entries(variants)) {
  const full = await img.clone().extract(fullBox).png().toBuffer();
  const mark = await img.clone().extract(markBox).png().toBuffer();
  const word = await img.clone().extract(wordBox).png().toBuffer();
  // Cabecera a ~72 px de alto y pie a ~120 px: se guarda a 2–3x.
  await png(sharp(full).resize({ height: 260 })).toFile(join(OUT, `gruppo-v${suffix}.png`));
  await png(sharp(mark).resize({ height: 240 })).toFile(join(OUT, `gruppo-mark${suffix}.png`));
  if (suffix) await png(sharp(word).resize({ height: 60 })).toFile(join(OUT, `gruppo-word${suffix}.png`));
  console.log(`gruppo-v${suffix}.png`);
}
await png(sharp(SRC)).toFile(join(OUT, 'gruppo.png'));

// Iconos: la marca sobre marfil.
const markPos = await variants[''].clone().extract(markBox).png().toBuffer();
for (const [name, size] of [['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  const inner = Math.round(size * (size <= 32 ? 0.92 : 0.72));
  const m = await sharp(markPos).resize({ width: inner, height: inner, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: '#F7F4EE' } })
    .composite([{ input: m, gravity: 'centre' }])
    .png()
    .toFile(join(root, 'public', name));
}

// Proporciones para el HTML (width/height de las <img>).
const dims = {};
for (const f of ['gruppo-v', 'gruppo-v-reverse', 'gruppo-mark-reverse', 'gruppo-word-reverse']) {
  const m = await sharp(join(OUT, `${f}.png`)).metadata();
  dims[f] = { width: m.width, height: m.height };
}
writeFileSync(join(root, 'src', 'data', 'brand.json'), JSON.stringify(dims, null, 2) + '\n');
console.log('marca:', JSON.stringify(dims));
