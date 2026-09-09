const mongoose = require('mongoose');

const pedidoItemSchema = new mongoose.Schema({
  producto_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
  },
  tipo_madera: {
    type: String,
    required: true,
  },
  marca: String,
  dimensiones: String,
  caracteristicas: {
    type: mongoose.Schema.Types.Mixed,
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1,
  },
  precio_unitario: {
    type: Number,
    required: true,
    min: 0,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  estado: {
    type: String,
    enum: ['APROBADO', 'RECHAZADO'],
    required: true,
  },
  motivo: String,
}, { _id: false });

const pedidoSchema = new mongoose.Schema({
  folio: {
    type: String,
    unique: true,
    index: true,
  },
  checkout_id: {
    type: String,
    index: true,
  },
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    index: true,
  },
  sesion_id: {
    type: String,
    index: true,
  },
  items: {
    type: [pedidoItemSchema],
    required: true,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  estado: {
    type: String,
    enum: ['APROBADO', 'RECHAZADO'],
    required: true,
    index: true,
  },
  transaccion_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LogAuditoria',
  },
  fecha: {
    type: Date,
    default: Date.now,
    index: true,
  },
  ip: String,
  user_agent: String,
}, {
  timestamps: true,
});

pedidoSchema.index({ usuario_id: 1, fecha: -1 });
pedidoSchema.index({ estado: 1, fecha: -1 });

pedidoSchema.pre('validate', function assignFolio(next) {
  if (!this.folio) {
    this.folio = `WAI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Pedido', pedidoSchema);
