const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: String,
  name: String,
  role: { type: String, enum: ["user", "admin", "worker"], default: "user" },
  // Technician/worker fields (optional for users/admins)
  address: String,
  field: { type: String, enum: ['Electrician', 'Plumber', 'Carpenter', 'Mason', 'Painter', 'Other', ''], default: '' },
  aadhaarImage: String,
  experience: { type: Number, min: 0 },
  status: { type: Boolean, default: false }, // For workers: approved or not
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);