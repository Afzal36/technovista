const mongoose = require("mongoose");

const WorkerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phno: { type: String, required: true },
  mail: { type: String, required: true, unique: true },
  pass: { type: String, required: true },
  address: { type: String, required: true },
  field: { type: String, required: true },
  aadharImage: { type: String }, 
  experience: { type: Number, required: true }
});

module.exports = mongoose.model("Worker", WorkerSchema);