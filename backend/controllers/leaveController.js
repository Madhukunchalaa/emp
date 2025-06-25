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