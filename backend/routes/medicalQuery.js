const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const MedicalQuery = require("../models/MedicalQuery");
require("dotenv").config();

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post("/", upload.single("prescriptionFile"), async (req, res) => {
  const {
    fullName,
    phone,
    email,
    hasPrescription,
    purchaseWithoutPrescription,
    productList,
    message,
  } = req.body;

  const filePath = req.file ? req.file.filename : null;

  try {
    const newQuery = new MedicalQuery({
      fullName,
      phone,
      email,
      hasPrescription: hasPrescription === "yes",
      prescriptionFile: filePath,
      purchaseWithoutPrescription: purchaseWithoutPrescription === "yes",
      productList,
      message,
    });
    await newQuery.save();

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

    const attachments = [
      ...(filePath ? [{ path: `./uploads/${filePath}` }] : []),
      { filename: "receipt.pdf", content: pdfBuffer },
    ];

    const ownerMailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: "New Medical Inquiry Submitted",
      text: `
        New Inquiry:

        Name: ${fullName}
        Phone: ${phone}
        Email: ${email}
        Has Prescription: ${hasPrescription}
        Purchase Without Prescription: ${purchaseWithoutPrescription}
        Product List: ${productList || "N/A"}
        Message: ${message || "N/A"}
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

    if (filePath) fs.unlinkSync(`./uploads/${filePath}`);

    return res.status(200).json({
      message: "Your query has been submitted. A receipt has been sent to your email.",
    });
  } catch (error) {
    console.error("Error in /medical-query:", error);
    res.status(500).json({ error: "Submission failed" });
  }
});

module.exports = router;
