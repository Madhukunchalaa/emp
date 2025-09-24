const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  deadline: { type: Date },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  comments: [{
    text: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attachments: [{
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      url: { type: String, required: true },
      size: { type: Number },
      mimetype: { type: String }
    }],
    createdAt: { type: Date, default: Date.now }
  }]
});

const stepSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  tasks: [taskSchema]
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'on-hold', 'cancelled', 'assigned', 'scheduled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: { type: String, trim: true },
  estimatedHours: { type: Number },
  deadline: { type: Date, required: true },
  comment: { type: String, trim: true, default: '' },
  steps: [stepSchema],
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', projectSchema);