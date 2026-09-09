const express = require('express');

const Producto = require('../models/Producto');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const productos = await Producto.find();
    return res.status(200).json(productos);
  } catch (error) {
    console.error(`Error al obtener productos: ${error.message}`);
    return res.status(500).json({
      mensaje: 'Error interno del servidor.',
    });
  }
});

module.exports = router;

