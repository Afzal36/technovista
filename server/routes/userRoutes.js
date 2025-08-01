// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const admin = require('firebase-admin');

// POST /api/users/signup
router.post('/signup', async (req, res) => {
  try {
    const { uid, email, phone, name, role, field } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ error: "Missing uid or email" });
    }

    // OPTIONAL: Token verification
    // const decoded = await admin.auth().verifyIdToken(req.headers.authorization);
    // if (decoded.uid !== uid) return res.status(401).json({ error: "Unauthorized" });

    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const newUser = new User({ uid, email, phone, name, role, field });
    await newUser.save();

    res.status(201).json({ message: "User registered", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
