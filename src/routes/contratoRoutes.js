const express = require('express');

const authMiddleware = require('../middlewares/authMiddleware');
const {
  generarContrato,
  obtenerContratoPorId,
} = require('../controllers/contratoController');

const router = express.Router();

router.post('/', authMiddleware, generarContrato);
router.get('/:id', authMiddleware, obtenerContratoPorId);

module.exports = router;

