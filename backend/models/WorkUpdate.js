const mongoose = require('mongoose');

const workUpdateSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  },
  project_title: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
  },
  imageUrl: { type: String },
  update: {
    type: String,
  },
  finishBy: {
    type: Date,
  },
  // Work update fields
  taskDescription: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  plannedTime: {
    type: Number, // in hours
    required: true
  },
  actualTime: {
    type: Number, // in hours
    required: true
  },
  linkReference: {
    type: String
  },
  notes: {
    type: String
  },
  plansForNextDay: {
    type: String
  },
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  managerFeedback: {
    type: String,
    default: ''
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

workUpdateSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.WorkUpdate || mongoose.model('WorkUpdate', workUpdateSchema);