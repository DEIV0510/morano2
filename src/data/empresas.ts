// Empresas de Morano Gruppo. Textos de moranogruppo.com (página de cada empresa).
// Regla: no añadir cifras, certificaciones ni datos que el grupo no haya publicado.
import type images from './images.json';

type Foto = keyof typeof images;

export interface Empresa {
  slug: string; // misma dirección que en la web actual: /<slug>/
  nombre: string;
  logo: 'logo-oleo' | 'logo-tesoro' | 'logo-bio' | 'logo-motrade' | 'logo-famar' | 'logo-usa' | 'logo-europe';
  web: string; // dominio mostrado
  webUrl: string | null; // null = el dominio no responde: se muestra sin enlace
  area: string; // rótulo corto para tarjetas y menú
  lema: string;
  descripcion: string;
  pilares: { titulo: string; texto: string }[];
  foto: Foto; // cabecera de su página
  tarjeta: Foto; // tarjeta de la portada
  tarjetaVertical?: boolean; // foto 9:16 completa: ocupa dos filas del mosaico
  destacada?: Foto; // imagen completa (vertical) en el cuerpo de su página
  iscc?: boolean;
}

export const EMPRESAS: Empresa[] = [
  {
    slug: 'morano-oleo',
    nombre: 'Morano Oleo',
    logo: 'logo-oleo',
    web: 'www.moranoleo.com',
    webUrl: null,
    area: 'Producción agroindustrial',
    lema: 'Soluciones agroindustriales y producción sostenible',
    descripcion:
      'Morano Oleo representa el compromiso del grupo con la transformación agrícola sostenible. Nos especializamos en la producción, procesamiento y distribución de aceites vegetales de alta calidad, implementando mejores prácticas agrícolas e industriales que respetan el entorno y garantizan el máximo rendimiento de la materia prima.',
    pilares: [
      { titulo: 'Procesamiento de calidad', texto: 'Procesos de extracción y refinación alineados con altos estándares industriales.' },
      { titulo: 'Sostenibilidad agrícola', texto: 'Promoción del uso responsable de la tierra y la reducción de la huella de carbono en la cadena de suministro.' },
      { titulo: 'Comercialización y logística', texto: 'Garantía de suministro oportuno para la industria alimentaria, energética e industrial.' },
    ],
    foto: 'oleo-planta',
    tarjeta: 'card-oleo',
    iscc: true,
  },
  {
    slug: 'cimotrade',
    nombre: 'C.I. Motrade',
    logo: 'logo-motrade',
    web: 'www.cimotrade.com',
    webUrl: 'https://cimotrade.com/',
    area: 'Comercio exterior',
    lema: 'Comercializadora internacional y comercio exterior',
    descripcion:
      'C.I. Motrade es la unidad de comercialización internacional de Morano Gruppo, estructurada para gestionar la exportación e importación de materias primas y bienes procesados. Facilitamos el intercambio comercial global garantizando el cumplimiento normativo, aduanero y logístico.',
    pilares: [
      { titulo: 'Exportación e importación', texto: 'Gestión directa de oferta exportable y suministro internacional estratégico.' },
      { titulo: 'Gestión logística integral', texto: 'Coordinación de la cadena de frío, transporte marítimo y almacenamiento especializado.' },
      { titulo: 'Aseguramiento normativo', texto: 'Cumplimiento de estándares de comercio exterior, regulaciones arancelarias y certificaciones internacionales.' },
    ],
    foto: 'motrade-planta',
    tarjeta: 'card-motrade',
  },
  {
    slug: 'bio-industria',
    nombre: 'Bio Industria',
    logo: 'logo-bio',
    web: 'www.bioindustria.org',
    webUrl: 'https://www.bioindustria.org/',
    area: 'Envasado y bioeconomía',
    lema: 'Innovación biotecnológica e industria sostenible',
    descripcion:
      'En Bio Industria desarrollamos soluciones técnicas avanzadas enfocadas en la bioeconomía. Aprovechamos subproductos agrícolas e industriales para crear insumos, soluciones sostenibles e innovaciones que responden a los retos medioambientales de los sectores productivos actuales.',
    pilares: [
      { titulo: 'Envasado y embotellado de precisión', texto: 'Líneas automatizadas de llenado para aceites y líquidos en múltiples formatos (botellas de vidrio, PET, garrafas y tambores/contenedores industriales).' },
      { titulo: 'Desarrollo biotecnológico', texto: 'Investigación e implementación de soluciones limpias para procesos productivos.' },
      { titulo: 'Sostenibilidad ambiental', texto: 'Reducción del impacto ecológico mediante la optimización de recursos.' },
    ],
    foto: 'bio-envasado',
    tarjeta: 'card-bio',
  },
  {
    slug: 'morano-usa',
    nombre: 'Morano USA',
    logo: 'logo-usa',
    web: 'www.moranousa.com',
    webUrl: 'https://moranousa.com/',
    area: 'Mercados americanos',
    lema: 'Conectando la oferta agrícola global con la demanda de los mercados americanos',
    descripcion:
      'Morano USA es el brazo operativo y comercial de la organización enfocado en el continente americano. Nos especializamos en la importación, exportación y distribución mayorista de insumos agrícolas, commodities y productos alimentarios terminados, asegurando el cumplimiento riguroso de normativas de calidad internacionales y locales.',
    pilares: [
      { titulo: 'Distribución B2B', texto: 'Suministro directo a cadenas mayoristas, procesadoras alimentarias y distribuidores clave.' },
      { titulo: 'Gestión logística e importación', texto: 'Cadena de suministro eficiente y adaptada a la normativa fitosanitaria y alimentaria (FDA / USDA).' },
      { titulo: 'Desarrollo de mercado', texto: 'Expansión estratégica de productos agroalimentarios en EE. UU. y Latinoamérica.' },
    ],
    foto: 'usa-bodega',
    tarjeta: 'card-usa',
  },
  {
    slug: 'morano-europe',
    nombre: 'Morano Europe',
    logo: 'logo-europe',
    web: 'www.moranoeurope.com',
    webUrl: 'https://moranoeurope.com/',
    area: 'Mercados europeos',
    lema: 'El puente hacia los mercados europeos con estándares superiores de calidad y origen',
    descripcion:
      'Morano Europe lidera la gestión de abastecimiento, representación comercial y distribución dentro de la Unión Europea y mercados asociados. Operando bajo estrictas métricas de calidad y sostenibilidad, nos consolidamos como un socio confiable para el suministro de productos agrícolas de categoría premium y marcas destacadas de origen.',
    pilares: [
      { titulo: 'Selección y control de origen', texto: 'Garantía de pureza, estándares orgánicos y certificación europea.' },
      { titulo: 'Comercialización gourmet y retail', texto: 'Posicionamiento en grandes superficies y canales de distribución especializada.' },
      { titulo: 'Private label / marcas blancas', texto: 'Asesoramiento integral en empaque, etiquetado y logística para el mercado europeo.' },
    ],
    foto: 'europe-refineria',
    tarjeta: 'card-europe',
  },
  {
    slug: 'aceite-el-tesoro',
    nombre: 'Aceite El Tesoro',
    logo: 'logo-tesoro',
    web: 'www.aceiteeltesoro.com',
    webUrl: 'https://aceiteeltesoro.com/',
    area: 'Marca de consumo',
    // Textos de la etiqueta nueva (2026-11): «Aceite Vegetal Extra Fino · 100 % Palma».
    // La web anterior decía aceite de oliva: era un error.
    lema: 'El sabor de lo bien hecho',
    descripcion:
      'Aceite El Tesoro es el aceite vegetal extra fino del grupo, 100 % palma: para freír, cocinar y hornear, en casa y en la cocina profesional, con el respaldo del sistema productivo y logístico de Morano Gruppo.',
    pilares: [
      { titulo: 'Ideal para freír', texto: 'Alto punto de humo: fríe, cocina y hornea.' },
      { titulo: 'Libre de colesterol', texto: 'Aceite vegetal extra fino, 100 % palma.' },
      { titulo: 'Formatos de presentación', texto: 'Botellas y garrafas pensadas tanto para el sector HORECA (hoteles, restaurantes y catering) como para el canal retail y el consumo en el hogar.' },
    ],
    foto: 'tesoro-anuncio',
    tarjeta: 'tesoro-anuncio',
    tarjetaVertical: true,
    destacada: 'tesoro-anuncio',
  },
  {
    slug: 'famar',
    nombre: 'C.I. Famar',
    logo: 'logo-famar',
    web: 'www.cifamar.com',
    webUrl: 'https://www.cifamar.com/',
    area: 'Producción y abastecimiento',
    lema: 'Excelencia e innovación industrial',
    descripcion:
      'Famar es una unidad estratégica orientada a la producción, abastecimiento y distribución especializada. Basamos nuestras operaciones en el control riguroso de procesos, asegurando que cada producto o solución entregada cumpla con los estándares de exigencia requeridos por nuestros clientes y aliados.',
    pilares: [
      { titulo: 'Calidad garantizada', texto: 'Control exhaustivo de insumos y procesos de fabricación.' },
      { titulo: 'Capacidad operativa', texto: 'Infraestructura y equipo humano capacitado para la atención de grandes requerimientos.' },
      { titulo: 'Suministro confiable', texto: 'Eficiencia en la cadena de distribución y atención posventa.' },
    ],
    foto: 'famar-bodega',
    tarjeta: 'card-famar',
  },
];

export const empresa = (slug: string) => EMPRESAS.find((e) => e.slug === slug);
