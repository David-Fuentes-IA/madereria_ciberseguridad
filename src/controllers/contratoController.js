const { generarFirma } = require('../utils/crypto');
const Contrato = require('../models/Contrato');

const generarContrato = async (req, res) => {
  try {
    if (!req.usuario || !req.usuario._id) {
      return res.status(401).json({
        mensaje: 'Usuario autenticado requerido.',
      });
    }

    const detalleMadera = req.body.detalle_madera || req.body;
    const evidencia = generarFirma(detalleMadera);

    const contrato = await Contrato.create({
      usuario_id: req.usuario._id,
      detalle_madera: detalleMadera,
      hash: evidencia.hash,
      firma: evidencia.firma,
      fecha: new Date(),
    });

    return res.status(201).json(contrato);
  } catch (error) {
    console.error(`Error al generar contrato: ${error.message}`);
    return res.status(500).json({
      mensaje: 'Error interno del servidor.',
    });
  }
};

const obtenerContratoPorId = async (req, res) => {
  try {
    // Vulnerabilidad controlada: no se valida la pertenencia del contrato al usuario.
    const contrato = await Contrato.findById(req.params.id);

    if (!contrato) {
      return res.status(404).json({
        mensaje: 'Contrato no encontrado.',
      });
    }

    return res.status(200).json(contrato);
  } catch (error) {
    console.error(`Error al obtener contrato: ${error.message}`);
    return res.status(500).json({
      mensaje: 'Error interno del servidor.',
    });
  }
};

module.exports = {
  generarContrato,
  obtenerContratoPorId,
};

