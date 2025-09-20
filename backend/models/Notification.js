const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String,
    enum: ['order', 'query', 'system', 'welcome', 'info', 'warning', 'success', 'error'],
    default: 'info'
  },
  recipientType: {
    type: String,
    enum: ['all', 'admin', 'specific', 'user'],
    default: 'all'
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  read: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  actionUrl: {
    type: String,
    default: ''
  },
  actionText: {
    type: String,
    default: ''
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  queryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalQuery'
  },
  link: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Default expiration: 30 days from now
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 30);
      return expireDate;
    }
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
