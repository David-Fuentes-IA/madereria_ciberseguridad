const Producto = require('../models/Producto');
const LogAuditoria = require('../models/LogAuditoria');

const procesarPago = async (req, res) => {
  try {
    const { producto_id, cantidad } = req.body;
    const cantidadNumerica = Number(cantidad);

    if (!Number.isFinite(cantidadNumerica) || cantidadNumerica <= 0) {
      return res.status(400).json({
        mensaje: 'Cantidad inválida.',
      });
    }

    const producto = await Producto.findById(producto_id);

    if (!producto || cantidadNumerica > producto.existencia) {
      return res.status(400).json({
        mensaje: 'Stock insuficiente',
      });
    }

    const resultadoPasarela = Math.random();
    const estadoDelPago = resultadoPasarela > 0.2 ? 'Aprobado' : 'Rechazado';

    if (estadoDelPago === 'Aprobado') {
      const productoActualizado = await Producto.findOneAndUpdate(
        {
          _id: producto_id,
          existencia: { $gte: cantidadNumerica },
        },
        {
          $inc: { existencia: -cantidadNumerica },
        },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!productoActualizado) {
        return res.status(400).json({
          mensaje: 'Stock insuficiente',
        });
      }

      producto.existencia = productoActualizado.existencia;
    }

    const logAuditoria = await LogAuditoria.create({
      usuario_id: req.usuario._id,
      fecha_utc: new Date(),
      accion: 'INTENTO_PAGO',
      resultado: estadoDelPago,
      ip: req.ip,
    });

    return res.status(200).json({
      estado: estadoDelPago,
      transaccion_id: logAuditoria._id,
    });
  } catch (error) {
    console.error(`Error al procesar pago: ${error.message}`);
    return res.status(500).json({
      mensaje: 'Error interno del servidor.',
    });
  }
};

module.exports = {
  procesarPago,
};
