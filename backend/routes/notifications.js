const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/UserSchema');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get all notifications for current user
router.get('/my', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get notifications for all users or specifically for this user
    // Exclude expired notifications
    const notifications = await Notification.find({
      $or: [
        { recipientType: 'all' },
        { recipientType: 'specific', recipients: userId },
        { recipientType: 'admin', recipients: userId }
      ],
      expiresAt: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name');

    // Mark which notifications have been read by this user
    const notificationsWithReadStatus = notifications.map(notification => {
      const isRead = notification.read.some(
        readInfo => readInfo.user.toString() === userId
      );
      
      return {
        ...notification.toObject(),
        isRead,
        readAt: isRead 
          ? notification.read.find(r => r.user.toString() === userId).readAt 
          : null
      };
    });

    res.json(notificationsWithReadStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark a notification as read
router.put('/read/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user already read this notification
    const alreadyRead = notification.read.some(
      readInfo => readInfo.user.toString() === req.user.id
    );

    if (!alreadyRead) {
      notification.read.push({
        user: req.user.id,
        readAt: new Date()
      });
      await notification.save();
    }

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // First, get all notifications applicable to this user
    const notifications = await Notification.find({
      $or: [
        { recipientType: 'all' },
        { recipientType: 'specific', recipients: userId },
        { recipientType: 'admin', recipients: userId }
      ],
      expiresAt: { $gt: new Date() }
    });

    // Then count ones that haven't been read
    const unreadCount = notifications.reduce((count, notification) => {
      const isRead = notification.read.some(
        readInfo => readInfo.user.toString() === userId
      );
      return isRead ? count : count + 1;
    }, 0);

    res.json({ unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----- ADMIN ROUTES -----

// Get all notifications (admin only)
router.get('/all', [auth, adminAuth], async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name')
      .populate('recipients', 'name email');
      
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new notification (admin only)
router.post('/', [auth, adminAuth], async (req, res) => {
  try {
    const {
      title,
      message,
      type,
      recipientType,
      recipients,
      link,
      expireDays
    } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    // Create notification object
    const notification = new Notification({
      title,
      message,
      type: type || 'info',
      recipientType: recipientType || 'all',
      link: link || '',
      createdBy: req.user.id
    });

    // Set recipients if specific
    if (recipientType === 'specific' && recipients && recipients.length > 0) {
      // Validate that recipients exist
      const validRecipients = await User.find({ _id: { $in: recipients } });
      notification.recipients = validRecipients.map(user => user._id);
    }
    
    // If admin type, add all admins
    if (recipientType === 'admin') {
      const admins = await User.find({ role: 'admin' });
      notification.recipients = admins.map(admin => admin._id);
    }

    // Set expiration if provided
    if (expireDays) {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + parseInt(expireDays));
      notification.expiresAt = expireDate;
    }

    // Save notification
    const savedNotification = await notification.save();
    
    res.status(201).json(savedNotification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a notification (admin only)
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const {
      title,
      message,
      type,
      recipientType,
      recipients,
      link,
      expireDays
    } = req.body;

    // Find notification
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Update fields if provided
    if (title) notification.title = title;
    if (message) notification.message = message;
    if (type) notification.type = type;
    if (link !== undefined) notification.link = link;

    // Update recipient type and recipients
    if (recipientType) {
      notification.recipientType = recipientType;
      
      // Reset recipients
      notification.recipients = [];
      
      // Set new recipients based on type
      if (recipientType === 'specific' && recipients && recipients.length > 0) {
        const validRecipients = await User.find({ _id: { $in: recipients } });
        notification.recipients = validRecipients.map(user => user._id);
      } else if (recipientType === 'admin') {
        const admins = await User.find({ role: 'admin' });
        notification.recipients = admins.map(admin => admin._id);
      }
    }

    // Update expiration if provided
    if (expireDays) {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + parseInt(expireDays));
      notification.expiresAt = expireDate;
    }

    // Save updated notification
    const updatedNotification = await notification.save();
    
    res.json(updatedNotification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a notification (admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
