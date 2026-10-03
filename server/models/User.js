const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'manager'], default: 'admin' },
  avatar: { type: String, default: '' },
  isAuthorized: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  resetPasswordOTP: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
