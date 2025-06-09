const express = require('express');
const router = express.Router();
const designController = require('../controllers/designController');
const { auth, checkRole } = require('../middleware/auth');

// Designer routes
router.post('/submit', auth, checkRole('designer'), designController.submitDesign);
router.get('/my-submissions', auth, checkRole('designer'), designController.getDesignerSubmissions);
router.get('/my-tasks', auth, checkRole('designer'), designController.getDesignerTasks);
router.patch('/tasks/:id/status', auth, checkRole('designer'), designController.updateTaskStatus);

// Manager routes
router.get('/all', auth, checkRole('manager'), designController.getAllDesigns);
router.patch('/:id/review', auth, checkRole('manager'), designController.reviewDesign);
router.post('/tasks', auth, checkRole('manager'), designController.assignDesignTask);

module.exports = router; 