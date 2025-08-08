// routes/issueReports.js
const express = require('express');
const router = express.Router();
const MinimalIssueReport = require('../models/MinimalIssueReport');

// POST /api/issues/minimal-report
router.post('/minimal-report', async (req, res) => {
  try {
    const {
      phone,
      address,
      label,
      category,
      assignedTo = null,
      status = false
    } = req.body;

    const report = new MinimalIssueReport({
      phone,
      address,
      label,
      category,
      assignedTo,
      status
    });

    await report.save();
    res.status(201).json({ message: 'Report saved successfully', report });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save report', details: err.message });
  }
});

// GET /api/issues/minimal-report
router.get('/minimal-report', async (req, res) => {
  try {
    const reports = await MinimalIssueReport.find().sort({ reportedAt: -1 });
    // Lookup technician email for each report
    const Technician = require('../models/Technician');
    const reportsWithEmail = await Promise.all(reports.map(async (report) => {
      let assignedToEmail = null;
      if (report.assignedTo) {
        // Try lookup by name
        let tech = await Technician.findOne({ name: report.assignedTo });
        // If not found, try by _id
        if (!tech && mongoose.Types.ObjectId.isValid(report.assignedTo)) {
          tech = await Technician.findById(report.assignedTo);
        }
        // If not found, try by email
        if (!tech && /^\S+@\S+\.\S+$/.test(report.assignedTo)) {
          tech = await Technician.findOne({ mail: report.assignedTo });
        }
        assignedToEmail = tech ? tech.mail : null;
      }
      return { ...report.toObject(), assignedToEmail };
    }));
    res.json(reportsWithEmail);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports', details: err.message });
  }
});

// POST /api/issues/assigned - Fetch all issues assigned to a person
router.post('/assigned', async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ error: 'assignedTo is required' });
    }

    const reports = await MinimalIssueReport.find({ assignedTo });

    if (reports.length === 0) {
      return res.status(404).json({ message: 'No reports found for this technician' });
    }

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports', details: err.message });
  }
});

module.exports = router;
