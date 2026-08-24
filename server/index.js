require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/media', require('./routes/media'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/reviews', require('./routes/reviews'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
