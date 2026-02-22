const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to other email services
    auth: {
      user: process.env.EMAIL_USER || 'rmtmedical2005@gmail.com', // Your email
      pass: process.env.EMAIL_PASS // Your app password
    },
    // Alternatively, you can use SMTP configuration:
    /*
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
    */
  });
};

// Send password reset email
const sendPasswordResetEmail = async (to, subject, htmlContent, textContent) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'RMT Medical Store',
        address: process.env.EMAIL_USER || 'rmtmedical2005@gmail.com'
      },
      to: to,
      subject: subject,
      html: htmlContent,
      text: textContent,
      // Add some security headers
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email service is ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  testEmailConfig
};