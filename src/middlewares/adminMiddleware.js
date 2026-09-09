const authMiddleware = require('./authMiddleware');

const soloAdministrador = (req, res, next) => {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({
      mensaje: 'Acceso reservado para administradores.',
    });
  }

  return next();
};

module.exports = [authMiddleware, soloAdministrador];
