const bcrypt = require('bcryptjs');
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');

const productosIniciales = [
  {
    tipo_madera: 'Roble',
    marca: 'M/S Reserva',
    color: 'Miel tostada',
    textura: 'Veta abierta',
    dimensiones: '2.40 × 0.30 × 0.025 m',
    precio: 500,
    existencia: 20,
    estado: 'activo',
  },
  {
    tipo_madera: 'Pino',
    marca: 'Línea Norte',
    color: 'Marfil cálido',
    textura: 'Veta suave',
    dimensiones: '2.40 × 0.20 × 0.025 m',
    precio: 280,
    existencia: 35,
    estado: 'activo',
  },
  {
    tipo_madera: 'Cedro',
    marca: 'Aurora Wood',
    color: 'Rojo mineral',
    textura: 'Veta lineal',
    dimensiones: '2.40 × 0.25 × 0.025 m',
    precio: 640,
    existencia: 12,
    estado: 'activo',
  },
  {
    tipo_madera: 'Caoba',
    marca: 'Reserva Imperial',
    color: 'Castaño rojizo',
    textura: 'Veta entrelazada',
    dimensiones: '2.10 × 0.30 × 0.030 m',
    precio: 1250,
    existencia: 9,
    estado: 'activo',
  },
  {
    tipo_madera: 'Nogal',
    marca: 'Dark Grain',
    color: 'Café profundo',
    textura: 'Veta fina',
    dimensiones: '2.10 × 0.25 × 0.025 m',
    precio: 980,
    existencia: 7,
    estado: 'activo',
  },
  {
    tipo_madera: 'Encino',
    marca: 'M/S Estructural',
    color: 'Arena dorada',
    textura: 'Poros marcados',
    dimensiones: '2.40 × 0.30 × 0.030 m',
    precio: 560,
    existencia: 18,
    estado: 'activo',
  },
  {
    tipo_madera: 'Teca',
    marca: 'Monzón Select',
    color: 'Miel ámbar',
    textura: 'Veta aceitosa',
    dimensiones: '2.10 × 0.20 × 0.025 m',
    precio: 1450,
    existencia: 6,
    estado: 'activo',
  },
  {
    tipo_madera: 'Fresno',
    marca: 'Lumen Grain',
    color: 'Blanco ceniza',
    textura: 'Veta elástica',
    dimensiones: '2.40 × 0.25 × 0.025 m',
    precio: 720,
    existencia: 10,
    estado: 'activo',
  },
  {
    tipo_madera: 'Olmo',
    marca: 'Río Antiguo',
    color: 'Oliva humo',
    textura: 'Veta ondulada',
    dimensiones: '2.10 × 0.30 × 0.030 m',
    precio: 880,
    existencia: 8,
    estado: 'activo',
  },
  {
    tipo_madera: 'Cerezo',
    marca: 'Cherry Core',
    color: 'Rojo cereza',
    textura: 'Veta satinada',
    dimensiones: '2.10 × 0.20 × 0.025 m',
    precio: 1160,
    existencia: 5,
    estado: 'activo',
  },
  {
    tipo_madera: 'Maple',
    marca: 'North Clear',
    color: 'Crema pálido',
    textura: 'Veta limpia',
    dimensiones: '2.40 × 0.25 × 0.025 m',
    precio: 890,
    existencia: 14,
    estado: 'activo',
  },
  {
    tipo_madera: 'Abedul',
    marca: 'Polar Layer',
    color: 'Blanco natural',
    textura: 'Veta uniforme',
    dimensiones: '2.40 × 0.20 × 0.018 m',
    precio: 610,
    existencia: 16,
    estado: 'activo',
  },
  {
    tipo_madera: 'Haya',
    marca: 'Europa Solid',
    color: 'Rosado claro',
    textura: 'Veta compacta',
    dimensiones: '2.10 × 0.25 × 0.025 m',
    precio: 690,
    existencia: 11,
    estado: 'activo',
  },
  {
    tipo_madera: 'Ébano',
    marca: 'Obsidian Select',
    color: 'Negro carbón',
    textura: 'Veta cerrada',
    dimensiones: '1.80 × 0.15 × 0.020 m',
    precio: 2400,
    existencia: 3,
    estado: 'activo',
  },
  {
    tipo_madera: 'Wengué',
    marca: 'Darkline Premium',
    color: 'Chocolate oscuro',
    textura: 'Veta contrastada',
    dimensiones: '2.10 × 0.20 × 0.025 m',
    precio: 1780,
    existencia: 4,
    estado: 'activo',
  },
];

const inicializarCatalogo = async () => {
  const operaciones = productosIniciales.map((producto) => {
    const { existencia, ...datosCatalogo } = producto;
    const opciones = {
      opciones_color: [...new Set([
        producto.color,
        `${producto.color} natural`,
        `${producto.color} mate`,
      ])],
      opciones_textura: [...new Set([
        producto.textura,
        'Cepillada',
        'Lijado fino',
      ])],
      opciones_dimensiones: [...new Set([
        producto.dimensiones,
        producto.dimensiones?.replace('0.30', '0.25'),
        producto.dimensiones?.replace('0.25', '0.30'),
      ].filter(Boolean))],
    };

    return {
      updateOne: {
        filter: { tipo_madera: producto.tipo_madera },
        update: {
          $set: { ...datosCatalogo, ...opciones },
          $setOnInsert: { existencia },
        },
        upsert: true,
      },
    };
  });

  await Producto.bulkWrite(operaciones);

  const tipos = productosIniciales.map(({ tipo_madera }) => tipo_madera);
  const totalCatalogo = await Producto.countDocuments({ tipo_madera: { $in: tipos } });
  console.log(`Catálogo inicial sincronizado: ${totalCatalogo}/${productosIniciales.length} productos.`);

  return totalCatalogo;
};

const inicializarAdministrador = async () => {
  const correo = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');

  if (!correo && !password) {
    console.log('Bootstrap de administrador omitido: define ADMIN_EMAIL y ADMIN_PASSWORD para habilitarlo.');
    return null;
  }

  if (!correo || !password) {
    throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD deben definirse juntos para crear el administrador inicial.');
  }

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD debe tener al menos 12 caracteres.');
  }

  const usuarioExistente = await Usuario.findOne({ correo });
  if (usuarioExistente) {
    if (usuarioExistente.rol !== 'admin') {
      throw new Error('ADMIN_EMAIL ya pertenece a un usuario que no es administrador. No se elevarán privilegios automáticamente.');
    }
    console.log(`Administrador inicial disponible: ${correo}`);
    return usuarioExistente;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const administrador = await Usuario.create({
    correo,
    password_hash,
    rol: 'admin',
    estado: 'activo',
    fecha_alta: new Date(),
  });

  console.log(`Administrador inicial creado: ${administrador.correo}`);
  return administrador;
};

module.exports = {
  inicializarCatalogo,
  inicializarAdministrador,
  productosIniciales,
};
