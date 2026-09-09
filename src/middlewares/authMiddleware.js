const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
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
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decodificado;
    return next();
  } catch (error) {
    return res.status(401).json({
      mensaje: 'Token inválido o expirado.',
    });
  }
};

module.exports = authMiddleware;

