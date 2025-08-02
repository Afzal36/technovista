// routes/minimalReport.js
const express = require('express');
const router = express.Router();
const MinimalIssueReport = require('../models/MinimalIssueReport');

// GET /api/issues/minimal-report
router.get('/minimal-report', async (req, res) => {
  try {
    const reports = await MinimalIssueReport.find().sort({ reportedAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports', details: err.message });
  }
});


router.post('/minimal-report', async (req, res) => {
  try {
    const {
      email,
      phone,
      address,
      label,
      category,
      assignedTo = null, // Optional in request
      status     // Optional in request
    } = req.body;

    const report = new MinimalIssueReport({
      email,
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

// GET all reports
router.get('/minimal-report', async (req, res) => {
  try {
    const reports = await MinimalIssueReport.find().sort({ reportedAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports', details: err.message });
  }
});

// Accept/update a report
router.patch('/minimal-report/:id', async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    const report = await MinimalIssueReport.findByIdAndUpdate(
      req.params.id,
      { status, assignedTo },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update report', details: err.message });
  }
});

module.exports = router;
