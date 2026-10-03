const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendResetPasswordEmail } = require('../utils/email');
const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'starhomeinterior_secret_key_2026', { expiresIn: '7d' });
};

// ================= LOGIN (EMAIL + PASSWORD MANDATORY) =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Kripya apna email address enter karein' });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Kripya apna password enter karein' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail }).select('+password');

    // If no user exists in DB at all, initialize the master admin
    if (!user) {
      const totalUsers = await User.countDocuments();
      if (totalUsers === 0 && cleanEmail === 'admin@starhomeinterior.in') {
        user = await User.create({
          name: 'Star Home Admin',
          email: cleanEmail,
          password: password,
          role: 'admin',
          isAuthorized: true,
          status: 'active',
        });
      } else {
        return res.status(401).json({ success: false, message: 'Wrong email or password (गलत ईमेल या पासवर्ड)' });
      }
    } else {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Wrong email or password (गलत ईमेल या पासवर्ड)' });
      }
    }

    // Strict Authority Control Check:
    // Only users with isAuthorized !== false and status !== 'suspended' can log in
    if (user.isAuthorized === false || user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: '⛔ Yeh email login karne ke liye AUTHORIZED nahi hai. Kripya Authority Admin se permission lein.',
      });
    }

    // Update login tracking metadata
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.cookie('admin_token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAuthorized: user.isAuthorized !== false,
        status: user.status || 'active',
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= FORGOT PASSWORD (REQUEST 6-DIGIT OTP) =================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Kripya apna registered email address enter karein' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Yeh email registered nahi mila. Kripya sahi admin email daalein.',
      });
    }

    // Check authority before sending OTP
    if (user.isAuthorized === false || user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: '⛔ Yeh account suspended / unauthorized hai. Kripya master admin se sampark karein.',
      });
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity
    await user.save({ validateBeforeSave: false });

    // Send email using Resend
    const sendResult = await sendResetPasswordEmail({
      to: cleanEmail,
      otp,
      userName: user.name,
    });

    if (!sendResult.success) {
      console.warn('[Resend Dispatch Notice]:', sendResult.error);
      return res.status(400).json({
        success: false,
        message: `Email bhejte samay Resend se error aayi: ${sendResult.error}. (Tip: Resend account me domain verify karein ya registered email use karein).`,
      });
    }

    res.json({
      success: true,
      message: `6-digit OTP safalta-purvak ${cleanEmail} par bhej diya gaya hai! Kripya apna inbox check karein.`,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= VERIFY OTP & RESET PASSWORD =================
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP code aur naya password sabhi zaroori hain' });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ success: false, message: 'Password kam se kam 4 akshar ka hona chahiye' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const user = await User.findOne({
      email: cleanEmail,
      resetPasswordOTP: cleanOtp,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password +resetPasswordOTP +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Galat OTP ya fir OTP ki validity (15 min) khatam ho gayi hai. Dubara OTP request karein.',
      });
    }

    // Set new password (pre('save') hook will automatically hash it with bcrypt)
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: '✅ Aapka naya password safalta-purvak update ho gaya hai! Ab aap naye password se login kar sakte hain.',
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
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
    const { name, email, password, role, isAuthorized } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    if (password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: role === 'manager' ? 'manager' : 'admin',
      isAuthorized: isAuthorized !== false,
      status: isAuthorized === false ? 'suspended' : 'active',
    });

    res.json({
      success: true,
      message: 'New admin account created and authorized successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isAuthorized: newUser.isAuthorized,
        status: newUser.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================= TOGGLE USER AUTHORITY (GRANT / REVOKE LOGIN) =================
router.put('/users/:id/authority', protect, async (req, res) => {
  try {
    const { isAuthorized, status } = req.body;
    const targetId = req.params.id;

    // Prevent master admin from locking out themselves
    if (req.user._id.toString() === targetId && isAuthorized === false) {
      return res.status(400).json({
        success: false,
        message: 'Aap apna khud ka account de-authorize / block nahi kar sakte.',
      });
    }

    const user = await User.findById(targetId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    if (typeof isAuthorized === 'boolean') {
      user.isAuthorized = isAuthorized;
      user.status = isAuthorized ? 'active' : 'suspended';
    } else if (status) {
      user.status = status;
      user.isAuthorized = status === 'active';
    }

    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: `${user.name} (${user.email}) ki Login Authority ab ${user.isAuthorized ? 'ALLOWED (Active)' : 'BLOCKED (Suspended)'} hai!`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAuthorized: user.isAuthorized,
        status: user.status,
      },
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
