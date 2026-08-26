const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

let connected = false;

const connectDB = async () => {
  if (connected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    connected = true;
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
};

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Lazy-connect middleware
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use('/api/auth', require('../server/routes/auth'));
app.use('/api/products', require('../server/routes/products'));
app.use('/api/categories', require('../server/routes/categories'));
app.use('/api/orders', require('../server/routes/orders'));
app.use('/api/settings', require('../server/routes/settings'));
app.use('/api/media', require('../server/routes/media'));
app.use('/api/gallery', require('../server/routes/gallery'));
app.use('/api/analytics', require('../server/routes/analytics'));
app.use('/api/reviews', require('../server/routes/reviews'));
app.use('/api/stock', require('../server/routes/stock'));
app.use('/api/customers', require('../server/routes/customers'));
app.use('/api/purchases', require('../server/routes/purchases'));
app.use('/api/sales', require('../server/routes/sales'));
app.use('/api/profitloss', require('../server/routes/profitloss'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server running on Vercel' });
});

module.exports = app;
