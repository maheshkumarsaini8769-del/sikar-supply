const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['add', 'remove', 'adjust', 'sale'], required: true },
  quantity: { type: Number, required: true },
  note: { type: String, default: '' },
  previousStock: { type: Number, default: 0 },
  newStock: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('StockLog', stockLogSchema);
