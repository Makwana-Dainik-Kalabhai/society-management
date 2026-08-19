const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  societyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  month: {
    type: Number, // 1 to 12
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  breakdown: [{
    item: String, // e.g. "Security & Guard", "Water Supply", "Lift Maintenance", "Sinking Fund"
    amount: Number
  }],
  dueDate: {
    type: Date,
    required: true
  },
  penaltyAmount: {
    type: Number,
    default: 150
  },
  lateFeeDays: {
    type: Number,
    default: 5
  },
  description: {
    type: String,
    default: ''
  },
  paymentReceiver: {
    type: String,
    default: 'Society Maintenance Fund'
  },
  paymentUpiId: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Ensure unique maintenance cycle per month/year per society
MaintenanceSchema.index({ societyId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
