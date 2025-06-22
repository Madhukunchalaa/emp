const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'on_hold'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  estimatedHours: {
    type: Number,
    default: 0
  },
  actualHours: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  completedDate: {
    type: Date
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add indexes for efficient querying
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ projectId: 1 });
taskSchema.index({ deadline: 1 });
taskSchema.index({ assignedBy: 1 });

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  return this.deadline < new Date() && this.status !== 'completed';
});

// Method to update progress
taskSchema.methods.updateProgress = function(progress) {
  this.progress = Math.max(0, Math.min(100, progress));
  if (this.progress === 100) {
    this.status = 'completed';
    this.completedDate = new Date();
  }
  return this.save();
};

// Method to add comment
taskSchema.methods.addComment = function(userId, comment) {
  this.comments.push({
    user: userId,
    comment: comment
  });
  return this.save();
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task; 