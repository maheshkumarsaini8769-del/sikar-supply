const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, default: '' },
  category: { type: String, default: '' },
  active: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
