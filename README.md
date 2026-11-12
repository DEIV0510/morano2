# Morano Gruppo — web corporativa

Rediseño de [moranogruppo.com](https://moranogruppo.com) con la misma información: holding de aceites y grasas vegetales de palma, sus 7 empresas, productos y soluciones, sostenibilidad (certificación ISCC EU de Morano Oleo), noticias y contacto. *From Palm to the World.*

Web **estática** (Astro): no necesita servidor ni base de datos. Se publica en Vercel (conectando el repositorio) o en cualquier hosting subiendo la carpeta `dist/`.

Las direcciones son las mismas que en la web actual (`/morano-oleo/`, `/productos-y-soluciones/`, `/noticias/`, cada noticia en `/<slug>/`), así no se pierden enlaces ni posiciones en Google al reemplazarla.

## Cómo se edita

| Qué | Archivo |
| --- | --- |
| Textos de la portada, contacto, menú | [src/lib/site.ts](src/lib/site.ts) |
| Empresas (texto, pilares, web, fotos) | [src/data/empresas.ts](src/data/empresas.ts) |
| Productos y soluciones | [src/data/productos.ts](src/data/productos.ts) |
| Noticias | [src/data/noticias.json](src/data/noticias.json) (se genera con `npm run noticias`) |
| Fotos | originales en `Desktop\MATERIAL-CLIENTES\morano-gruppo\web-actual` → registrar en `scripts/build-images.mjs` → `npm run images` |
| Logotipo (versión para fondo claro y para fondo oscuro) | `_material/logo-morano-gruppo.png` → `npm run brand` |

## En local

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # genera dist/
npm run check      # revisa tipos
```

## Decisiones

- Diseño de la misma familia que moranoeurope.com: negro cálido, marfil y blanco; el dorado del logotipo solo como acento; esquinas rectas; marcos dorados desplazados como motivo.
- El formulario de contacto abre el correo con el mensaje redactado para info@moranogruppo.com (la web no guarda datos).
- Las notas de prensa ajenas (Semana, Caracol Radio, Cubadebate, Opinión Caribe) se muestran con un resumen propio y el enlace a la fuente, sin copiar el artículo.
- moranoleo.com no responde: se muestra como texto, sin enlace.
- Aceite El Tesoro: textos de la etiqueta nueva (2026-11): aceite vegetal extra fino, 100 % palma. La web anterior lo describía como aceite de oliva por error.
- Logotipo del grupo siempre completo: marca arriba y nombre abajo. Los logotipos de las empresas van sin fondo; sobre las fotos de la portada, en blanco.
