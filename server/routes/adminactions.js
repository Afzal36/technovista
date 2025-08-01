const express = require('express');
const router = express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Email setup (unchanged)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "buildwithlumora@gmail.com",
    pass: "clayzcnmlfbodhkl", // App password
  },
});

// Accept worker and send credentials
router.post('/accept-worker/:id', async (req, res) => {
  try {
    const workerId = req.params.id;

    // Find worker by ID (role: worker)
    const worker = await User.findOne({ _id: workerId, role: 'worker' });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    // Generate random password
    const randomPassword = crypto.randomBytes(4).toString('hex'); // 8 characters

    // Send email with credentials
    const mailOptions = {
      from: "buildwithlumora@gmail.com",
      to: worker.email,
      subject: 'Your Login Credentials',
      text: `Hello ${worker.name},\n\nYou are approved!\n\nLogin Credentials:\nEmail: ${worker.email}\nPassword: ${randomPassword}\n\nPlease change your password after login.\n\nRegards,\nAdmin Team`,
    };
    await transporter.sendMail(mailOptions);

    // Update worker status and set new password (hashed)
    worker.status = true;
    worker.password = await bcrypt.hash(randomPassword, 10);
    await worker.save();

    res.status(200).json({ message: 'Worker approved and credentials sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Get all workers (for dashboard)
router.get('/workers', async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' }).select('-password').sort({ createdAt: -1 });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Decline (delete) a worker
router.delete('/workers/:id', async (req, res) => {
  try {
    const worker = await User.findOneAndDelete({ _id: req.params.id, role: 'worker' });
    if (!worker) return res.status(404).json({ error: "Worker not found" });
    res.json({ message: "Worker deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;