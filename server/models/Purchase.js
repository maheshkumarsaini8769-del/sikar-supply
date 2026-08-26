const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String, default: '' },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'sqft' },
  costPrice: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
});

const purchaseSchema = new mongoose.Schema({
  invoiceNumber: { type: String, default: '' },
  supplier: { type: String, default: '' },
  supplierPhone: { type: String, default: '' },
  items: [purchaseItemSchema],
  totalAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'bank_transfer', 'credit', 'other'], default: 'cash' },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'partial'], default: 'paid' },
  note: { type: String, default: '' },
  purchaseDate: { type: Date, default: Date.now },
  addToInventory: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
