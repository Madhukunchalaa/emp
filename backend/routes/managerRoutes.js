const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const managerController = require('../controllers/managerController');
const assign = require('../controllers/testController');

// Profile routes
router.get('/profile', auth, managerController.getProfile);
router.put('/profile', auth, managerController.updateProfile);

// Employee routes
router.get('/employees', auth, managerController.getEmployees);
router.get('/employees/:id', auth, managerController.getEmployeeProfile);

// Project routes
router.get('/projects', auth, checkRole(['manager']), managerController.getProjects);
router.post('/projects', auth, checkRole(['manager']), managerController.createProject);
router.get('/projects/:id', auth, checkRole(['manager']), managerController.getProjectById);
router.post('/projects/assign', auth, checkRole(['manager']), managerController.assignProjectToEmployee);
router.post('/tasks/assign', auth, checkRole(['manager']), managerController.assignTaskToEmployee);
router.put('/project-tasks/:taskId/status', auth, checkRole(['manager']), managerController.updateProjectTaskStatus);
router.put('/tasks/:taskId/approve', auth, checkRole(['manager']), managerController.approveRejectTask);
router.get('/dashboard', auth, checkRole(['manager']), managerController.getManagerDashboard);

// Attendance routes
router.get('/attendance', auth, checkRole(['manager']), managerController.getAttendanceHistory);
router.get('/employees/:employeeId/attendance', auth, checkRole(['manager']), managerController.getEmployeeAttendance);

// Daily update routes
router.get('/employee-updates', auth, checkRole(['manager']), managerController.getEmployeeDailyUpdates);
router.get('/employee-update-summary', auth, checkRole(['manager']), managerController.getEmployeeUpdateSummary);
router.get('/all-updates', auth, checkRole(['manager']), managerController.getAllEmployeeUpdates);
router.put('/updates/:updateId/approve-reject', auth, checkRole(['manager']), managerController.approveRejectUpdate);

// Add this route to support GET /api/manager/updates
router.get('/updates', auth, checkRole(['manager']), managerController.getEmployeeUpdates);

// these are testing routes
router.post('/test-assign', auth, assign);
router.get('/test', (req, res) => {
  res.json({ message: 'Manager routes are working!' });
});

module.exports = router; 