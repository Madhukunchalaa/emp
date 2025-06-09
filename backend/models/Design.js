const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
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
  fileURL: {
    type: String,
    required: true
  },
  designerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  managerComment: {
    type: String,
    trim: true
  },
  submittedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for efficient querying
designSchema.index({ designerId: 1, submittedDate: -1 });
designSchema.index({ status: 1 });

const Design = mongoose.model('Design', designSchema);

module.exports = Design; 