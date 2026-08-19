const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  societyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketNumber: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required']
  },
  category: {
    type: String,
    enum: ['maintenance', 'security', 'noise', 'parking', 'plumbing', 'electrical', 'cleanliness', 'other'],
    default: 'maintenance'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  images: [{
    type: String
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Staff or Admin
  },
  adminRemarks: {
    type: String,
    default: ''
  },
  resolution: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date
  },
  timeline: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Auto-generate ticket number
ComplaintSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.ticketNumber = `TKT-${Date.now().toString().slice(-4)}${randomSuffix}`;
  }
  next();
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
