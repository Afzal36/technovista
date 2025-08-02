// Fixed nodemailer.js - Backend Route
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = 'uploads/';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Configure Nodemailer transporter (moved outside route for reuse)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'buildwithlumora@gmail.com',
    pass: 'clayzcnmlfbodhkl' // Make sure this is your actual App Password
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection failed:', error);
  } else {
    console.log('✅ SMTP server is ready to send emails');
  }
});

// POST Route: /send-email
router.post('/send-email', upload.single('pdf'), async (req, res) => {
  console.log('📨 Email send request received');
  console.log('Request body:', req.body);
  console.log('Uploaded file:', req.file);

  try {
    const { text, email } = req.body;
    const pdfFile = req.file;

    // Validate required fields
    if (!email || !text) {
      console.error('❌ Missing required fields: email or text');
      return res.status(400).json({ 
        success: false,
        message: 'Email and text are required fields' 
      });
    }

    if (!pdfFile) {
      console.error('❌ No PDF file uploaded');
      return res.status(400).json({ 
        success: false,
        message: 'PDF file is required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format:', email);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format' 
      });
    }

    // Validate file exists
    if (!fs.existsSync(pdfFile.path)) {
      console.error('❌ PDF file not found at path:', pdfFile.path);
      return res.status(400).json({ 
        success: false,
        message: 'PDF file upload failed' 
      });
    }

    console.log('✅ Validation passed, preparing to send email...');
    console.log('📧 Recipient email:', email);
    console.log('📎 PDF file path:', pdfFile.path);
    console.log('📎 PDF file size:', pdfFile.size, 'bytes');

    // Email options
    const mailOptions = {
      from: 'buildwithlumora@gmail.com',
      to: email,
      subject: 'Invoice - Payment Receipt',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">IWCWT Ministry</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Payment Invoice</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Payment Confirmation</h2>
            <p style="color: #666; line-height: 1.6;">${text}</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #333;"><strong>📎 Invoice attached as PDF</strong></p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Please save this document for your records.</p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;">
            
            <p style="color: #666; font-size: 14px; margin: 0;">
              <strong>Contact Information:</strong><br>
              Email: info@iwcwtministry.org<br>
              Location: India
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
              This is an automated email. Please do not reply to this message.<br>
              If you have any questions, please contact us at info@iwcwtministry.org
            </p>
          </div>
        </div>
      `,
      text: `${text}\n\nPlease find your invoice attached as a PDF document.\n\nContact: info@iwcwtministry.org\nThis is an automated email.`,
      attachments: [
        {
          filename: pdfFile.originalname,
          path: pdfFile.path,
          contentType: 'application/pdf'
        }
      ]
    };

    console.log('📤 Sending email...');
    console.log('📧 From:', mailOptions.from);
    console.log('📧 To:', mailOptions.to);
    console.log('📧 Subject:', mailOptions.subject);

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Response:', info.response);

    // Clean up: Delete the uploaded file
    try {
      fs.unlinkSync(pdfFile.path);
      console.log('🗑️ Uploaded file deleted successfully');
    } catch (unlinkError) {
      console.error('⚠️ Failed to delete uploaded file:', unlinkError);
      // Don't fail the request if file deletion fails
    }

    res.status(200).json({ 
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      recipient: email
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // Clean up file if it exists and there was an error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('🗑️ Cleaned up file after error');
      } catch (unlinkError) {
        console.error('Failed to delete file after error:', unlinkError);
      }
    }

    // Provide more specific error messages
    let errorMessage = 'Failed to send email';
    let statusCode = 500;

    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Check Gmail credentials and App Password.';
      statusCode = 401;
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNECTION') {
      errorMessage = 'Network error. Check internet connection.';
      statusCode = 503;
    } else if (error.responseCode === 535) {
      errorMessage = 'Invalid email credentials. Ensure 2FA is enabled and using App Password.';
      statusCode = 401;
    } else if (error.code === 'EMESSAGE') {
      errorMessage = 'Invalid email content or recipient.';
      statusCode = 400;
    } else if (error.message && error.message.includes('recipient')) {
      errorMessage = 'Invalid recipient email address.';
      statusCode = 400;
    }

    console.error('📧 Specific error details:', {
      code: error.code,
      responseCode: error.responseCode,
      message: error.message
    });

    res.status(statusCode).json({ 
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Email service is healthy',
    timestamp: new Date().toISOString()
  });
});

// Test email route (for debugging)
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const mailOptions = {
      from: 'buildwithlumora@gmail.com',
      to: email,
      subject: 'Test Email - IWCWT Ministry',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Test Email</h2>
          <p>This is a test email to verify the email service is working correctly.</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        </div>
      `,
      text: `Test Email\n\nThis is a test email to verify the email service is working correctly.\nTime: ${new Date().toLocaleString()}`
    };

    const info = await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId,
      recipient: email
    });

  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({
      success: false,
      message: 'Test email failed',
      error: error.message
    });
  }
});

module.exports = router;