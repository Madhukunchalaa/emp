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
  project: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    required: true
  },
  imageUrl:{type:String},
  update: {
    type: String,
    required: true
  },
  finishBy: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

dailyUpdateSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyUpdate', dailyUpdateSchema);
