const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  lastChecked: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['up', 'down'],
    default: 'down'
  },
  responseTime: {
    type: Number,
    default: null // in milliseconds
  },
  sslValidTill: {
    type: Date,
    default: null
  },
  domainExpiry: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Website', websiteSchema);