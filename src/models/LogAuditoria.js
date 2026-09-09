const mongoose = require('mongoose');

const logAuditoriaSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
  },
  fecha_utc: {
    type: Date,
  },
  accion: {
    type: String,
  },
  resultado: {
    type: String,
  },
  ip: {
    type: String,
  },
  hash_anterior: {
    type: String,
  },
  hash_actual: {
    type: String,
  },
});

const appendOnlyError = (next) => {
  next(new Error('LogAuditoria es append-only: no se permiten modificaciones ni eliminaciones.'));
};

logAuditoriaSchema.pre(
  ['updateOne', 'updateMany', 'findOneAndUpdate', 'replaceOne', 'findOneAndReplace'],
  appendOnlyError,
);

logAuditoriaSchema.pre(
  ['deleteOne', 'deleteMany', 'findOneAndDelete'],
  appendOnlyError,
);

module.exports = mongoose.model('LogAuditoria', logAuditoriaSchema);

