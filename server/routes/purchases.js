const express = require('express');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const StockLog = require('../models/StockLog');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { supplier, status, from, to, limit = 50 } = req.query;
    let query = {};
    if (supplier) query.supplier = { $regex: supplier, $options: 'i' };
    if (status) query.paymentStatus = status;
    if (from || to) {
      query.purchaseDate = {};
      if (from) query.purchaseDate.$gte = new Date(from);
      if (to) query.purchaseDate.$lte = new Date(to + 'T23:59:59');
    }
    const purchases = await Purchase.find(query).sort({ purchaseDate: -1 }).limit(parseInt(limit));
    res.json({ success: true, purchases });
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
      dateFilter = { purchaseDate: { $gte: start } };
    } else if (period === 'week') {
      const start = new Date(); start.setDate(start.getDate() - 7);
      dateFilter = { purchaseDate: { $gte: start } };
    } else if (period === 'month') {
      const start = new Date(); start.setMonth(start.getMonth() - 1);
      dateFilter = { purchaseDate: { $gte: start } };
    }

    const stats = await Purchase.aggregate([
      { $match: dateFilter },
      { $group: {
        _id: null,
        totalPurchases: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalPaid: { $sum: '$paidAmount' },
        pendingAmount: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } },
      }},
    ]);

    const pending = await Purchase.countDocuments({ paymentStatus: { $in: ['pending', 'partial'] } });

    res.json({
      success: true,
      stats: {
        ...stats[0] || { totalPurchases: 0, totalAmount: 0, totalPaid: 0, pendingAmount: 0 },
        pendingInvoices: pending,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { invoiceNumber, supplier, supplierPhone, items, totalAmount, paidAmount, paymentMethod, paymentStatus, note, purchaseDate, addToInventory } = req.body;

    const purchase = await Purchase.create({
      invoiceNumber, supplier, supplierPhone,
      items: items || [],
      totalAmount: Number(totalAmount) || 0,
      paidAmount: Number(paidAmount) || 0,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentStatus || 'paid',
      note,
      purchaseDate: purchaseDate || new Date(),
      addToInventory: addToInventory !== false,
    });

    if (addToInventory !== false && items?.length > 0) {
      for (const item of items) {
        if (item.product) {
          const product = await Product.findById(item.product);
          if (product) {
            const prev = product.stockQuantity;
            product.stockQuantity += Number(item.quantity) || 0;
            if (product.stockQuantity > 0) product.stockStatus = 'in_stock';
            if (product.stockQuantity <= product.lowStockThreshold) product.stockStatus = 'low_stock';
            await product.save();
            await StockLog.create({
              product: item.product, type: 'add',
              quantity: Number(item.quantity) || 0,
              note: `Purchase: ${invoiceNumber || 'N/A'} from ${supplier || 'Unknown'}`,
              previousStock: prev, newStock: product.stockQuantity,
            });
          }
        }
      }
    }

    res.status(201).json({ success: true, purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });
    res.json({ success: true, purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Purchase.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
