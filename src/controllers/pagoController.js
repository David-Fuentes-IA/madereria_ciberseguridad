const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const LogAuditoria = require('../models/LogAuditoria');
const Pedido = require('../models/Pedido');

class ConflictoStockError extends Error {
  constructor(message = 'Stock insuficiente') {
    super(message);
    this.name = 'ConflictoStockError';
    this.code = 'STOCK_CONFLICT';
  }
}

const normalizarCaracteristicas = (caracteristicas) => {
  if (!caracteristicas || typeof caracteristicas !== 'object' || Array.isArray(caracteristicas)) return undefined;

  const permitidas = ['color', 'textura', 'dimensiones'];
  const resultado = {};
  permitidas.forEach((campo) => {
    if (typeof caracteristicas[campo] === 'string' && caracteristicas[campo].trim()) {
      resultado[campo] = caracteristicas[campo].trim().slice(0, 120);
    }
  });
  return Object.keys(resultado).length ? resultado : undefined;
};

const normalizarCarrito = (body) => {
  const source = Array.isArray(body.carrito) && body.carrito.length
    ? body.carrito
    : [{
      producto_id: body.producto_id,
      cantidad: body.cantidad,
      caracteristicas: body.caracteristicas,
    }];

  if (source.length > 50) throw new Error('El carrito supera el máximo de líneas permitido.');

  const acumulado = new Map();
  source.forEach((item) => {
    const productoId = item?.producto_id;
    const cantidad = Number(item?.cantidad);
    if (!mongoose.isValidObjectId(productoId) || !Number.isInteger(cantidad) || cantidad <= 0) {
      throw new Error('El carrito contiene un producto o cantidad inválidos.');
    }

    const key = String(productoId);
    const existente = acumulado.get(key);
    acumulado.set(key, {
      producto_id: productoId,
      cantidad: (existente?.cantidad || 0) + cantidad,
      caracteristicas: existente?.caracteristicas || normalizarCaracteristicas(item?.caracteristicas),
    });
  });

  return [...acumulado.values()];
};

const construirItemPedido = (producto, item, estado, motivo) => ({
  producto_id: producto?._id || item.producto_id,
  tipo_madera: producto?.tipo_madera || 'Madera no disponible',
  marca: producto?.marca || 'Wood AI Corporation',
  dimensiones: producto?.dimensiones || 'No disponible',
  caracteristicas: item.caracteristicas,
  cantidad: item.cantidad,
  precio_unitario: Number(producto?.precio) || 0,
  subtotal: estado === 'APROBADO'
    ? (Number(producto?.precio) || 0) * item.cantidad
    : 0,
  estado,
  ...(motivo ? { motivo } : {}),
});

const crearRegistroOperacion = async ({ session, req, items, productos, estado, motivo }) => {
  const productosPorId = new Map(productos.map((producto) => [String(producto._id), producto]));
  const itemsPedido = items.map((item) => {
    const producto = productosPorId.get(String(item.producto_id));
    const motivoLinea = !producto ? 'Producto no encontrado.' : motivo || undefined;
    return construirItemPedido(producto, item, estado, motivoLinea);
  });
  const total = estado === 'APROBADO'
    ? itemsPedido.reduce((sum, item) => sum + item.subtotal, 0)
    : 0;
  const fecha = new Date();

  const logs = await LogAuditoria.create([{
    usuario_id: req.usuario._id,
    fecha_utc: fecha,
    accion: 'INTENTO_PAGO',
    resultado: estado === 'APROBADO' ? 'Aprobado' : 'Rechazado',
    ip: req.ip,
  }], { session });

  const pedidos = await Pedido.create([{
    checkout_id: req.body.checkout_id || undefined,
    usuario_id: req.usuario._id,
    sesion_id: req.usuario.sid,
    items: itemsPedido,
    total,
    estado,
    transaccion_id: logs[0]._id,
    fecha,
    ip: req.ip,
    user_agent: req.get('user-agent'),
  }], { session });

  const pedido = pedidos[0];
  return {
    estado: estado === 'APROBADO' ? 'Aprobado' : 'Rechazado',
    transaccion_id: logs[0]._id,
    pedido_id: pedido._id,
    folio: pedido.folio,
    total,
    fecha,
    items: pedido.items,
    ...(motivo ? { mensaje: motivo } : {}),
    factura_digital: {
      folio: pedido.folio,
      total,
      fecha,
      estado,
      transaccion_id: logs[0]._id,
      items: pedido.items,
    },
  };
};

const verificarReautenticacion = async (req) => {
  if (typeof req.body?.password !== 'string' || !req.body.password) return false;
  const usuario = await Usuario.findById(req.usuario._id).select('+password_hash');
  return Boolean(usuario && await bcrypt.compare(req.body.password, usuario.password_hash));
};

const procesarPago = async (req, res) => {
  let items;
  try {
    items = normalizarCarrito(req.body || {});
  } catch (error) {
    return res.status(400).json({ mensaje: error.message });
  }

  try {
    const passwordValida = await verificarReautenticacion(req);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'La contraseña no autoriza esta compra.' });
    }
  } catch (error) {
    console.error(`Error al reautenticar el pago: ${error.message}`);
    return res.status(500).json({ mensaje: 'No fue posible validar la autorización del pago.' });
  }

  const session = await mongoose.startSession();
  let resultado;

  try {
    await session.withTransaction(async () => {
      const ids = items.map((item) => item.producto_id);
      const productos = await Producto.find({ _id: { $in: ids } }).session(session);
      const productosPorId = new Map(productos.map((producto) => [String(producto._id), producto]));
      const lineaRechazada = items.find((item) => {
        const producto = productosPorId.get(String(item.producto_id));
        if (!producto) return true;
        const existenciaLimitada = producto.existencia !== null &&
          producto.existencia !== undefined &&
          Number.isFinite(Number(producto.existencia));
        // La única condición de rechazo por stock es cantidad > existencia.
        return existenciaLimitada && item.cantidad > Number(producto.existencia);
      });

      if (lineaRechazada) {
        const producto = productosPorId.get(String(lineaRechazada.producto_id));
        resultado = await crearRegistroOperacion({
          session,
          req,
          items,
          productos,
          estado: 'RECHAZADO',
          motivo: producto ? 'Stock insuficiente' : 'Producto no encontrado.',
        });
        return;
      }

      const productosActualizados = [];
      for (const item of items) {
        const productoBase = productosPorId.get(String(item.producto_id));
        const existenciaLimitada = productoBase.existencia !== null &&
          productoBase.existencia !== undefined &&
          Number.isFinite(Number(productoBase.existencia));

        if (!existenciaLimitada) {
          // Un inventario sin existencia numérica se considera ilimitado y no se decrementa.
          productosActualizados.push(productoBase);
          continue;
        }

        const productoActualizado = await Producto.findOneAndUpdate(
          {
            _id: item.producto_id,
            existencia: { $gte: item.cantidad },
          },
          { $inc: { existencia: -item.cantidad } },
          { new: true, runValidators: true, session },
        );

        if (!productoActualizado) throw new ConflictoStockError();
        productosActualizados.push(productoActualizado);
      }

      resultado = await crearRegistroOperacion({
        session,
        req,
        items,
        productos: productosActualizados,
        estado: 'APROBADO',
      });
    });

    if (resultado.estado === 'Rechazado') return res.status(400).json(resultado);
    return res.status(200).json(resultado);
  } catch (error) {
    if (error.code === 'STOCK_CONFLICT') {
      try {
        const rechazoSession = await mongoose.startSession();
        try {
          await rechazoSession.withTransaction(async () => {
            const productos = await Producto.find({ _id: { $in: items.map((item) => item.producto_id) } }).session(rechazoSession);
            resultado = await crearRegistroOperacion({
              session: rechazoSession,
              req,
              items,
              productos,
              estado: 'RECHAZADO',
              motivo: 'Stock insuficiente',
            });
          });
        } finally {
          await rechazoSession.endSession();
        }
        return res.status(400).json(resultado);
      } catch (rejectionError) {
        console.error(`Error al registrar el rechazo de stock: ${rejectionError.message}`);
      }
    }

    console.error(`Error al procesar pago: ${error.message}`);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  procesarPago,
};
