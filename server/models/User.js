const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  name: String,
  role: String,
  field: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema); // ✅ This is critical
