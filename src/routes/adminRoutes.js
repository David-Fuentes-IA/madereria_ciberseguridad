const express = require('express');

const adminMiddleware = require('../middlewares/adminMiddleware');
const {
  obtenerResumen,
  listarUsuarios,
  listarPedidos,
  listarAuditoria,
  listarInventario,
  obtenerNotificaciones,
} = require('../controllers/adminController');

const router = express.Router();

router.use(...adminMiddleware);
router.get('/resumen', obtenerResumen);
router.get('/usuarios', listarUsuarios);
router.get('/pedidos', listarPedidos);
router.get('/auditoria', listarAuditoria);
router.get('/inventario', listarInventario);
router.get('/notificaciones', obtenerNotificaciones);

module.exports = router;
