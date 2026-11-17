// Noticias: las de moranogruppo.com y las notas de prensa enviadas por el
// cliente (scripts/import-noticias.mjs → src/data/noticias.json).
import data from '../data/noticias.json';
import type images from '../data/images.json';

export interface Noticia {
  slug: string;
  title: string;
  image: keyof typeof images;
  excerpt?: string;
  paragraphs?: string[];
  prensa?: { fuente: string; url: string; fecha?: string; resumen: string };
}

/** Todas, de la más reciente a la más antigua (la portada muestra las tres primeras). */
export const NOTICIAS = data as Noticia[];
/** Notas de prensa (en el orden del archivo: de la más reciente a la más antigua). */
export const EN_MEDIOS = NOTICIAS.filter((n) => n.prensa);
/** Notas propias del grupo. */
export const DEL_GRUPPO = NOTICIAS.filter((n) => !n.prensa);

const largo = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const corto = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
export const fecha = (iso: string) => largo.format(new Date(`${iso}T00:00:00Z`));
export const fechaCorta = (iso: string) => {
  const p = Object.fromEntries(corto.formatToParts(new Date(`${iso}T00:00:00Z`)).map((x) => [x.type, x.value]));
  return `${p.day} ${String(p.month).replace('.', '')} ${p.year}`; // «16 nov 2026»
};

/** «Portafolio · 16 nov 2026» o «Morano Gruppo». */
export const origen = (n: Noticia, conFecha: (iso: string) => string = fechaCorta) =>
  n.prensa ? [n.prensa.fuente, n.prensa.fecha && conFecha(n.prensa.fecha)].filter(Boolean).join(' · ') : 'Morano Gruppo';
