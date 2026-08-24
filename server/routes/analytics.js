const express = require('express');
const Analytics = require('../models/Analytics');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { type, data } = req.body;
    await Analytics.create({
      type,
      data,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || '',
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats', protect, async (req, res) => {
  try {
    const { period } = req.query;
    let dateFilter = {};

    if (period === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: start } };
    } else if (period === 'week') {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      dateFilter = { createdAt: { $gte: start } };
    } else if (period === 'month') {
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      dateFilter = { createdAt: { $gte: start } };
    }

    const [clicks, searches, orders, pageviews] = await Promise.all([
      Analytics.countDocuments({ type: 'click', ...dateFilter }),
      Analytics.countDocuments({ type: 'search', ...dateFilter }),
      Analytics.countDocuments({ type: 'order', ...dateFilter }),
      Analytics.countDocuments({ type: 'pageview', ...dateFilter }),
    ]);

    const recentActivity = await Analytics.find(dateFilter).sort({ createdAt: -1 }).limit(20);

    const clicksByDay = await Analytics.aggregate([
      { $match: { type: 'click', ...dateFilter } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    const searchesByDay = await Analytics.aggregate([
      { $match: { type: 'search', ...dateFilter } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    const topSearches = await Analytics.aggregate([
      { $match: { type: 'search', ...dateFilter } },
      { $group: { _id: '$data.query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const topProducts = await Analytics.aggregate([
      { $match: { type: 'click', ...dateFilter, 'data.product': { $exists: true } } },
      { $group: { _id: '$data.product', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      stats: { clicks, searches, orders, pageviews, recentActivity, clicksByDay, searchesByDay, topSearches, topProducts },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
