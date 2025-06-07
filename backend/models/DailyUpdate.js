const mongoose = require('mongoose');

const dailyUpdateSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  tasks: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      required: true
    },
    hoursSpent: {
      type: Number,
      required: true,
      min: 0,
      max: 24
    },
    description: {
      type: String,
      required: true
    }
  }],
  totalHours: {
    type: Number,
    required: true,
    min: 0,
    max: 24
  },
  comments: {
    type: String
  }
}, {
  timestamps: true
});

// Create compound index for employee and date
dailyUpdateSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyUpdate', dailyUpdateSchema); 