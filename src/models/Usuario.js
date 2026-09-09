const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  correo: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  rol: {
    type: String,
    enum: ['cliente', 'admin', 'contador'],
    default: 'cliente',
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo'],
    default: 'activo',
  },
  fecha_alta: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Usuario', usuarioSchema);
