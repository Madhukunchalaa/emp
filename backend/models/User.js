const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Online', 'Offline'],
    default: 'Offline'
  },
  todayWorkingOn: {
    type: String,
    default: '',
    trim: true
  },
  empid: {
    type: String,
  },
  employeeID: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['admin', 'manager', 'team-leader', 'employee', 'designer', 'developer', 'Business', 'digital-marketing'], required: false, default: null },
  department: { type: String, default: '' },
  position: { type: String, default: '' },
  managerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  teamLeaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: {
    type: Date,
    default: Date.now
  },
  todayWorkingOn: {
    type: String,
    default: "",
  },
});

// Add indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw err;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User; 