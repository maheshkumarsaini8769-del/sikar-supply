const express = require('express');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ active: true }).sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const total = await Review.countDocuments({ active: true });
    const avgResult = await Review.aggregate([
      { $match: { active: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    const avgRating = avgResult.length > 0 ? Math.round(avgResult[0].avgRating * 10) / 10 : 0;
    res.json({ success: true, total, avgRating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/all', protect, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    const review = await Review.create(data);
    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    if (req.body.reply !== undefined) {
      const trimmedReply = typeof req.body.reply === 'string' ? req.body.reply.trim() : '';
      data.reply = trimmedReply;
      data.replyDate = trimmedReply ? new Date() : null;
    }
    const review = await Review.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/reply', protect, async (req, res) => {
  try {
    const { reply } = req.body;
    const trimmedReply = typeof reply === 'string' ? reply.trim() : '';
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        reply: trimmedReply,
        replyDate: trimmedReply ? new Date() : null,
      },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
