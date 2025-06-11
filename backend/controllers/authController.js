const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Use a default secret if JWT_SECRET is not set
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log('Registration attempt for:', { name, email, role });

    // Validate role
    const validRoles = ['developer', 'designer', 'manager'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user (password will be hashed by the model's pre-save hook)
    user = new User({
      name,
      email,
      password,
      role
    });

    // Save user
    await user.save();
    console.log('User saved successfully:', { 
      id: user.id, 
      email: user.email, 
      role: user.role
    });

    // Create JWT token
    const payload = {
      user: {
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
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
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