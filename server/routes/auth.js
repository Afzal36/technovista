const express = require("express");
const admin = require("firebase-admin");
const User = require("../models/User");

const router = express.Router();

router.post("/auth", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const { uid, email, phone_number: phone, name } = decoded;
    const { role } = req.body;

    let user = await User.findOne({ uid });
    if (!user) {
      user = await User.create({ uid, email, phone, name, role });
    } else if (role && user.role !== role) {
      user.role = role;
      await user.save();
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;