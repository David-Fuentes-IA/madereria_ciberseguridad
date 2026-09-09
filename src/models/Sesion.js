const mongoose = require('mongoose');

const sesionSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    index: true,
  },
  token_hash: {
    type: String,
    required: true,
    select: false,
  },
  ip: {
    type: String,
  },
  user_agent: {
    type: String,
  },
  fecha_inicio: {
    type: Date,
    default: Date.now,
  },
  fecha_expiracion: {
    type: Date,
    required: true,
    index: true,
  },
  fecha_revocacion: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

sesionSchema.index({ usuario_id: 1, fecha_inicio: -1 });

module.exports = mongoose.model('Sesion', sesionSchema);
