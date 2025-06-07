const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Auth middleware to verify JWT token
exports.auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user is a manager
exports.isManager = (req, res, next) => {
  if (req.user && req.user.role === 'manager') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Manager only' });
  }
};

// Middleware to check if user is an employee
exports.isEmployee = (req, res, next) => {
  if (req.user && req.user.role === 'employee') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Employee only' });
  }
}; 