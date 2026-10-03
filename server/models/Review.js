const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, default: 5 },
  text: { type: String, required: true },
  image: { type: String, default: '' },
  active: { type: Boolean, default: true },
  reply: { type: String, default: '' },
  replyDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
