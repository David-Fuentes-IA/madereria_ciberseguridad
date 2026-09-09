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
  // Opciones comerciales de corte/acabado. El precio y el stock siguen
  // perteneciendo al producto base; las opciones solo personalizan la línea.
  opciones_color: {
    type: [String],
    default: undefined,
  },
  opciones_textura: {
    type: [String],
    default: undefined,
  },
  opciones_dimensiones: {
    type: [String],
    default: undefined,
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
