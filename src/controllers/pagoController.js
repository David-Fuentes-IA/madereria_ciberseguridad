const mongoose = require('mongoose');

const Producto = require('../models/Producto');
const LogAuditoria = require('../models/LogAuditoria');
const Pedido = require('../models/Pedido');

const construirItemPedido = (producto, productoId, cantidad, estado, motivo) => ({
  producto_id: producto?._id || productoId,
  tipo_madera: producto?.tipo_madera || 'Madera no disponible',
  marca: producto?.marca || 'Wood AI Corporation',
  dimensiones: producto?.dimensiones || 'No disponible',
  cantidad,
  precio_unitario: Number(producto?.precio) || 0,
  subtotal: (Number(producto?.precio) || 0) * cantidad,
  estado,
  ...(motivo ? { motivo } : {}),
});

const procesarPago = async (req, res) => {
  const cantidadNumerica = Number(req.body?.cantidad);
  const productoId = req.body?.producto_id;

  if (!Number.isFinite(cantidadNumerica) || cantidadNumerica <= 0) {
    return res.status(400).json({ mensaje: 'Cantidad inválida.' });
  }

  if (!mongoose.isValidObjectId(productoId)) {
    return res.status(400).json({ mensaje: 'Producto inválido.' });
  }

  const session = await mongoose.startSession();
  let resultado;

  try {
    await session.withTransaction(async () => {
      const producto = await Producto.findById(productoId).session(session);
      const tieneExistenciaLimitada = Boolean(
        producto &&
        producto.existencia !== null &&
        producto.existencia !== undefined &&
        Number.isFinite(Number(producto.existencia)),
      );

      let estadoDelPago = 'Aprobado';
      let motivo;
      let productoActualizado = producto;

      if (!producto) {
        estadoDelPago = 'Rechazado';
        motivo = 'Producto no encontrado.';
      } else if (tieneExistenciaLimitada && cantidadNumerica > Number(producto.existencia)) {
        estadoDelPago = 'Rechazado';
        motivo = 'Stock insuficiente';
      } else if (tieneExistenciaLimitada) {
        productoActualizado = await Producto.findOneAndUpdate(
          {
            _id: productoId,
            existencia: { $gte: cantidadNumerica },
          },
          { $inc: { existencia: -cantidadNumerica } },
          {
            new: true,
            runValidators: true,
            session,
          },
        );

        if (!productoActualizado) {
          estadoDelPago = 'Rechazado';
          motivo = 'Stock insuficiente';
        }
      }

      const logAuditoria = await LogAuditoria.create([{
        usuario_id: req.usuario._id,
        fecha_utc: new Date(),
        accion: 'INTENTO_PAGO',
        resultado: estadoDelPago,
        ip: req.ip,
      }], { session });

      const estadoPedido = estadoDelPago === 'Aprobado' ? 'APROBADO' : 'RECHAZADO';
      const pedido = await Pedido.create([{
        checkout_id: req.body.checkout_id || undefined,
        usuario_id: req.usuario._id,
        items: [construirItemPedido(productoActualizado || producto, productoId, cantidadNumerica, estadoPedido, motivo)],
        total: estadoPedido === 'APROBADO'
          ? (Number(productoActualizado?.precio || producto?.precio) || 0) * cantidadNumerica
          : 0,
        estado: estadoPedido,
        transaccion_id: logAuditoria[0]._id,
        fecha: new Date(),
        ip: req.ip,
        user_agent: req.get('user-agent'),
      }], { session });

      resultado = {
        estado: estadoDelPago,
        transaccion_id: logAuditoria[0]._id,
        pedido_id: pedido[0]._id,
        folio: pedido[0].folio,
        ...(motivo ? { mensaje: motivo } : {}),
      };
    });

    if (resultado.estado === 'Rechazado') {
      return res.status(400).json(resultado);
    }

    return res.status(200).json(resultado);
  } catch (error) {
    console.error(`Error al procesar pago: ${error.message}`);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  procesarPago,
};
