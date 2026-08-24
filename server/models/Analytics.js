const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  type: { type: String, enum: ['click', 'search', 'order', 'pageview'], required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
}, { timestamps: true });

analyticsSchema.index({ createdAt: 1 });
analyticsSchema.index({ type: 1, createdAt: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
