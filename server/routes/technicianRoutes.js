const express = require('express');
const router = express.Router();
const Technician = require('../models/Technician');

// POST /api/technicians/register - Bulk insert technicians
router.post('/register', async (req, res) => {
  try {
    const tech = req.body;

    // Build technician object with defaults
    const technician = {
      name: tech.name || 'Technician 1',
      address: tech.address || `${tech.area || 'Unknown'} Lane, Hyderabad`,
      phno: tech.phno || tech.phone,
      mail: tech.mail || 'tech1@example.com',
      pass: tech.pass || 'Dummy@123',
      field: tech.field || tech.category,
      aadhaarImage: tech.aadhaarImage || 'aadhaar_1.jpg',
      experience: parseInt(tech.experience) || 0,
      // status will default to false
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

module.exports = router;
