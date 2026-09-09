const Usuario = require('../models/Usuario');
const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const LogAuditoria = require('../models/LogAuditoria');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parsePagination = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
};

const addDateFilter = (filter, query, field = 'fecha') => {
  const range = {};
  if (query.desde) {
    const from = new Date(query.desde);
    if (!Number.isNaN(from.getTime())) range.$gte = from;
  }
  if (query.hasta) {
    const to = new Date(query.hasta);
    if (!Number.isNaN(to.getTime())) {
      to.setHours(23, 59, 59, 999);
      range.$lte = to;
    }
  }
  if (Object.keys(range).length) filter[field] = range;
};

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
});

const obtenerResumen = async (req, res) => {
  try {
    const pedidoFilter = {};
    const auditoriaFilter = {};
    addDateFilter(pedidoFilter, req.query);
    addDateFilter(auditoriaFilter, req.query, 'fecha_utc');

    const [
      totalUsuarios,
      clientes,
      administradores,
      totalPedidos,
      pedidosAprobados,
      pedidosRechazados,
      ingresos,
      productosActivos,
      stockBajo,
      auditoriaReciente,
    ] = await Promise.all([
      Usuario.countDocuments(),
      Usuario.countDocuments({ rol: 'cliente' }),
      Usuario.countDocuments({ rol: 'admin' }),
      Pedido.countDocuments(pedidoFilter),
      Pedido.countDocuments({ ...pedidoFilter, estado: 'APROBADO' }),
      Pedido.countDocuments({ ...pedidoFilter, estado: 'RECHAZADO' }),
      Pedido.aggregate([
        { $match: { ...pedidoFilter, estado: 'APROBADO' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Producto.countDocuments({ estado: 'activo' }),
      Producto.countDocuments({ estado: 'activo', existencia: { $lte: 5 } }),
      LogAuditoria.find(auditoriaFilter)
        .sort({ fecha_utc: -1 })
        .limit(8)
        .populate('usuario_id', 'correo rol')
        .lean(),
    ]);

    return res.status(200).json({
      actualizado_en: new Date(),
      usuarios: {
        total: totalUsuarios,
        clientes,
        administradores,
      },
      pedidos: {
        total: totalPedidos,
        aprobados: pedidosAprobados,
        rechazados: pedidosRechazados,
      },
      ingresos_aprobados: ingresos[0]?.total || 0,
      inventario: {
        productos_activos: productosActivos,
        stock_bajo: stockBajo,
      },
      auditoria_reciente: auditoriaReciente,
    });
  } catch (error) {
    console.error(`Error al obtener resumen administrativo: ${error.message}`);
    return res.status(500).json({ mensaje: 'No fue posible cargar el resumen administrativo.' });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};
    if (req.query.rol && ['cliente', 'admin', 'contador'].includes(req.query.rol)) filter.rol = req.query.rol;
    if (req.query.estado && ['activo', 'inactivo'].includes(req.query.estado)) filter.estado = req.query.estado;
    if (req.query.buscar) {
      filter.correo = { $regex: escapeRegex(req.query.buscar.slice(0, 80)), $options: 'i' };
    }

    const [usuarios, total] = await Promise.all([
      Usuario.find(filter, '-password_hash -__v').sort({ fecha_alta: -1 }).skip(skip).limit(limit).lean(),
      Usuario.countDocuments(filter),
    ]);

    return res.status(200).json({
      datos: usuarios,
      paginacion: buildPagination(page, limit, total),
    });
  } catch (error) {
    console.error(`Error al listar usuarios: ${error.message}`);
    return res.status(500).json({ mensaje: 'No fue posible cargar los usuarios.' });
  }
};

const listarPedidos = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};
    if (req.query.estado && ['APROBADO', 'RECHAZADO'].includes(req.query.estado)) filter.estado = req.query.estado;
    if (req.query.usuario_id) filter.usuario_id = req.query.usuario_id;
    if (req.query.buscar) filter.folio = { $regex: escapeRegex(req.query.buscar.slice(0, 80)), $options: 'i' };
    addDateFilter(filter, req.query);

    const [pedidos, total] = await Promise.all([
      Pedido.find(filter)
        .sort({ fecha: -1 })
        .skip(skip)
        .limit(limit)
        .populate('usuario_id', 'correo rol estado')
        .lean(),
      Pedido.countDocuments(filter),
    ]);

    return res.status(200).json({
      datos: pedidos,
      paginacion: buildPagination(page, limit, total),
    });
  } catch (error) {
    console.error(`Error al listar pedidos: ${error.message}`);
    return res.status(500).json({ mensaje: 'No fue posible cargar los pedidos.' });
  }
};

const listarAuditoria = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = {};
    if (req.query.accion) filter.accion = req.query.accion.slice(0, 80);
    if (req.query.resultado) filter.resultado = req.query.resultado.slice(0, 80);
    if (req.query.usuario_id) filter.usuario_id = req.query.usuario_id;
    addDateFilter(filter, req.query, 'fecha_utc');

    const [logs, total] = await Promise.all([
      LogAuditoria.find(filter)
        .sort({ fecha_utc: -1 })
        .skip(skip)
        .limit(limit)
        .populate('usuario_id', 'correo rol')
        .lean(),
      LogAuditoria.countDocuments(filter),
    ]);

    return res.status(200).json({
      datos: logs,
      paginacion: buildPagination(page, limit, total),
    });
  } catch (error) {
    console.error(`Error al listar auditoría: ${error.message}`);
    return res.status(500).json({ mensaje: 'No fue posible cargar la auditoría.' });
  }
};

const listarInventario = async (_req, res) => {
  try {
    const productos = await Producto.find({}, '-__v').sort({ tipo_madera: 1 }).lean();
    return res.status(200).json({ datos: productos });
  } catch (error) {
    console.error(`Error al listar inventario administrativo: ${error.message}`);
    return res.status(500).json({ mensaje: 'No fue posible cargar el inventario.' });
  }
};

module.exports = {
  obtenerResumen,
  listarUsuarios,
  listarPedidos,
  listarAuditoria,
  listarInventario,
};
