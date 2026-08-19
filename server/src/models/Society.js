const mongoose = require('mongoose');

const SocietySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Society name is required'],
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    default: 'Metropolis'
  },
  state: {
    type: String,
    default: 'State'
  },
  pincode: {
    type: String,
    default: '400001'
  },
  contactEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    default: ''
  },
  numberOfWings: {
    type: Number,
    default: 3
  },
  numberOfFloors: {
    type: Number,
    default: 10
  },
  wings: [{
    name: String, // e.g., 'A', 'B', 'C'
    totalFlats: Number,
    floors: Number
  }],
  settings: {
    maintenanceDeadline: {
      type: Number,
      default: 10 // 10th of every month
    },
    defaultMonthlyMaintenance: {
      type: Number,
      default: 3500
    },
    penaltyRate: {
      type: Number,
      default: 100 // Flat late fee per day or fixed
    },
    lateFeeDays: {
      type: Number,
      default: 5
    },
    currency: {
      type: String,
      default: 'INR'
    },
    upiId: {
      type: String,
      default: 'emeraldheights@okhdfcbank'
    },
    paymentReceiverName: {
      type: String,
      default: 'Emerald Heights Maintenance Committee'
    },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Society', SocietySchema);
