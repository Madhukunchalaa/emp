const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getAllEmployeeUpdates,
  getProfile,
  updateProfile,
  getEmployees,
  getEmployeeProfile,
  assignProject,
  updateProjectStatus,
  getProjects,
  getAttendanceHistory,
  getEmployeeAttendance,
  getEmployeeDailyUpdates,
  getEmployeeUpdateSummary
} = require('../controllers/managerController');

// Profile routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

// Employee routes
router.get('/employees', auth, getEmployees);
router.get('/employees/:id', auth, getEmployeeProfile);

// Project routes
router.post('/projects', auth, assignProject);
router.put('/projects/:id/status', auth, updateProjectStatus);
router.get('/projects', auth, getProjects);

// Attendance routes
router.get('/attendance', auth, getAttendanceHistory);
router.get('/employees/:employeeId/attendance', auth, getEmployeeAttendance);

// Daily update routes
router.get('/employee-updates', auth, getEmployeeDailyUpdates);
router.get('/employee-update-summary', auth, getEmployeeUpdateSummary);
router.get('/all-updates',auth,getAllEmployeeUpdates)

module.exports = router; 