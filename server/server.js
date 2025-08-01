const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const imageClassifierRoute = require("./routes/imageClassifier");
const userRoutes = require("./routes/userRoutes");
const adminActions = require('./routes/adminactions');
const technicianRoutes = require("./routes/technicianRoutes");
const authRoute = require("./routes/auth");
const minimalReportRoutes = require('./routes/minimalReport');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB connected");

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Routes
app.use("/api/technicians", technicianRoutes);
app.use("/api/auth", authRoute);
app.use('/api/admin', adminActions);
app.use("/api/image", imageClassifierRoute);
app.use("/api/users", userRoutes);
app.use('/api/issues', minimalReportRoutes);
