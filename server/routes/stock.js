const express = require('express');
const Product = require('../models/Product');
const StockLog = require('../models/StockLog');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/inventory', protect, async (req, res) => {
  try {
    const { search, status, low } = req.query;
    let query = { active: true };
    if (search) query.name = { $regex: search, $options: 'i' };
    if (status) query.stockStatus = status;
    if (low === 'true') {
      query.$expr = { $lte: ['$stockQuantity', '$lowStockThreshold'] };
    }
    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ stockQuantity: 1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/add', protect, async (req, res) => {
  try {
    const { productId, quantity, note } = req.body;
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Product and positive quantity required' });
    }
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const previousStock = product.stockQuantity;
    product.stockQuantity += Number(quantity);
    if (product.stockQuantity > 0) product.stockStatus = 'in_stock';
    else if (product.stockQuantity === 0) product.stockStatus = 'out_of_stock';
    if (product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold) product.stockStatus = 'low_stock';
    await product.save();

    await StockLog.create({
      product: productId, type: 'add', quantity: Number(quantity),
      note: note || 'Stock added', previousStock, newStock: product.stockQuantity,
    });

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/remove', protect, async (req, res) => {
  try {
    const { productId, quantity, note } = req.body;
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Product and positive quantity required' });
    }
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const previousStock = product.stockQuantity;
    product.stockQuantity = Math.max(0, product.stockQuantity - Number(quantity));
    if (product.stockQuantity === 0) product.stockStatus = 'out_of_stock';
    else if (product.stockQuantity <= product.lowStockThreshold) product.stockStatus = 'low_stock';
    else product.stockStatus = 'in_stock';
    await product.save();

    await StockLog.create({
      product: productId, type: 'remove', quantity: Number(quantity),
      note: note || 'Stock removed', previousStock, newStock: product.stockQuantity,
    });

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/adjust', protect, async (req, res) => {
  try {
    const { productId, quantity, note } = req.body;
    if (!productId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Product and quantity required' });
    }
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const previousStock = product.stockQuantity;
    product.stockQuantity = Math.max(0, Number(quantity));
    if (product.stockQuantity === 0) product.stockStatus = 'out_of_stock';
    else if (product.stockQuantity <= product.lowStockThreshold) product.stockStatus = 'low_stock';
    else product.stockStatus = 'in_stock';
    await product.save();

    await StockLog.create({
      product: productId, type: 'adjust', quantity: Math.abs(Number(quantity) - previousStock),
      note: note || 'Stock adjusted', previousStock, newStock: product.stockQuantity,
    });

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/logs', protect, async (req, res) => {
  try {
    const { product, type, limit = 50 } = req.query;
    let query = {};
    if (product) query.product = product;
    if (type) query.type = type;
    const logs = await StockLog.find(query)
      .populate('product', 'name sku')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/alerts', protect, async (req, res) => {
  try {
    const products = await Product.find({
      active: true,
      $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
    }).populate('category', 'name').sort({ stockQuantity: 1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats', protect, async (req, res) => {
  try {
    const [totalProducts, inStock, lowStock, outOfStock, totalValue] = await Promise.all([
      Product.countDocuments({ active: true }),
      Product.countDocuments({ active: true, stockStatus: 'in_stock' }),
      Product.countDocuments({ active: true, stockStatus: 'low_stock' }),
      Product.countDocuments({ active: true, stockStatus: 'out_of_stock' }),
      Product.aggregate([
        { $match: { active: true } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$stockQuantity', '$costPrice'] } } } },
      ]),
    ]);
    res.json({
      success: true,
      stats: {
        totalProducts, inStock, lowStock, outOfStock,
        stockValue: totalValue[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
