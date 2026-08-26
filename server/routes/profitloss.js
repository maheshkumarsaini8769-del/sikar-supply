const express = require('express');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { period, from, to } = req.query;
    let dateFilter = {};

    if (period === 'today') {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: start } };
    } else if (period === 'week') {
      const start = new Date(); start.setDate(start.getDate() - 7);
      dateFilter = { createdAt: { $gte: start } };
    } else if (period === 'month') {
      const start = new Date(); start.setMonth(start.getMonth() - 1);
      dateFilter = { createdAt: { $gte: start } };
    } else if (period === 'year') {
      const start = new Date(); start.setFullYear(start.getFullYear() - 1);
      dateFilter = { createdAt: { $gte: start } };
    } else if (from || to) {
      dateFilter.createdAt = {};
      if (from) dateFilter.createdAt.$gte = new Date(from);
      if (to) dateFilter.createdAt.$lte = new Date(to + 'T23:59:59');
    }

    // Sales aggregation
    const salesData = await Sale.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' },
          totalSales: { $sum: 1 },
          totalDiscount: { $sum: '$discount' },
          totalCostFromSales: { $sum: { $multiply: ['$items.costPrice', '$items.quantity'] } },
          totalSellingFromSales: { $sum: '$items.total' },
        }
      }
    ]);

    // Profit from sales items
    const salesProfit = await Sale.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$items.total' },
          totalCost: { $sum: { $multiply: ['$items.costPrice', '$items.quantity'] } },
        }
      }
    ]);

    // Purchase aggregation
    const purchaseData = await Purchase.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: 1 },
          totalPurchaseAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
        }
      }
    ]);

    // Product-wise profit
    const productProfit = await Sale.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productName',
          productId: { $first: '$items.product' },
          qtySold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.total' },
          cost: { $sum: { $multiply: ['$items.costPrice', '$items.quantity'] } },
        }
      },
      {
        $addFields: {
          profit: { $subtract: ['$revenue', '$cost'] },
          margin: {
            $cond: {
              if: { $gt: ['$revenue', 0] },
              then: { $multiply: [{ $divide: [{ $subtract: ['$revenue', '$cost'] }, '$revenue'] }, 100] },
              else: 0,
            }
          },
        }
      },
      { $sort: { profit: -1 } },
    ]);

    // Daily profit trend
    const dailyTrend = await Sale.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$items.total' },
          cost: { $sum: { $multiply: ['$items.costPrice', '$items.quantity'] } },
        }
      },
      {
        $addFields: {
          profit: { $subtract: ['$revenue', '$cost'] },
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    // Monthly profit trend
    const monthlyTrend = await Sale.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$items.total' },
          cost: { $sum: { $multiply: ['$items.costPrice', '$items.quantity'] } },
        }
      },
      {
        $addFields: {
          profit: { $subtract: ['$revenue', '$cost'] },
        }
      },
      { $sort: { _id: 1 } },
    ]);

    // Low margin products
    const lowMargin = productProfit.filter(p => p.margin < 10 && p.revenue > 0);

    // High profit products
    const highProfit = productProfit.filter(p => p.profit > 0).slice(0, 5);

    const totalRevenue = salesProfit[0]?.totalRevenue || salesData[0]?.totalRevenue || 0;
    const totalCost = salesProfit[0]?.totalCost || salesData[0]?.totalCostFromSales || 0;
    const totalPurchases = purchaseData[0]?.totalPurchaseAmount || 0;
    const grossProfit = totalRevenue - totalCost;
    const netProfit = totalRevenue - totalPurchases;
    const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      report: {
        summary: {
          totalRevenue,
          totalCost,
          grossProfit,
          totalPurchases,
          netProfit,
          profitMargin: Number(profitMargin),
          totalSalesCount: salesData[0]?.totalSales || 0,
          totalDiscount: salesData[0]?.totalDiscount || 0,
          pendingPurchases: (purchaseData[0]?.totalPurchaseAmount || 0) - (purchaseData[0]?.totalPaid || 0),
        },
        productProfit,
        dailyTrend,
        monthlyTrend,
        lowMargin,
        highProfit,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
