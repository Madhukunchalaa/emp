const mongoose = require('mongoose');

const idSchema = mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  role: { type: String, required: true, enum: ['developer', 'designer', 'team-leader', 'manager', 'Business', 'employee', 'digital-marketing'] },
  isUsed: { type: Boolean, default: false },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now }
});
const EmpId = mongoose.model('EmpId', idSchema);
module.exports = EmpId;