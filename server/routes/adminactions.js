const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const Technician = require('../models/Technician');
const User = require('../models/User'); // ✅ Import User model
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "buildwithlumora@gmail.com",
    pass: "clayzcnmlfbodhkl", // App password
  },
});

// Accept technician and send credentials
router.post('/accept-technician/:id', async (req, res) => {
  try {
    const technicianId = req.params.id;

    // Find technician by ID
    const technician = await Technician.findById(technicianId);
    if (!technician) return res.status(404).json({ error: 'Technician not found' });

    // Generate random password
    const randomPassword = crypto.randomBytes(4).toString('hex'); // 8 characters

    // Create Firebase Auth user
    const firebaseUser = await admin.auth().createUser({
      email: technician.mail,
      password: randomPassword,
    });
    console.log(firebaseUser);

    // Send email with credentials
    const mailOptions = {
      from: "buildwithlumora@gmail.com",
      to: technician.mail,
      subject: 'Your Login Credentials',
      text: `Hello ${technician.name},\n\nYou are approved!\n\nLogin Credentials:\nEmail: ${technician.mail}\nPassword: ${randomPassword}\n\nPlease change your password after login.\n\nRegards,\nAdmin Team`,
    };
    await transporter.sendMail(mailOptions);
    console.log("sent mai;");
    // Update technician status and store password
    technician.status = true;
    technician.pass = randomPassword;
    await technician.save();

    // ✅ Save to users collection
    const newUser = new User({
      uid: firebaseUser.uid,
      email: technician.mail,
      phone: technician.phno,
      name: technician.name,
      role: 'technician',
      field: technician.field || '', 
      password:randomPassword
    });
    await newUser.save();

    res.status(200).json({ message: 'Technician approved and credentials sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
