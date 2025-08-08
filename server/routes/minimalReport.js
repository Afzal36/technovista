// routes/minimalReport.js
const express = require('express');
const router = express.Router();
const MinimalIssueReport = require('../models/MinimalIssueReport');
const { getIO } = require('../socket');


// GET /api/issues/minimal-report
router.get('/minimal-report', async (req, res) => {
  try {
    const reports = await MinimalIssueReport.find().sort({ reportedAt: -1 });
    const Technician = require('../models/Technician');
    const reportsWithEmail = await Promise.all(reports.map(async (report) => {
      let assignedToEmail = report.assignedTo;
      if (assignedToEmail && !/^\S+@\S+\.\S+$/.test(assignedToEmail)) {
        const tech = await Technician.findOne({ name: assignedToEmail });
        assignedToEmail = tech ? tech.mail : null;
      }
      return { ...report.toObject(), assignedToEmail };
    }));
    res.json(reportsWithEmail);
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


// Accept/update a report
// In your routes/minimalReport.js - Fix the PATCH route:

router.patch('/minimal-report/:id', async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    console.log("Updating report:", req.params.id);
    console.log("Assigning to:", assignedTo);
    console.log("Status:", status);
    
    const Technician = require('../models/Technician');
    let technicianEmail = assignedTo;
    
    // If assignedTo is not an email, resolve it
    if (assignedTo && !/^\S+@\S+\.\S+$/.test(assignedTo)) {
      const tech = await Technician.findOne({ name: assignedTo });
      if (tech) {
        technicianEmail = tech.mail;
        console.log("Resolved technician name to email:", technicianEmail);
      }
    }

    const report = await MinimalIssueReport.findByIdAndUpdate(
      req.params.id,
      { status, assignedTo: technicianEmail }, // ✅ Store email in database
      { new: true }
    );

    if (!report) return res.status(404).json({ error: "Report not found" });

    console.log("Report updated successfully");
    console.log("User email:", report.email);
    console.log("Technician email:", technicianEmail);

    // Emit socket message to both technician and user
    const io = getIO();
    const userSocketId = io.userSocketMap?.get(report.email);
    const technicianSocketId = io.userSocketMap?.get(technicianEmail);

    console.log("User socket ID:", userSocketId);
    console.log("Technician socket ID:", technicianSocketId);

    if (userSocketId) {
      io.to(userSocketId).emit("chat_started", {
        with: technicianEmail,
        reportId: report._id
      });
      console.log("✅ Sent chat_started to user");
    } else {
      console.log("❌ User socket not found");
    }

    if (technicianSocketId) {
      io.to(technicianSocketId).emit("chat_started", {
        with: report.email,
        reportId: report._id
      });
      console.log("✅ Sent chat_started to technician");
    } else {
      console.log("❌ Technician socket not found");
    }

    res.json(report);
  } catch (err) {
    console.error("Error updating report:", err);
    res.status(500).json({ error: 'Failed to update report', details: err.message });
  }
});


module.exports = router;
