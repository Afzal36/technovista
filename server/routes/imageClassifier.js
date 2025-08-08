const express = require("express");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const router = express.Router();

// Multer setup to accept image files
const upload = multer({ dest: "uploads/" });

// Gemini API setup
const genAI = new GoogleGenerativeAI("AIzaSyA6zycmOcp7KiMFm12wthLoRdDtYcLjxf8");

// Helper to convert file to base64
function fileToBase64(filePath) {
  const imageBuffer = fs.readFileSync(filePath);
  return imageBuffer.toString("base64");
}

router.post("/classify-image", upload.single("image"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const base64Image = fileToBase64(filePath);

    // Corrected model reference with "models/" prefix
    const model = genAI.getGenerativeModel({ model: "models/gemini-pro-vision" });


    // Proper request structure with role and parts
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: req.file.mimetype,
              },
            },
            {
              text: "Classify the maintenance issue in the image as one of the following categories: Electrical, Plumbing, Civil, or Other.",
            },
          ],
        },
      ],
    });

    const response = await result.response;
    const text = await response.text();

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.status(200).json({ classification: text });
  } catch (error) {
    console.error("Gemini Classification Error:", error.message);
    res.status(500).json({ error: "Classification failed" });
  }
});

module.exports = router;
