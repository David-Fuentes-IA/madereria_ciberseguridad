const express = require('express');

const authMiddleware = require('../middlewares/authMiddleware');
const { procesarPago } = require('../controllers/pagoController');

const router = express.Router();

router.post('/checkout', authMiddleware, procesarPago);

module.exports = router;

