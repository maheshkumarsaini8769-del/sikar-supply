const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, default: '' },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'sqft' },
  sellingPrice: { type: Number, default: 0 },
  costPrice: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
});

const saleSchema = new mongoose.Schema({
  saleNumber: { type: String, default: '' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, default: '' },
  customerPhone: { type: String, default: '' },
  items: [saleItemSchema],
  totalAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  finalAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'bank_transfer', 'online', 'credit', 'other'], default: 'cash' },
  saleType: { type: String, enum: ['online', 'cash', 'walk_in'], default: 'cash' },
  source: { type: String, enum: ['website', 'phone', 'walk_in', 'whatsapp'], default: 'walk_in' },
  note: { type: String, default: '' },
  saleDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
