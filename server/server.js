const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const admin = require("firebase-admin");
const axios = require('axios');

// Route imports
const imageClassifierRoute = require("./routes/imageClassifier");
const userRoutes = require("./routes/userRoutes");
const adminActions = require('./routes/adminactions');
const technicianRoutes = require("./routes/technicianRoutes");
const authRoute = require("./routes/auth");
const minimalReportRoutes = require('./routes/minimalReport');

const emailRoute=require('../server/routes/nodemailer')

const issueReportRoutes = require('./routes/issueReports'); 

dotenv.config();


const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected");
  // Start server only after DB is connected
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Increase limit to 10MB

// PayPal Configuration
const CLIENT = process.env.PAYPAL_CLIENT_ID;
const SECRET = process.env.PAYPAL_SECRET;
const base = "https://api-m.sandbox.paypal.com"; // Sandbox URL

// Validate PayPal environment variables
if (!CLIENT || !SECRET) {
  console.error("⚠️ Missing PayPal credentials in .env file");
  console.error("Please add to your .env file:");
  console.error("PAYPAL_CLIENT_ID=your_client_id");
  console.error("PAYPAL_SECRET=your_secret");
  console.log("🔄 PayPal functionality will be disabled");
} else {
  console.log("✅ PayPal Client ID loaded:", CLIENT ? "Present" : "Missing");
  console.log("✅ PayPal Secret loaded:", SECRET ? "Present" : "Missing");
}

// Firebase Admin SDK Initialization
const serviceAccount = require('../server/firebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// PayPal Helper Functions
const getAccessToken = async () => {
  if (!CLIENT || !SECRET) {
    throw new Error("PayPal credentials not configured");
  }
  
  try {
    const response = await axios({
      url: `${base}/v1/oauth2/token`,
      method: "post",
      headers: {
        "Accept": "application/json",
        "Accept-Language": "en_US",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      auth: {
        username: CLIENT,
        password: SECRET
      },
      params: {
        grant_type: "client_credentials"
      }
    });
    
    console.log("✅ Access token obtained successfully");
    return response.data.access_token;
  } catch (error) {
    console.error("❌ Failed to get access token:", error.response?.data || error.message);
    throw error;
  }
};

// PayPal Routes - Legacy paths for backward compatibility
app.post("/create-order", async (req, res) => {
  try {
    if (!CLIENT || !SECRET) {
      return res.status(500).json({ 
        error: "PayPal not configured", 
        message: "PayPal credentials are missing from environment variables" 
      });
    }

    console.log("📨 Creating PayPal order...");
    const accessToken = await getAccessToken();
    const { amount } = req.body;
    
    console.log("➡️ Incoming amount from frontend:", amount);
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      console.error("❌ Invalid amount sent from frontend:", amount);
      return res.status(400).json({ error: "Invalid amount" });
    }

    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: parseFloat(amount).toFixed(2)
          }
        }
      ]
    };

    console.log("📦 Order data:", JSON.stringify(orderData, null, 2));

    const response = await axios.post(`${base}/v2/checkout/orders`, orderData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    console.log("✅ PayPal order created successfully:", response.data.id);
    res.json({ id: response.data.id });
    
  } catch (error) {
    console.error("❌ Error creating PayPal order:");
    if (error.response && error.response.data) {
      console.error("PayPal API Response Error:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Unknown error:", error.message);
    }
    res.status(500).json({ 
      error: "Failed to create PayPal order", 
      details: error.response?.data 
    });
  }
});

app.post("/capture-order/:orderId", async (req, res) => {
  try {
    if (!CLIENT || !SECRET) {
      return res.status(500).json({ 
        error: "PayPal not configured", 
        message: "PayPal credentials are missing from environment variables" 
      });
    }

    console.log("💰 Capturing PayPal order...");
    const accessToken = await getAccessToken();
    const { orderId } = req.params;
    
    console.log("📋 Order ID:", orderId);
    
    const response = await axios.post(`${base}/v2/checkout/orders/${orderId}/capture`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });
    
    console.log("✅ PayPal order captured successfully");
    console.log("Payment details:", JSON.stringify(response.data, null, 2));
    res.json(response.data);
    
  } catch (error) {
    console.error("❌ Error capturing PayPal order:");
    if (error.response && error.response.data) {
      console.error("PayPal API Response Error:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Unknown error:", error.message);
    }
    res.status(500).json({ 
      error: "Failed to capture PayPal order", 
      details: error.response?.data 
    });
  }
});

// New PayPal Routes (prefixed with /api/paypal)
app.post("/api/paypal/create-order", async (req, res) => {
  try {
    if (!CLIENT || !SECRET) {
      return res.status(500).json({ 
        error: "PayPal not configured", 
        message: "PayPal credentials are missing from environment variables" 
      });
    }

    console.log("📨 Creating PayPal order...");
    const accessToken = await getAccessToken();
    const { amount } = req.body;
    
    console.log("➡️ Incoming amount from frontend:", amount);
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      console.error("❌ Invalid amount sent from frontend:", amount);
      return res.status(400).json({ error: "Invalid amount" });
    }

    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: parseFloat(amount).toFixed(2)
          }
        }
      ]
    };

    console.log("📦 Order data:", JSON.stringify(orderData, null, 2));

    const response = await axios.post(`${base}/v2/checkout/orders`, orderData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    console.log("✅ PayPal order created successfully:", response.data.id);
    res.json({ id: response.data.id });
    
  } catch (error) {
    console.error("❌ Error creating PayPal order:");
    if (error.response && error.response.data) {
      console.error("PayPal API Response Error:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Unknown error:", error.message);
    }
    res.status(500).json({ 
      error: "Failed to create PayPal order", 
      details: error.response?.data 
    });
  }
});

app.post("/api/paypal/capture-order/:orderId", async (req, res) => {
  try {
    if (!CLIENT || !SECRET) {
      return res.status(500).json({ 
        error: "PayPal not configured", 
        message: "PayPal credentials are missing from environment variables" 
      });
    }

    console.log("💰 Capturing PayPal order...");
    const accessToken = await getAccessToken();
    const { orderId } = req.params;
    
    console.log("📋 Order ID:", orderId);
    
    const response = await axios.post(`${base}/v2/checkout/orders/${orderId}/capture`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });
    
    console.log("✅ PayPal order captured successfully");
    console.log("Payment details:", JSON.stringify(response.data, null, 2));
    res.json(response.data);
    
  } catch (error) {
    console.error("❌ Error capturing PayPal order:");
    if (error.response && error.response.data) {
      console.error("PayPal API Response Error:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Unknown error:", error.message);
    }
    res.status(500).json({ 
      error: "Failed to capture PayPal order", 
      details: error.response?.data 
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  const paypalStatus = (CLIENT && SECRET) ? "configured" : "not configured";
  res.json({ 
    status: "OK", 
    message: "Server is running",
    paypal: paypalStatus,
    timestamp: new Date().toISOString()
  });
});

// Application Routes
app.use("/api/technicians", technicianRoutes);
app.use("/api/auth", authRoute); // Updated to use /api/auth prefix consistently
app.use('/api/admin', adminActions);
app.use("/api/image", imageClassifierRoute);
app.use("/api/users", userRoutes);
app.use('/api/issues', minimalReportRoutes);

app.use('/api/send-mail', emailRoute);

app.use('/api/reports', issueReportRoutes);
