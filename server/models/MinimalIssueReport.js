// models/MinimalIssueReport.js
const mongoose = require('mongoose');

const minimalIssueSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/  // Indian phone number validation
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
    required: true // e.g., plumber, electrician
  },
  reportedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MinimalIssueReport', minimalIssueSchema);
