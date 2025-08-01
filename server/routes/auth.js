const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "yoursecretkey";

// SIGNUP (user, admin, worker)
router.post("/signup", async (req, res) => {
  try {
    const {
      email, password, name, phone, role = "user",
      address, field, aadhaarImage, experience
    } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    // For user/admin, password is required
    if ((role === "user" || role === "admin") && !password)
      return res.status(400).json({ error: "Password is required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "User already exists" });

    let hashed = "";
    if (role === "user" || role === "admin") {
      hashed = await bcrypt.hash(password, 10);
    }

    let userData = {
      email,
      password: role === "worker" ? "" : hashed,
      name,
      phone,
      role,
      address,
      field,
      aadhaarImage,
      experience,
      status: role === "worker" ? false : undefined
    };

    // Remove undefined fields
    Object.keys(userData).forEach(key => userData[key] === undefined && delete userData[key]);

    const user = await User.create(userData);

    res.status(201).json({ message: "User registered", user: { email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN (user, admin, worker)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });
  if (user) {
    // For workers, password is only set after admin approval
    if (user.role === "worker" && !user.status) {
      return res.status(403).json({ error: "Worker not approved yet" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "1d" });

    // Send all user fields except password
    const userObj = {
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
      address: user.address,
      field: user.field,
      aadhaarImage: user.aadhaarImage,
      experience: user.experience,
      status: user.status,
      createdAt: user.createdAt
    };

    if (user.role === "worker") {
      return res.json({ token, role: user.role, status: user.status, user: userObj });
    }

    return res.json({ token, role: user.role, user: userObj });
  }
  return res.status(404).json({ error: "User not found" });
});

module.exports = router;