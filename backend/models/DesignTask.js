const mongoose = require('mongoose');

const designTaskSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
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
  assignedDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  comments: [{
    text: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    attachments: [{
      originalName: { type: String, required: true },
      filename: { type: String, required: true },
      url: { type: String, required: true },
      size: { type: Number },
      mimeType: { type: String }
    }]
  }]
}, {
  timestamps: true
});

// Add indexes for efficient querying
designTaskSchema.index({ assignedTo: 1, status: 1 });
designTaskSchema.index({ assignedDate: -1 });

const DesignTask = mongoose.model('DesignTask', designTaskSchema);

module.exports = DesignTask; 