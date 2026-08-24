const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: String,
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['whatsapp', 'cod', 'online'], default: 'whatsapp' },
  status: { type: String, enum: ['pending', 'confirmed', 'processing', 'completed', 'cancelled'], default: 'pending' },
  notes: { type: String, default: '' },
  whatsappMessage: { type: String, default: '' },
}, { timestamps: true });

orderSchema.pre('save', async function() {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `SHD-${String(count + 1).padStart(5, '0')}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);
