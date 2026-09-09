const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  tipo_madera: {
    type: String,
  },
  marca: {
    type: String,
  },
  color: {
    type: String,
  },
  textura: {
    type: String,
  },
  dimensiones: {
    type: String,
  },
  precio: {
    type: Number,
  },
  existencia: {
    type: Number,
  },
  estado: {
    type: String,
  },
});

module.exports = mongoose.model('Producto', productoSchema);

