const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter password' });
    }

    let user;
    if (email && email.trim()) {
      user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Wrong email or password' });
      }
    } else {
      // Quick single-password login: check all registered admin/manager users
      const users = await User.find().select('+password');
      for (const u of users) {
        if (await u.comparePassword(password)) {
          user = u;
          break;
        }
      }

      if (!user) {
        // If database has no users yet, seed initial admin with this password or admin123
        if (users.length === 0) {
          user = await User.create({
            name: 'Star Home Admin',
            email: 'admin@starhomeinterior.in',
            password: password,
            role: 'admin',
          });
        } else {
          return res.status(401).json({ success: false, message: 'Wrong password' });
        }
      }
    }

    const token = generateToken(user._id);
    res.cookie('admin_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= CURRENT USER =================
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// ================= LOGOUT =================
router.post('/logout', (req, res) => {
  res.cookie('admin_token', '', { httpOnly: true, maxAge: 0 });
  res.json({ success: true });
});

// ================= CHANGE OWN PASSWORD =================
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword, password, name, email } = req.body;
    const targetPassword = newPassword || password;

    if (!targetPassword || targetPassword.length < 4) {
      return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password if provided
    if (currentPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
    }

    user.password = targetPassword;
    if (name && name.trim()) user.name = name.trim();
    if (email && email.trim()) user.email = email.toLowerCase().trim();

    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= LIST ALL ADMIN / STAFF USERS =================
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= ADD NEW ADMIN / STAFF USER =================
router.post('/users', protect, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    if (password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role === 'manager' ? 'manager' : 'admin',
    });

    res.json({
      success: true,
      message: 'New admin account created successfully',
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= RESET / UPDATE USER PASSWORD =================
router.put('/users/:id/password', protect, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long' });
    }

    const user = await User.findById(req.params.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.json({ success: true, message: `Password updated for ${user.name}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= DELETE STAFF USER =================
router.delete('/users/:id', protect, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const count = await User.countDocuments();
    if (count <= 1) {
      return res.status(400).json({ success: false, message: 'Cannot delete the only admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Account removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
