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

const crypto = require('crypto');

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

logAuditoriaSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const ultimoLog = await this.constructor.findOne().sort({ _id: -1 }).exec();
      this.hash_anterior = ultimoLog ? ultimoLog.hash_actual : 'GENESIS_BLOCK';
      
      const payload = `${this.hash_anterior}|${this.fecha_utc?.toISOString()}|${this.accion}|${this.usuario_id}`;
      this.hash_actual = crypto.createHash('sha256').update(payload).digest('hex');
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('LogAuditoria', logAuditoriaSchema);

