// Noticias importadas de moranogruppo.com (scripts/import-noticias.mjs).
import data from '../data/noticias.json';
import type images from '../data/images.json';

export interface Noticia {
  slug: string;
  title: string;
  image: keyof typeof images;
  excerpt?: string;
  paragraphs?: string[];
  prensa?: { fuente: string; url: string; fecha: string; resumen: string };
}

export const NOTICIAS = data as Noticia[];

const fmt = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const fecha = (iso: string) => fmt.format(new Date(`${iso}T00:00:00Z`));
