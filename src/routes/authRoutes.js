const express = require('express');

const { registro, login, cerrarSesion } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/registro', registro);
router.post('/login', login);
router.post('/logout', authMiddleware, cerrarSesion);

router.get('/perfil', authMiddleware, (req, res) => {
  return res.status(200).json({
    mensaje: 'Token válido.',
    usuario: req.usuario,
  });
});

module.exports = router;
