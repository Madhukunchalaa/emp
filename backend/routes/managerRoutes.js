const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    getAllEmployeeUpdates,
  getProfile,
  updateProfile,
  getEmployees,
  getEmployeeProfile,
  createProject,
  assignProject,
  assignTask,
  updateProjectStatus,
  getProjects,
  getProjectById,
  getProjectTasks,
  getAttendanceHistory,
  getEmployeeAttendance,
  getEmployeeDailyUpdates,
  getEmployeeUpdateSummary,
  approveRejectUpdate,
  updateTaskStatus
} = require('../controllers/managerController');

const assign=require('../controllers/testController')

// Profile routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

// Employee routes
router.get('/employees', auth, getEmployees);
router.get('/employees/:id', auth, getEmployeeProfile);

// Project routes
router.post('/projects', auth, createProject);
router.get('/projects', auth, getProjects);
router.get('/projects/:id', auth, getProjectById);
router.post('/projects/assign', auth, assignProject);
router.post('/tasks/assign', auth, assignTask);
router.put('/tasks/:taskId/status', auth, updateTaskStatus);
router.put('/projects/:id/status', auth, updateProjectStatus);
router.get('/projects/:projectId/tasks', auth, getProjectTasks);

// Attendance routes
router.get('/attendance', auth, getAttendanceHistory);
router.get('/employees/:employeeId/attendance', auth, getEmployeeAttendance);

// Daily update routes
router.get('/employee-updates', auth, getEmployeeDailyUpdates);
router.get('/employee-update-summary', auth, getEmployeeUpdateSummary);
router.get('/all-updates',auth,getAllEmployeeUpdates);
router.put('/updates/:updateId/approve-reject', auth, approveRejectUpdate);

// these are testing routes
router.post('/test-assign',auth,assign)
router.get('/test', (req, res) => {
  res.json({ message: 'Manager routes are working!' });
});

module.exports = router; 