const Leave = require('../models/Leave');

// @desc    Apply for leave
// @route   POST /api/leaves/apply
// @access  Private (Employee)
exports.applyForLeave = async (req, res) => {
  const { type, fromDate, toDate, reason } = req.body;
  const employeeId = req.user.id; // from auth middleware

  if (!type || !fromDate || !toDate || !reason) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
    const leave = new Leave({
      employee: employeeId,
      type,
      fromDate,
      toDate,
      reason,
    });

    await leave.save();

    res.status(201).json({ message: 'Leave request submitted successfully.', leave });
  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ message: 'Server error while applying for leave.' });
  }
};

// @desc    Get leave history for the logged-in employee
// @route   GET /api/leaves/my-history
// @access  Private (Employee)
exports.getMyLeaveHistory = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leave history:', error);
    res.status(500).json({ message: 'Server error while fetching leave history.' });
  }
};

// Get all leave requests (for manager)
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const leaves = await Leave.find().populate('employee', 'name email role').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching leave requests.' });
  }
};

// Approve or reject a leave request
exports.reviewLeaveRequest = async (req, res) => {
  const { leaveId } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }
  try {
    const leave = await Leave.findById(leaveId);
    if (!leave) return res.status(404).json({ message: 'Leave request not found.' });
    leave.status = status;
    leave.reviewedBy = req.user.id;
    leave.reviewedAt = new Date();
    await leave.save();

    // Emit notification to employee
    const io = req.app.get('io');
    if (io && leave.employee) {
      io.to(leave.employee.toString()).emit('notification', {
        message: `Your leave request has been ${status}.`
      });
    }

    res.json({ message: `Leave ${status}.`, leave });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating leave status.' });
  }
}; 