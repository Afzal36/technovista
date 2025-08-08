const express = require('express');
const router = express.Router();
const Technician = require('../models/Technician');

const multer = require('multer');
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

router.post('/register', upload.single('aadhaarImage'), async (req, res) => {
  try {
    const tech = req.body;
    let aadhaarImage = "";
    if (req.file) {
      aadhaarImage = req.file.buffer.toString('base64'); // Store as base64 if needed
    } else if (tech.aadhaarImage) {
      aadhaarImage = tech.aadhaarImage;
    }

    const technician = {
      name: tech.name,
      address: tech.address,
      phno: tech.phno,
      mail: tech.mail,
      pass: tech.pass,
      field: tech.field,
      aadhaarImage,
      experience: parseInt(tech.experience) || 0,
      role: tech.role || 'worker',
    };

    const inserted = await Technician.create(technician);

    res.status(201).json({
      message: 'Technician inserted successfully',
      technician: inserted
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /api/technicians - Get all technicians
router.get('/', async (req, res) => {
  try {
    const technicians = await Technician.find();
    res.status(200).json(technicians);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const tech = await Technician.findByIdAndUpdate(
      req.params.id,
      { status: !!status },
      { new: true }
    );
    if (!tech) return res.status(404).json({ error: "Technician not found" });
    res.json({ message: "Status updated", technician: tech });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Optionally, add DELETE route for declining
router.delete('/:id', async (req, res) => {
  try {
    await Technician.findByIdAndDelete(req.params.id);
    res.json({ message: "Technician request declined and deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/byemail', async (req, res) => {
  try {
    const { mail } = req.query;
    if (!mail) return res.status(400).json({ error: "Email required" });
    const technician = await Technician.findOne({ mail: mail.toLowerCase() });
    if (!technician) return res.status(404).json({ error: "Technician not found" });
    res.status(200).json(technician);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /api/technicians/login - Login with email and password
router.post('/login', async (req, res) => {
  try {
    const { mail, pass } = req.body;

    if (!mail || !pass) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const technician = await Technician.findOne({ mail: mail.toLowerCase() });

    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    if (technician.pass !== pass) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      technician,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
