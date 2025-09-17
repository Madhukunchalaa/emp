const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  category: {
    type: String,
    enum: ['Work', 'Personal', 'Meeting', 'Project', 'Other'],
    default: 'Work'
  },
  dueTime: {
    type: String, // Store as string like "09:00" for time
    default: null
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringType: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient querying
todoSchema.index({ manager: 1, date: 1 });
todoSchema.index({ manager: 1, status: 1 });
todoSchema.index({ date: 1, status: 1 });

module.exports = mongoose.models.Todo || mongoose.model('Todo', todoSchema);
