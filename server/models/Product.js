const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  price: { type: Number, default: 0 },
  salePrice: { type: Number, default: 0 },
  costPrice: { type: Number, default: 0 },
  sku: { type: String, default: '' },
  unit: { type: String, default: 'sqft' },
  stockStatus: { type: String, enum: ['in_stock', 'low_stock', 'out_of_stock'], default: 'in_stock' },
  stockQuantity: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false },
  }],
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  specs: [{ label: String, value: String }],
}, { timestamps: true });

productSchema.pre('save', function() {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('Product', productSchema);
