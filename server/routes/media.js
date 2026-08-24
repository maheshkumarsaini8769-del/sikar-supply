const express = require('express');
const Media = require('../models/Media');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { section } = req.query;
    let query = {};
    if (section) query.section = section;
    const media = await Media.find(query).sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const media = await Media.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      alt: req.body.alt || '',
      section: req.body.section || 'general',
      mimeType: req.file.mimetype,
      size: req.file.size,
      displayOrder: Number(req.body.displayOrder) || 0,
    });
    res.status(201).json({ success: true, media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!media) return res.status(404).json({ success: false, message: 'Media not found' });
    res.json({ success: true, media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Media.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Media deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
