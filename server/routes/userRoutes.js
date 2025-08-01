const express = require('express');
const router = express.Router();
const User = require('../models/User');
const admin = require('firebase-admin');

const bcrypt = require('bcrypt');

router.post('/signup', async (req, res) => {
  try {
    const {
      uid,
      email,
      password,
      phone = "",
      name = "New User",
      role = "technician",
      field = "general"
    } = req.body;

    if (!uid || !email || !password) {
      return res.status(400).json({ error: "UID, email, and password are required" });
    }

    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      uid,
      email,
      password: hashedPassword,
      phone,
      name,
      role,
      field
    });

    await newUser.save();

    res.status(201).json({ message: "User registered", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
