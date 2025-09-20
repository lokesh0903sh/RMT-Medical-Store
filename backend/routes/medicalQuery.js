const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const MedicalQuery = require("../models/MedicalQuery");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
require("dotenv").config();

// Use Cloudinary storage for prescription files instead of local storage
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary storage for medical query prescriptions
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rmt-medical/prescriptions',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    transformation: [{ quality: 'auto' }],
    // Add resource type detection
    resource_type: (req, file) => {
      // Check if file is PDF or image
      if (file.mimetype === 'application/pdf') {
        return 'raw';
      }
      return 'image';
    }
  }
});

// Configure multer with file size limits and error handling
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Validate file types
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only JPG, PNG and PDF files are allowed.`));
    }
  }
});

// Error handling middleware for multer upload errors
const handleUpload = (req, res, next) => {
  upload.single('prescriptionFile')(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err);
      if (err instanceof multer.MulterError) {
        // Multer error (e.g., file too large)
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      } else {
        // Other errors
        return res.status(400).json({ error: err.message });
      }
    }
    // No error, proceed
    next();
  });
};

router.post("/", handleUpload, async (req, res) => {
  const {
    fullName,
    phone,
    email,
    hasPrescription,
    purchaseWithoutPrescription,
    productList,
    message,
  } = req.body;

  // Get Cloudinary file URL and public ID if a file was uploaded
  const fileUrl = req.file ? req.file.path : null;
  const filePublicId = req.file ? req.file.public_id : null;

  try {
    // Log request info for debugging
    console.log('Received medical query with fields:', req.body);
    console.log('File included:', req.file ? 
      `Yes - ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)` : 
      'No');
    
    const newQuery = new MedicalQuery({
      fullName,
      phone,
      email,
      hasPrescription: hasPrescription === "yes",
      prescriptionFile: fileUrl,
      prescriptionFileId: filePublicId,
      purchaseWithoutPrescription: purchaseWithoutPrescription === "yes",
      productList,
      message,
    });
    await newQuery.save();
    console.log('Medical query saved with ID:', newQuery._id);

    // Create notification for admin about new medical query
    try {
      const adminNotification = new Notification({
        title: '💊 New Medical Query Received',
        message: `New medical query from ${fullName} (${email}). ${hasPrescription === "yes" ? 'Prescription attached.' : 'No prescription.'}`,
        type: 'query',
        recipientType: 'admin',
        queryId: newQuery._id,
        actionUrl: `/admin/queries/${newQuery._id}`,
        actionText: 'View Query',
        link: `/admin/queries/${newQuery._id}`
      });
      await adminNotification.save();
      console.log('Admin notification created for medical query:', newQuery._id);
    } catch (notificationError) {
      console.error('Failed to create admin notification for medical query:', notificationError);
    }

    const pdfBuffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];
    
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);
    
      const pageWidth = doc.page.width;
      const contentWidth = 400;
      const headerY = 120;
      const footerY = doc.page.height - 90;
      const contentX = (pageWidth - contentWidth) / 2;
      const centerY = (headerY + footerY) / 2;
    
      // === Header: Logo Left, Address Right ===
      try {
        doc.image('./assets/RMT_Medical_Store.png', 50, 30, { width: 80 });
      } catch (err) {
        console.warn('Logo not found or failed to load:', err.message);
      }
    
      doc.fontSize(12).fillColor('#333').text(
        `RMT Medical Store\nShop No. 03, Jeevan Nagar,\nWazirpur Road, Near Sikka HP Gas Agency,\nGreater Faridabad - 121002, Haryana, India`,
        pageWidth - 300,
        30,
        { align: 'right', width: 250 }
      );
    
      // === Horizontal Line After Header ===
      doc.moveTo(50, 120).lineTo(pageWidth - 50, 120).strokeColor('#aaaaaa').stroke();
    
      // === Watermark Logo (Transparent, Centered Behind Content) ===
      try {
        doc.save();
    doc.opacity(0.1);
    const watermarkWidth = 300;
    const centerX = (pageWidth - watermarkWidth) / 2;
    doc.image('./assets/RMT_Medical_Store.png', centerX, centerY - 150, { width: watermarkWidth });
    doc.restore();
  } catch (err) {
    console.warn('Watermark logo failed:', err.message);
      }
    
      // === Main Heading ===
      doc.moveDown(5);
      doc.fontSize(18).fillColor('#1a202c').text('Medical Store Inquiry', (pageWidth-150)/2 ,doc.y, {
        underline: true
      });
    
      doc.moveDown(2);
      doc.fontSize(12).fillColor('#000000');
    
      // === Submission Info (Centered with spacing) ===
      const lineOptions = { width: contentWidth, lineGap: 5 };
      doc.text(`Name: ${fullName}`, contentX, doc.y, lineOptions);
      doc.text(`Phone: ${phone}`, contentX, doc.y, lineOptions);
      doc.text(`Email: ${email}`, contentX, doc.y, lineOptions);
      doc.text(`Has Prescription: ${hasPrescription ? 'Yes' : 'No'}`, contentX, doc.y, lineOptions);
      doc.text(`Purchase Without Prescription: ${purchaseWithoutPrescription ? 'Yes' : 'No'}`, contentX, doc.y, lineOptions);
    
      if (productList) doc.text(` Product List: ${productList}`, contentX, doc.y, lineOptions);
      if (message) doc.text(`Message: ${message}`, contentX, doc.y, lineOptions);
    
      doc.moveDown();
      doc.text(`Submitted On: ${new Date().toLocaleString()}`, contentX, doc.y, lineOptions);
    
      // === Horizontal Line Before Footer ===
      doc.moveDown(3);
      const footerLineY = doc.page.height - 90;
      doc.moveTo(50, footerLineY).lineTo(pageWidth - 50, footerLineY).strokeColor('#aaaaaa').stroke();
    
      // === Footer ===
      doc.fontSize(12).fillColor('#555');
      doc.text(
        `rmtmedical2005@gmail.com  |  +91 9310940557, +91 9582810565  |  www.rmtmedicalstore.in`,
        25,
        footerY+10,
        { align: 'center', width: pageWidth - 30 }
      );
    
      doc.end();
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Create attachments array with the PDF receipt
    const attachments = [
      { filename: "receipt.pdf", content: pdfBuffer },
    ];
    
    // If we have a Cloudinary prescription file URL, add it to the email notification
    if (fileUrl) {
      attachments.push({
        filename: "prescription" + (fileUrl.endsWith('.pdf') ? '.pdf' : '.jpg'),
        path: fileUrl
      });
    }

    const ownerMailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: "New Medical Inquiry Submitted",
      text: `
        New Inquiry:

        Name: ${fullName}
        Phone: ${phone}
        Email: ${email}
        Has Prescription: ${hasPrescription === "yes" ? "Yes" : "No"}
        Purchase Without Prescription: ${purchaseWithoutPrescription === "yes" ? "Yes" : "No"}
        Product List: ${productList || "N/A"}
        Message: ${message || "N/A"}
        ${fileUrl ? `Prescription File: ${fileUrl}` : ""}
      `,
      attachments,
    };

    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for your query",
      text: `Hi ${fullName},\n\nThank you for contacting our medical store. We received your inquiry and will get back to you soon.\n\nYour Message: ${message || "N/A"}`,
      attachments: [{ filename: "receipt.pdf", content: pdfBuffer }],
    };

    await Promise.all([
      transporter.sendMail(ownerMailOptions),
      transporter.sendMail(userMailOptions),
    ]);

    return res.status(200).json({
      message: "Your query has been submitted. A receipt has been sent to your email.",
    });
  } catch (error) {
    console.error("Error in /medical-query:", error);
    
    // Improved error logging for debugging
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    
    // Send more specific error message
    const errorMessage = error.code === 'ENOENT' ? 
      'File access error' : 
      (error.message || 'Submission failed');
      
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/medical-queries - Get all queries (Admin only)
router.get("/", adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const queries = await MedicalQuery.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MedicalQuery.countDocuments(filter);

    res.json({
      queries,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching queries:", error);
    res.status(500).json({ error: "Failed to fetch queries" });
  }
});

// PUT /api/medical-queries/:id/status - Update query status (Admin only)
router.put("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'in-progress', 'resolved', 'closed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const query = await MedicalQuery.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('user', 'name email');

    if (!query) {
      return res.status(404).json({ error: "Query not found" });
    }

    res.json(query);
  } catch (error) {
    console.error("Error updating query status:", error);
    res.status(500).json({ error: "Failed to update query status" });
  }
});

// POST /api/medical-queries/:id/response - Add response to query (Admin only)
router.post("/:id/response", adminAuth, async (req, res) => {
  try {
    const { response } = req.body;
    
    if (!response || !response.trim()) {
      return res.status(400).json({ error: "Response is required" });
    }

    const query = await MedicalQuery.findByIdAndUpdate(
      req.params.id,
      { 
        response: response.trim(),
        responseDate: new Date(),
        status: 'resolved',
        updatedAt: new Date()
      },
      { new: true }
    ).populate('user', 'name email');

    if (!query) {
      return res.status(404).json({ error: "Query not found" });
    }

    // Send email notification to user if email exists
    if (query.email) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: query.email,
          subject: "Response to Your Medical Query - RMT Medical Store",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #036372;">Response to Your Medical Query</h2>
              <p>Dear ${query.fullName || 'Valued Customer'},</p>
              <p>We have reviewed your medical query and here is our response:</p>
              <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #036372; margin: 20px 0;">
                <p><strong>Your Query:</strong></p>
                <p>${query.message || 'N/A'}</p>
              </div>
              <div style="background-color: #e8f5e8; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
                <p><strong>Our Response:</strong></p>
                <p>${response}</p>
              </div>
              <p><em>Note: This response is for informational purposes only and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.</em></p>
              <p>Best regards,<br>RMT Medical Store Team</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Error sending response email:", emailError);
      }
    }

    res.json(query);
  } catch (error) {
    console.error("Error adding response:", error);
    res.status(500).json({ error: "Failed to add response" });
  }
});

module.exports = router;
