const express = require('express');
const Gallery = require('../models/Gallery');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const gallery = await Gallery.find({ active: true }).sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/all', protect, async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const gallery = await Gallery.create({
      image: `/uploads/${req.file.filename}`,
      title: req.body.title || '',
      category: req.body.category || '',
      displayOrder: Number(req.body.displayOrder) || 0,
    });
    res.status(201).json({ success: true, gallery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const item = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found' });
    res.json({ success: true, gallery: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Gallery item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
