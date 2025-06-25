const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { applyForLeave, getMyLeaveHistory } = require('../controllers/leaveController');

// @route   POST api/leaves/apply
// @desc    Apply for leave
// @access  Private (Employee)
router.post('/apply', auth, checkRole(['employee', 'manager']), applyForLeave);

// @route   GET api/leaves/my-history
// @desc    Get my leave history
// @access  Private (Employee)
router.get('/my-history', auth, checkRole(['employee', 'manager']), getMyLeaveHistory);

module.exports = router; 