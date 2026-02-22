const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/UserSchema');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { sendPasswordResetEmail } = require('../config/emailService');
const { generatePasswordResetEmail, generatePasswordResetText } = require('../templates/emailTemplates');
require('dotenv').config();
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword,
      phone: phone || ''
    });
    await user.save();
      // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'hello_world', { expiresIn: '7d' });
    
    // Create welcome notification for new user
    try {
      const welcomeNotification = new Notification({
        title: '🎉 Welcome to RMT Medical Store!',
        message: `Hi ${name}! Welcome to RMT Medical Store. We're excited to have you on board. Explore our wide range of quality medicines and healthcare products.`,
        type: 'welcome',
        recipientType: 'specific',
        recipients: [user._id],
        actionUrl: '/products',
        actionText: 'Browse Products',
        link: '/products'
      });
      await welcomeNotification.save();
      console.log('Welcome notification created for new user:', user._id);
    } catch (notificationError) {
      console.error('Failed to create welcome notification:', notificationError);
      // Don't fail signup if notification fails
    }
    
    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name, 
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'hello_world', { expiresIn: '7d' });
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    res.json({ 
      token, 
      user: {
        id: user._id,
        name: user.name, 
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || ''
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password - Send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Save token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    // Generate email content
    const htmlContent = generatePasswordResetEmail(user.name, resetUrl);
    const textContent = generatePasswordResetText(user.name, resetUrl);

    // Send email
    const emailResult = await sendPasswordResetEmail(
      email,
      'Reset Your Password - RMT Medical Store',
      htmlContent,
      textContent
    );

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
    }

    res.status(200).json({ 
      message: 'Password reset email sent successfully. Please check your inbox.' 
    });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Validate Reset Token
router.post('/validate-reset-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Reset token is required' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }

    res.status(200).json({ 
      message: 'Token is valid',
      valid: true 
    });

  } catch (err) {
    console.error('Token validation error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    
    await user.save();

    // Create password changed notification
    try {
      const notification = new Notification({
        title: '🔐 Password Changed Successfully',
        message: `Your password has been updated successfully. If you didn't make this change, please contact support immediately.`,
        type: 'security',
        recipientType: 'specific',
        recipients: [user._id],
        actionUrl: '/profile',
        actionText: 'View Profile',
        link: '/profile'
      });
      await notification.save();
    } catch (notificationError) {
      console.error('Failed to create password change notification:', notificationError);
    }

    res.status(200).json({ 
      message: 'Password reset successfully. You can now login with your new password.' 
    });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) {
      user.address = {
        ...user.address,
        ...address
      };
    }
    
    await user.save();
    
    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        profileImage: user.profileImage || ''
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required' });
    }
    
    // Find user with password
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Routes

// Create admin user (first admin only)
router.post('/create-admin', async (req, res) => {
  try {
    const { name, email, password, adminKey } = req.body;
    
    // Check admin key (replace with a secure approach)
    if (adminKey !== 'rmt-admin-setup-2025') {
      return res.status(403).json({ message: 'Invalid admin setup key' });
    }
    
    // Check if any admin users exist
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(403).json({ message: 'Admin user already exists. Contact existing admin.' });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });
    
    await admin.save();
    
    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all users
router.get('/users', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Change user role
router.put('/users/:id/role', [auth, adminAuth], async (req, res) => {
  try {
    const { role } = req.body;
    
    if (role !== 'user' && role !== 'admin') {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow changing own role
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({ message: `User role updated to ${role}` });
  } catch (err) {
    console.error('Change role error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;