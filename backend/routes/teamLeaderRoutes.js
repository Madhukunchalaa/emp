const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const teamLeaderController = require('../controllers/teamLeaderController');

// Dashboard routes
router.get('/dashboard', auth, checkRole(['team-leader']), teamLeaderController.getTeamLeaderDashboard);
router.get('/assigned-projects', auth, checkRole(['team-leader']), teamLeaderController.getAssignedProjects);

// Team management routes
router.get('/team-members', auth, checkRole(['team-leader']), teamLeaderController.getTeamMembers);
router.get('/available-employees', auth, checkRole(['team-leader']), teamLeaderController.getAvailableEmployees);
router.post('/assign-employee', auth, checkRole(['team-leader']), teamLeaderController.assignEmployeeToTeam);
router.get('/team-member/:teamMemberId/report', auth, checkRole(['team-leader']), teamLeaderController.getTeamMemberReport);
router.get('/team-performance-summary', auth, checkRole(['team-leader']), teamLeaderController.getTeamPerformanceSummary);

// Task management routes
router.get('/team-tasks', auth, checkRole(['team-leader']), teamLeaderController.getTeamTasks);
router.post('/tasks', auth, checkRole(['team-leader']), teamLeaderController.createTaskForTeamMember);
router.put('/tasks/:taskId/assign', auth, checkRole(['team-leader']), teamLeaderController.assignTaskToTeamMember);
router.put('/tasks/:taskId/status', auth, checkRole(['team-leader']), teamLeaderController.updateTaskStatus);

// Project assignment routes
router.post('/projects/assign', auth, checkRole(['team-leader']), teamLeaderController.assignProjectToTeamMember);

// Punch in/out routes for team leader
router.post('/punch-in', auth, checkRole(['team-leader']), teamLeaderController.punchIn);
router.post('/punch-out', auth, checkRole(['team-leader']), teamLeaderController.punchOut);

module.exports = router; 