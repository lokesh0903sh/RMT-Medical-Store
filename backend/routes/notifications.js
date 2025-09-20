const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/UserSchema');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Get all notifications for current user with filtering
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, read, page = 1, limit = 10 } = req.query;

    // Build query
    let query = {
      $or: [
        { recipientType: 'all' },
        { recipientType: 'specific', recipients: userId },
        { recipientType: 'admin', recipients: userId },
        { recipientType: 'user', recipients: userId }
      ],
      expiresAt: { $gt: new Date() }
    };

    // Filter by type if specified
    if (type && type !== 'all') {
      query.type = type;
    }

    // Filter by read status if specified
    if (read !== undefined) {
      if (read === 'true') {
        // Show only read notifications
        query.read = true;
      } else if (read === 'false') {
        // Show only unread notifications
        query.read = false;
      }
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name');

    // Mark which notifications have been read by this user and add proper structure
    const notificationsWithReadStatus = notifications.map(notification => {
      // With the simplified model, we just use the boolean read field
      const isRead = notification.read || false;
      
      return {
        ...notification.toObject(),
        isRead,
        readAt: isRead ? notification.updatedAt : null
      };
    });

    const total = await Notification.countDocuments(query);

    res.json({
      notifications: notificationsWithReadStatus,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get unread notification count
router.get('/count', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // First, get all notifications applicable to this user
    const notifications = await Notification.find({
      $or: [
        { recipientType: 'all' },
        { recipientType: 'specific', recipients: userId },
        { recipientType: 'admin', recipients: userId },
        { recipientType: 'user', recipients: userId }
      ],
      expiresAt: { $gt: new Date() }
    });

    // Then count ones that haven't been read
    const unreadCount = notifications.reduce((count, notification) => {
      // With the simplified model, we just check the boolean read field
      const isRead = notification.read || false;
      return isRead ? count : count + 1;
    }, 0);

    res.json({ count: unreadCount });
  } catch (err) {
    console.error('Get notification count error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user already read this notification (simplified boolean approach)
    if (!notification.read) {
      notification.read = true;
      await notification.save();
    }

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Mark notification as read error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Mark all notifications as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Update all unread notifications for user
    await Notification.updateMany(
      {
        $or: [
          { recipientType: 'all' },
          { recipientType: 'specific', recipients: userId },
          { recipientType: 'admin', recipients: userId },
          { recipientType: 'user', recipients: userId }
        ],
        expiresAt: { $gt: new Date() },
        read: false
      },
      { 
        read: true,
        readAt: new Date()
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all notifications as read error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Delete notification error:', err);
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

    // Update notification as read if not already read
    if (!notification.read) {
      notification.read = true;
      notification.readAt = new Date();
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

    // Count unread notifications directly in database
    const unreadCount = await Notification.countDocuments({
      $or: [
        { recipientType: 'all' },
        { recipientType: 'specific', recipients: userId },
        { recipientType: 'admin', recipients: userId }
      ],
      expiresAt: { $gt: new Date() },
      read: false
    });

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
