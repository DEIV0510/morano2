// Productos y soluciones — texto de moranogruppo.com/productos-y-soluciones/.
export interface Linea {
  n: string;
  titulo: string;
  texto: string;
  items: { nombre: string; detalle: string }[];
}

export const CIFRAS = [
  { valor: 5, sufijo: '', titulo: 'Etapas de la cadena de valor' },
  { valor: 30, sufijo: '', titulo: 'Productos y servicios' },
  { valor: 100, sufijo: '%', titulo: 'Servicio integral' },
];

export const INTRO =
  'Desde el aceite crudo hasta el producto terminado: aceites, grasas, derivados, biomasa y servicios de industrialización, maquila y comercio internacional para industrias y marcas en todo el mundo.';

export const LINEAS: Linea[] = [
  {
    n: '01',
    titulo: 'Aceites y grasas',
    texto: 'Fracciones y aceites refinados de palma y palmiste',
    items: [
      { nombre: 'Aceite de palma crudo (CPO)', detalle: 'Crude Palm Oil' },
      { nombre: 'Aceite de palmiste crudo (CPKO)', detalle: 'Crude Palm Kernel Oil' },
      { nombre: 'RBD Palm Oil', detalle: 'Refinado, blanqueado y desodorizado' },
      { nombre: 'RBD Palm Olein', detalle: 'Fracción líquida del aceite de palma' },
      { nombre: 'RBD Palm Stearin', detalle: 'Fracción sólida del aceite de palma' },
      { nombre: 'RBD Palm Kernel Oil', detalle: 'Aceite de palmiste refinado' },
    ],
  },
  {
    n: '02',
    titulo: 'Derivados',
    texto: 'Subproductos del procesamiento y refinación',
    items: [
      { nombre: 'PFAD', detalle: 'Palm Fatty Acid Distillate' },
      { nombre: 'Ácidos grasos', detalle: 'Para industria química y oleoquímica' },
      { nombre: 'Oleína', detalle: 'Fracción de menor punto de fusión' },
      { nombre: 'Estearina', detalle: 'Fracción de mayor punto de fusión' },
    ],
  },
  {
    n: '03',
    titulo: 'Biomasa',
    texto: 'Aprovechamiento integral del racimo y efluentes',
    items: [
      { nombre: 'Torta de palmiste (PKE)', detalle: 'Palm Kernel Expeller — alimento animal' },
      { nombre: 'Fibra', detalle: 'Cáscara de fibra de palma' },
      { nombre: 'Cascarilla', detalle: 'Cáscara de la nuez de palmiste' },
      { nombre: 'Raquis vacío (EFB)', detalle: 'Empty Fruit Bunches — compost y energía' },
      { nombre: 'POME', detalle: 'Efluentes de palma — biorremediación y biogás' },
    ],
  },
  {
    n: '04',
    titulo: 'Consumo',
    texto: 'Aceites comestibles y marcas para el mercado final',
    items: [
      { nombre: 'Aceites comestibles', detalle: 'Diversas presentaciones y formatos' },
      { nombre: 'Marcas propias', detalle: 'Líneas de marca de la empresa' },
      { nombre: 'Marcas privadas', detalle: 'Desarrollo para terceros y retail' },
    ],
  },
  {
    n: '05',
    titulo: 'Servicios',
    texto: 'Soluciones industriales y de cadena de valor',
    items: [
      { nombre: 'Producción', detalle: 'Extracción de aceite crudo' },
      { nombre: 'Industrialización', detalle: 'Procesamiento y fraccionamiento' },
      { nombre: 'Refinación', detalle: 'RBD y oleoquímica' },
      { nombre: 'Envasado', detalle: 'Líneas de envase y empaque' },
      { nombre: 'Maquila', detalle: 'Procesamiento por cuenta de terceros' },
      { nombre: 'Private label', detalle: 'Fabricación de marca propia del cliente' },
      { nombre: 'Comercio internacional', detalle: 'Compra y venta global' },
      { nombre: 'Exportaciones', detalle: 'Despachos a mercados exteriores' },
      { nombre: 'Logística global', detalle: 'Distribución y transporte internacional' },
    ],
  },
];
