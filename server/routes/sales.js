const express = require('express');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const StockLog = require('../models/StockLog');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { saleType, source, payment, from, to, limit = 50 } = req.query;
    let query = {};
    if (saleType) query.saleType = saleType;
    if (source) query.source = source;
    if (payment) query.paymentMethod = payment;
    if (from || to) {
      query.saleDate = {};
      if (from) query.saleDate.$gte = new Date(from);
      if (to) query.saleDate.$lte = new Date(to + 'T23:59:59');
    }
    const sales = await Sale.find(query).sort({ saleDate: -1 }).limit(parseInt(limit));
    res.json({ success: true, sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats', protect, async (req, res) => {
  try {
    const { period } = req.query;
    let dateFilter = {};
    if (period === 'today') {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      dateFilter = { saleDate: { $gte: start } };
    } else if (period === 'week') {
      const start = new Date(); start.setDate(start.getDate() - 7);
      dateFilter = { saleDate: { $gte: start } };
    } else if (period === 'month') {
      const start = new Date(); start.setMonth(start.getMonth() - 1);
      dateFilter = { saleDate: { $gte: start } };
    }

    const [totals, byType, bySource, byPayment, topProducts] = await Promise.all([
      Sale.aggregate([
        { $match: dateFilter },
        { $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$finalAmount' },
          totalDiscount: { $sum: '$discount' },
          avgSale: { $avg: '$finalAmount' },
        }},
      ]),
      Sale.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$saleType', count: { $sum: 1 }, revenue: { $sum: '$finalAmount' } } },
      ]),
      Sale.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$source', count: { $sum: 1 }, revenue: { $sum: '$finalAmount' } } },
      ]),
      Sale.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$finalAmount' } } },
      ]),
      Sale.aggregate([
        { $match: dateFilter },
        { $unwind: '$items' },
        { $group: { _id: '$items.productName', qty: { $sum: '$items.quantity' }, revenue: { $sum: '$items.total' } } },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const recentSales = await Sale.find(dateFilter).sort({ saleDate: -1 }).limit(10);

    res.json({
      success: true,
      stats: {
        ...totals[0] || { totalSales: 0, totalRevenue: 0, totalDiscount: 0, avgSale: 0 },
        byType, bySource, byPayment, topProducts, recentSales,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { customerName, customerPhone, customerPhone: cPhone, items, totalAmount, discount, finalAmount, paymentMethod, saleType, source, note, saleDate } = req.body;

    let customer = null;
    if (customerPhone) {
      customer = await Customer.findOne({ phone: customerPhone });
      if (!customer) {
        customer = await Customer.create({ name: customerName || 'Walk-in', phone: customerPhone });
      }
    }

    const sale = await Sale.create({
      saleNumber: 'SAL-' + Date.now().toString(36).toUpperCase(),
      customer: customer?._id,
      customerName: customerName || customer?.name || '',
      customerPhone: customerPhone || '',
      items: items || [],
      totalAmount: Number(totalAmount) || 0,
      discount: Number(discount) || 0,
      finalAmount: Number(finalAmount) || Number(totalAmount) || 0,
      paymentMethod: paymentMethod || 'cash',
      saleType: saleType || 'cash',
      source: source || 'walk_in',
      note,
      saleDate: saleDate || new Date(),
    });

    if (customer) {
      customer.totalOrders += 1;
      customer.totalSpent += Number(finalAmount) || Number(totalAmount) || 0;
      await customer.save();
    }

    if (items?.length > 0) {
      for (const item of items) {
        if (item.product) {
          const product = await Product.findById(item.product);
          if (product) {
            const prev = product.stockQuantity;
            product.stockQuantity = Math.max(0, product.stockQuantity - (Number(item.quantity) || 0));
            if (product.stockQuantity === 0) product.stockStatus = 'out_of_stock';
            else if (product.stockQuantity <= product.lowStockThreshold) product.stockStatus = 'low_stock';
            else product.stockStatus = 'in_stock';
            await product.save();
            await StockLog.create({
              product: item.product, type: 'sale',
              quantity: Number(item.quantity) || 0,
              note: `Sale: ${sale.saleNumber} to ${customerName || 'Walk-in'}`,
              previousStock: prev, newStock: product.stockQuantity,
            });
          }
        }
      }
    }

    res.status(201).json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.json({ success: true, sale });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Sale.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
