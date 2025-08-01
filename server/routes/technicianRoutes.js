const express = require('express');
const router = express.Router();
const Technician = require('../models/Technician');

// POST /api/technicians/register - Bulk insert technicians
router.post('/register', async (req, res) => {
  try {
    const data = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({ error: 'Expected array of technicians' });
    }

    const technicians = data.map((tech, index) => ({
      name: tech.name || `Technician ${index + 1}`,
      address: tech.address || `${tech.area || 'Unknown'} Lane, Hyderabad`,
      phno: tech.phno || tech.phone,
      mail: tech.mail || `tech${index + 1}@example.com`,
      pass: tech.pass || 'Dummy@123',
      field: tech.field || tech.category,
      aadhaarImage: tech.aadhaarImage || `aadhaar_${index + 1}.jpg`,
      experience: parseInt(tech.experience) || 0,
      // status will default to false
    }));

    const inserted = await Technician.insertMany(technicians);

    res.status(201).json({
      message: 'Technicians inserted successfully',
      technicians: inserted
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
