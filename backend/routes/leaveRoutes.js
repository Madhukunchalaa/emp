const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { applyForLeave, getMyLeaveHistory, getAllLeaveRequests, reviewLeaveRequest } = require('../controllers/leaveController');

// @route   POST api/leaves/apply
// @desc    Apply for leave
// @access  Private (Developer, Manager, Designer, Business)
router.post('/apply', auth, checkRole(['developer', 'manager', 'designer', 'Business', 'digital-marketing']), applyForLeave);

// @route   GET api/leaves/my-history
// @desc    Get my leave history
// @access  Private (Developer, Manager, Designer, Business)
router.get('/my-history', auth, checkRole(['developer', 'manager', 'designer', 'Business', 'digital-marketing']), getMyLeaveHistory);

// @route   GET api/leaves/all
// @desc    Manager: View all leave requests
// @access  Private (Manager)
router.get('/all', auth, checkRole(['manager']), getAllLeaveRequests);

// @route   PATCH api/leaves/:leaveId/review
// @desc    Manager: Approve/Reject a leave request
// @access  Private (Manager)
router.patch('/:leaveId/review', auth, checkRole(['manager']), reviewLeaveRequest);

module.exports = router; 