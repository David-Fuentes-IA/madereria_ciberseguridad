const jwt = require('jsonwebtoken');
const Sesion = require('../models/Sesion');
const { JWT_SECRET } = require('../config/auth');

const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      mensaje: 'Token de autorización requerido.',
    });
  }

  const token = authorization.slice('Bearer '.length).trim();

  if (!token) {
    return res.status(401).json({
      mensaje: 'Token de autorización requerido.',
    });
  }

  try {
    const decodificado = jwt.verify(token, JWT_SECRET);

    if (!decodificado.sid) {
      return res.status(401).json({
        mensaje: 'La sesión debe renovarse.',
      });
    }

    const sesion = await Sesion.findOne({
      _id: decodificado.sid,
      usuario_id: decodificado._id,
      fecha_revocacion: null,
      fecha_expiracion: { $gt: new Date() },
    });

    if (!sesion) {
      return res.status(401).json({
        mensaje: 'La sesión ya no está activa.',
      });
    }

    req.usuario = decodificado;
    return next();
  } catch (error) {
    return res.status(401).json({
      mensaje: 'Token inválido o expirado.',
    });
  }
};

module.exports = authMiddleware;
