const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phno: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/, // Indian phone number validation
    unique: true,
  },
  mail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/,
  },
  pass: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  field: {
    type: String,
    required: true,
    enum: ['Electrician', 'Plumber', 'Carpenter', 'Mason', 'Painter', 'Other'],
  },
  aadhaarImage: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: Boolean,
    default: false // 👈 Set to false by default
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Technician = mongoose.model('Technician', technicianSchema);

module.exports = Technician;
