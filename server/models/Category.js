const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  active: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

categorySchema.pre('save', function() {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('Category', categorySchema);
