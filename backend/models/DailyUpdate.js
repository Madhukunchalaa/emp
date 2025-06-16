const mongoose = require('mongoose');

const dailyUpdateSchema = new mongoose.Schema({
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
    enum: ['Not Started', 'In Progress', 'Completed'],
  },
  imageUrl: { type: String },
  update: {
    type: String,
  },
  finishBy: {
    type: Date,
  },
}, {
  timestamps: true
});

dailyUpdateSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.DailyUpdate || mongoose.model('DailyUpdate', dailyUpdateSchema);
