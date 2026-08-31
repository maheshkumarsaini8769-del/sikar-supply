const express = require('express');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const router = express.Router();

// PUBLIC - Website se order save (no auth)
router.post('/public', async (req, res) => {
  try {
    const { customerName, phone, email, address, items, total, notes, source, whatsappMessage } = req.body;
    const order = await Order.create({
      customerName: customerName || 'Website Visitor',
      phone: phone || '',
      email: email || '',
      address: address || '',
      items: items || [],
      subtotal: Number(total) || 0,
      total: Number(total) || 0,
      status: 'pending',
      paymentMethod: 'whatsapp',
      notes: notes || '',
      source: source || 'website',
      whatsappMessage: whatsappMessage || '',
    });
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUBLIC - Activity page ke liye (no auth needed)
router.get('/public', async (req, res) => {
  res.json({ success: true, orders: [] });
});

router.get('/', protect, async (req, res) => {
  try {
    const { status, search, sort, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { orderNumber: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'total_asc') sortObj = { total: 1 };
    if (sort === 'total_desc') sortObj = { total: -1 };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query).sort(sortObj).skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ success: true, orders, total, page: parseInt(page), pages: Math.ceil(total / limit) });
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
      dateFilter = { createdAt: { $gte: start } };
    } else if (period === 'week') {
      const start = new Date(); start.setDate(start.getDate() - 7);
      dateFilter = { createdAt: { $gte: start } };
    } else if (period === 'month') {
      const start = new Date(); start.setMonth(start.getMonth() - 1);
      dateFilter = { createdAt: { $gte: start } };
    }

    const totalOrders = await Order.countDocuments(dateFilter);
    const pending = await Order.countDocuments({ ...dateFilter, status: 'pending' });
    const confirmed = await Order.countDocuments({ ...dateFilter, status: 'confirmed' });
    const processing = await Order.countDocuments({ ...dateFilter, status: 'processing' });
    const completed = await Order.countDocuments({ ...dateFilter, status: 'completed' });
    const cancelled = await Order.countDocuments({ ...dateFilter, status: 'cancelled' });

    const salesData = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: '$total' } } },
    ]);
    const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    const monthlyOrders = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 }, sales: { $sum: '$total' } } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    res.json({ success: true, stats: { totalOrders, pending, confirmed, processing, completed, cancelled, totalSales, recentOrders, monthlyOrders } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
