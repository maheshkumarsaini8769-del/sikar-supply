const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, default: 5 },
  text: { type: String, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
