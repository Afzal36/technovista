// models/MinimalIssueReport.js
const mongoose = require('mongoose');

const minimalIssueSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/
  },
  address: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  assignedTo: {
    type: String,
    default: null // e.g., name or ID of technician
  },
  status: {
    type: String,
    enum: ['none', 'progress', 'resolved'],
    default: 'none'
  },
  reportedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MinimalIssueReport', minimalIssueSchema);
