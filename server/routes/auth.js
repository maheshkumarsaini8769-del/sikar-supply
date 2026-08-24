const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter password' });
    }
    const user = await User.findOne({ email: 'admin@starhomedesign.com' }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Wrong password' });
    }
    const token = generateToken(user._id);
    res.cookie('admin_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

router.post('/logout', (req, res) => {
  res.cookie('admin_token', '', { httpOnly: true, maxAge: 0 });
  res.json({ success: true });
});

module.exports = router;
