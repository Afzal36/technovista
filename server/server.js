const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const admin = require("firebase-admin");
const imageClassifierRoute = require("./routes/imageClassifier");



const adminActions = require('./routes/adminactions');
const technicianRoutes = require("./routes/technicianRoutes");
const authRoute = require("./routes/auth");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Increase limit to 10MB


// Firebase Admin SDK Initialization
<<<<<<< HEAD
const serviceAccount = require('../server/firebase.json');
=======
//const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);
>>>>>>> 6a5ba6ac17ffd166386024748929f35acafe4150

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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
app.use("/", authRoute);
app.use('/api/admin', adminActions);
app.use("/api/image", imageClassifierRoute);