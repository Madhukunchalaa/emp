const mongoose = require('mongoose');

const punchSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date, 
    default: () => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return now;
    },
    required: true 
  },
  punchIn: { 
    type: Date,
    required: true
  },
  punchOut: { 
    type: Date
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    default: 'Present'
  },
  hours: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate hours worked when punchOut is set
punchSchema.pre('save', function(next) {
  if (this.punchOut && this.punchIn) {
    const diffMs = this.punchOut - this.punchIn;
    this.hours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; 
  }
  next();
});

// Index for faster queries
punchSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Punch', punchSchema); 