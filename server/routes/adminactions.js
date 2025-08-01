// routes/adminActions.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const Technician = require('../models/Technician');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user:"buildwithlumora@gmail.com", 
    pass:"clayzcnmlfbodhkl", // your email app password
  },
});

// Accept technician
router.post('/accept-technician/:id', async (req, res) => {
  try {
    const technicianId = req.params.id;

    // Find technician
    const technician = await Technician.findById(technicianId);
    if (!technician) return res.status(404).json({ error: 'Technician not found' });

    // Generate random password
    const randomPassword = crypto.randomBytes(4).toString('hex'); // 8 char

    // Create Firebase user
    const firebaseUser = await admin.auth().createUser({
      email: technician.mail,
      password: randomPassword,
    });

    // Send email with credentials
    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: technician.mail,
      subject: 'Your Login Credentials',
      text: `Hello ${technician.name},\n\nYou are approved!\nLogin Credentials:\nEmail: ${technician.mail}\nPassword: ${randomPassword}\n\nRegards,\nAdmin Team`
    };
    await transporter.sendMail(mailOptions);

    // Update MongoDB: set status to true and store password
    technician.status = true;
    technician.pass = randomPassword;
    await technician.save();

    res.status(200).json({ message: 'Technician approved and credentials sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
