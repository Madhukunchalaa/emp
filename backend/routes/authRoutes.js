const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, verifyOTP, resetPassword, verifyRegistrationOTP } = require('../controllers/authController');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Forgot password routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Verify registration OTP
router.post('/verify-registration-otp', verifyRegistrationOTP);

module.exports = router; 