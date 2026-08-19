const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  societyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required']
  },
  type: {
    type: String,
    enum: ['general', 'maintenance', 'payment', 'complaint', 'event', 'alert', 'emergency'],
    default: 'general'
  },
  image: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  target: {
    type: String,
    enum: ['all', 'specific_flats', 'specific_roles', 'specific_wings'],
    default: 'all'
  },
  targetData: [{
    type: String // Wings ('A', 'B') or Flat numbers or Roles
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
