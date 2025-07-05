const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOTP, sendOTPEmail, sendPasswordResetSuccessEmail, sendWelcomeEmail } = require('../utils/emailService');
const EmpId = require('../models/empId');

// Use a default secret if JWT_SECRET is not set
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register with OTP verification
exports.register = async (req, res) => {
  try {
    const { name, email, password, empid } = req.body;
    console.log('Registration attempt for:', { name, email, empid });

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate empid
    const empIdDoc = await EmpId.findOne({ employeeId: empid });
    if (!empIdDoc) {
      return res.status(400).json({ message: 'Invalid Employee ID' });
    }
    if (empIdDoc.isUsed) {
      return res.status(400).json({ message: 'Employee ID already used' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing registration OTP for this email
    await OTP.deleteMany({ email, type: 'email_verification' });

    // Save registration details and OTP in OTP collection
    const otpRecord = new OTP({
      email,
      otp,
      type: 'email_verification',
      registrationData: { name, password, empid }
    });
    otpRecord.markModified && otpRecord.markModified('registrationData');
    await otpRecord.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, name, 'registration');
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ message: 'OTP sent to your email. Please verify to complete registration.', email });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Verify registration OTP and create user
exports.verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    // Find the OTP record
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: 'email_verification',
      isUsed: false
    });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (!otpRecord.isValid()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Get empid and role
    const { name, password, empid } = otpRecord.registrationData;
    const empIdDoc = await EmpId.findOne({ employeeId: empid });
    if (!empIdDoc) {
      return res.status(400).json({ message: 'Invalid Employee ID' });
    }
    if (empIdDoc.isUsed) {
      return res.status(400).json({ message: 'Employee ID already used' });
    }
    // Create new user with empid and role
    user = new User({ name, email, password, empid, role: empIdDoc.role });
    await user.save();
    await otpRecord.markAsUsed();
    // Mark empid as used and assign to user
    empIdDoc.isUsed = true;
    empIdDoc.assignedTo = user._id;
    await empIdDoc.save();
    // Send welcome email
    await sendWelcomeEmail(email, name);
    res.json({ message: 'Registration successful! You can now login.' });
  } catch (err) {
    console.error('Verify registration OTP error:', err);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt for email:', email);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', {
      
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Use the model's comparePassword method
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful for user:', email, 'Role:', user.role);

    // Create JWT token
    const payload = {
      user: {
         _id: user._id, 
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) {
          console.error('Error creating JWT token:', err);
          return res.status(500).json({ message: 'Error creating authentication token' });
        }
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Forgot password - Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email, type: 'password_reset' });

    // Save new OTP
    const otpRecord = new OTP({
      email,
      otp,
      type: 'password_reset'
    });
    await otpRecord.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, user.name, 'password_reset');
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ 
      message: 'OTP sent successfully to your email',
      email: email // Return email for frontend use
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during forgot password process' });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({ 
      email, 
      otp, 
      type: 'password_reset',
      isUsed: false 
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP is expired
    if (!otpRecord.isValid()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Mark OTP as used
    await otpRecord.markAsUsed();

    res.json({ 
      message: 'OTP verified successfully',
      email: email
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Assign plain new password (let pre-save hook hash it)
    user.password = newPassword;
    await user.save();

    // Send success email
    await sendPasswordResetSuccessEmail(email, user.name);

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Test endpoint to check user role
exports.getCurrentUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('role name email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error getting current user role:', err);
    res.status(500).json({ message: 'Server error' });
  }
}; 