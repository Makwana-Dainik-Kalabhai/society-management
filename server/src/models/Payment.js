const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
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
  maintenanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Maintenance',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    required: true
  },
  penaltyAmount: {
    type: Number,
    default: 0
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'upi', 'card', 'online', 'cheque'],
    default: 'online'
  },
  transactionId: {
    type: String,
    default: function() {
      return `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  },
  receiptNumber: {
    type: String,
    unique: true
  },
  isPenalty: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  notes: {
    type: String,
    default: ''
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  paymentDetails: {
    gateway: {
      type: String,
      default: 'razorpay'
    },
    orderId: String,
    paymentId: String,
    signature: String
  }
}, { timestamps: true });

// Auto-generate receipt number
PaymentSchema.pre('save', async function(next) {
  if (!this.receiptNumber) {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    this.receiptNumber = `REC-${year}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
