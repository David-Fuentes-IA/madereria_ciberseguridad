const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  correo: {
    type: String,
    unique: true,
  },
  password_hash: {
    type: String,
  },
  rol: {
    type: String,
    default: 'cliente',
  },
  estado: {
    type: String,
  },
  fecha_alta: {
    type: Date,
  },
});

module.exports = mongoose.model('Usuario', usuarioSchema);

