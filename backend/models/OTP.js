const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['password_reset', 'email_verification'],
    default: 'password_reset'
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    }
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  registrationData: {
    type: Object,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Method to check if OTP is valid
otpSchema.methods.isValid = function() {
  return !this.isUsed && this.expiresAt > new Date();
};

// Method to mark OTP as used
otpSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  return this.save();
};

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP; 