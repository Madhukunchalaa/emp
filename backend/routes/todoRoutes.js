const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const { auth } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Get all todos for a manager
router.get('/', auth, checkRole(['manager']), todoController.getTodos);

// Get todos for a specific date
router.get('/date/:date', auth, checkRole(['manager']), todoController.getTodosByDate);

// Get todo statistics
router.get('/stats', auth, checkRole(['manager']), todoController.getTodoStats);

// Create a new todo
router.post('/', auth, checkRole(['manager']), todoController.createTodo);

// Update a todo
router.put('/:id', auth, checkRole(['manager']), todoController.updateTodo);

// Delete a todo
router.delete('/:id', auth, checkRole(['manager']), todoController.deleteTodo);

// Bulk update todos
router.put('/bulk/update', auth, checkRole(['manager']), todoController.bulkUpdateTodos);

module.exports = router;