const Todo = require('../models/Todo');
const mongoose = require('mongoose');

// Get all todos for a manager
const getTodos = async (req, res) => {
  try {
    const { startDate, endDate, status, category } = req.query;
    const managerId = req.user.id;

    let query = { manager: managerId };

    // Date range filter
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    const todos = await Todo.find(query)
      .sort({ date: 1, dueTime: 1 })
      .populate('manager', 'name email');

    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ message: 'Error fetching todos' });
  }
};

// Get todos for a specific date
const getTodosByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const managerId = req.user.id;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const todos = await Todo.find({
      manager: managerId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ dueTime: 1 });

    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos by date:', error);
    res.status(500).json({ message: 'Error fetching todos by date' });
  }
};

// Create a new todo
const createTodo = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      priority,
      category,
      dueTime,
      isRecurring,
      recurringType,
      tags,
      notes
    } = req.body;

    const todo = new Todo({
      manager: req.user.id,
      title,
      description,
      date: new Date(date),
      priority: priority || 'Medium',
      category: category || 'Work',
      dueTime,
      isRecurring: isRecurring || false,
      recurringType,
      tags: tags || [],
      notes
    });

    const savedTodo = await todo.save();
    await savedTodo.populate('manager', 'name email');

    res.status(201).json(savedTodo);
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ message: 'Error creating todo' });
  }
};

// Update a todo
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If status is being updated to 'Completed', set completedAt
    if (updateData.status === 'Completed') {
      updateData.completedAt = new Date();
    } else if (updateData.status !== 'Completed') {
      updateData.completedAt = null;
    }

    const todo = await Todo.findOneAndUpdate(
      { _id: id, manager: req.user.id },
      updateData,
      { new: true, runValidators: true }
    ).populate('manager', 'name email');

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ message: 'Error updating todo' });
  }
};

// Delete a todo
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findOneAndDelete({
      _id: id,
      manager: req.user.id
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ message: 'Error deleting todo' });
  }
};

// Get todo statistics
const getTodoStats = async (req, res) => {
  try {
    const managerId = req.user.id;
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const stats = await Todo.aggregate([
      {
        $match: {
          manager: new mongoose.Types.ObjectId(managerId),
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Todo.aggregate([
      {
        $match: {
          manager: new mongoose.Types.ObjectId(managerId),
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Todo.aggregate([
      {
        $match: {
          manager: new mongoose.Types.ObjectId(managerId),
          ...dateFilter
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      statusStats: stats,
      categoryStats,
      priorityStats
    });
  } catch (error) {
    console.error('Error fetching todo stats:', error);
    res.status(500).json({ message: 'Error fetching todo statistics' });
  }
};

// Bulk update todos
const bulkUpdateTodos = async (req, res) => {
  try {
    const { todoIds, updateData } = req.body;

    if (updateData.status === 'Completed') {
      updateData.completedAt = new Date();
    }

    const result = await Todo.updateMany(
      { 
        _id: { $in: todoIds },
        manager: req.user.id 
      },
      updateData
    );

    res.json({ 
      message: `${result.modifiedCount} todos updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating todos:', error);
    res.status(500).json({ message: 'Error bulk updating todos' });
  }
};

module.exports = {
  getTodos,
  getTodosByDate,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodoStats,
  bulkUpdateTodos
};
