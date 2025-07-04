const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String },
  fileUrl: { type: String },
  fileName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports =  mongoose.model('ChatMessage', chatMessageSchema); 