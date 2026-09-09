const mongoose = require('mongoose');

const contratoSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
  },
  detalle_madera: {
    type: mongoose.Schema.Types.Mixed,
  },
  hash: {
    type: String,
  },
  firma: {
    type: String,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Contrato', contratoSchema);

