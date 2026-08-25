const express = require('express');
const Settings = require('../models/Settings');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

const getSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

router.get('/', async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/', protect, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 },
  { name: 'aboutImage', maxCount: 1 },
  { name: 'showroomImage', maxCount: 1 },
  { name: 'textureImage', maxCount: 1 },
]), async (req, res) => {
  try {
    const settings = await getSettings();
    const updateData = { ...req.body };

    if (req.body.socialLinks) {
      updateData.socialLinks = JSON.parse(req.body.socialLinks);
    }
    if (req.body.homeSections) {
      updateData.homeSections = JSON.parse(req.body.homeSections);
    }
    if (req.body.heroSlides) {
      updateData.heroSlides = JSON.parse(req.body.heroSlides);
    }

    const fileFields = ['logo', 'favicon', 'aboutImage', 'showroomImage', 'textureImage'];
    fileFields.forEach(field => {
      if (req.files && req.files[field] && req.files[field][0]) {
        const f = req.files[field][0];
        updateData[field] = `data:${f.mimetype};base64,${f.buffer.toString('base64')}`;
      }
    });

    Object.assign(settings, updateData);
    await settings.save();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/hero-slides', protect, upload.array('slides', 10), async (req, res) => {
  try {
    const settings = await getSettings();
    if (req.files && req.files.length > 0) {
      const newSlides = req.files.map((f, i) => ({
        image: `data:${f.mimetype};base64,${f.buffer.toString('base64')}`,
        active: true,
        displayOrder: settings.heroSlides.length + i,
      }));
      settings.heroSlides = [...settings.heroSlides, ...newSlides];
      await settings.save();
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/hero-slides/:index', protect, async (req, res) => {
  try {
    const settings = await getSettings();
    settings.heroSlides.splice(parseInt(req.params.index), 1);
    await settings.save();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
