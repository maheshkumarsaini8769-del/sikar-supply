const express = require('express');
const Analytics = require('../models/Analytics');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { type, data } = req.body;
    if (!type) {
      return res.status(400).json({ success: false, message: 'Event type is required' });
    }
    const clientIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || req.ip || '';
    await Analytics.create({
      type,
      data: data || {},
      ip: clientIp,
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

    const [
      clicks,
      searches,
      orders,
      pageviews,
      whatsappClicks,
      callClicks,
      uniqueIps
    ] = await Promise.all([
      Analytics.countDocuments({ type: 'click', ...dateFilter }),
      Analytics.countDocuments({ type: 'search', ...dateFilter }),
      Analytics.countDocuments({ type: 'order', ...dateFilter }),
      Analytics.countDocuments({ type: 'pageview', ...dateFilter }),
      Analytics.countDocuments({ type: 'whatsapp', ...dateFilter }),
      Analytics.countDocuments({ type: 'call', ...dateFilter }),
      Analytics.distinct('ip', { ...dateFilter, ip: { $exists: true, $ne: '' } }),
    ]);

    const uniqueVisitors = uniqueIps.length || (pageviews > 0 ? Math.max(1, Math.round(pageviews * 0.7)) : 0);
    const totalInteractions = clicks + whatsappClicks + callClicks;

    const [clicksByDay, pageviewsByDay, searchesByDay] = await Promise.all([
      Analytics.aggregate([
        { $match: { type: { $in: ['click', 'whatsapp', 'call'] }, ...dateFilter } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ]),
      Analytics.aggregate([
        { $match: { type: 'pageview', ...dateFilter } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ]),
      Analytics.aggregate([
        { $match: { type: 'search', ...dateFilter } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ]),
    ]);

    const topSearches = await Analytics.aggregate([
      { $match: { type: 'search', ...dateFilter, 'data.query': { $exists: true, $ne: '' } } },
      { $group: { _id: '$data.query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const topProducts = await Analytics.aggregate([
      { $match: { type: 'click', ...dateFilter, 'data.product': { $exists: true, $ne: '' } } },
      { $group: { _id: '$data.product', count: { $sum: 1 }, lastClicked: { $max: '$createdAt' } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    const recentActivity = await Analytics.find(dateFilter)
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.json({
      success: true,
      stats: {
        clicks,
        searches,
        orders,
        pageviews,
        uniqueVisitors,
        whatsappClicks,
        callClicks,
        totalInteractions,
        recentActivity,
        clicksByDay,
        pageviewsByDay,
        searchesByDay,
        topSearches,
        topProducts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
