const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  url: { type: String, required: true },
  alt: { type: String, default: '' },
  section: { type: String, default: 'general' },
  mimeType: { type: String },
  size: { type: Number },
  displayOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Media', mediaSchema);
