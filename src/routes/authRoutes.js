const express = require('express');

const { registro, login, cerrarSesion, verificarOtp } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { mensaje: 'Demasiadas solicitudes, por favor intente nuevamente más tarde.' }
});

const router = express.Router();

router.post('/registro', authLimiter, registro);
router.post('/login', authLimiter, login);
router.post('/verificar-otp', authLimiter, verificarOtp);
router.post('/logout', authMiddleware, cerrarSesion);

router.get('/perfil', authMiddleware, (req, res) => {
  return res.status(200).json({
    mensaje: 'Token válido.',
    usuario: req.usuario,
  });
});

module.exports = router;
