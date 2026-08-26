require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const res = await Product.updateMany(
    { costPrice: { $exists: false } },
    { $set: { costPrice: 0, unit: 'sqft', lowStockThreshold: 10 } }
  );
  console.log('Updated', res.modifiedCount, 'products');
  process.exit(0);
})();
