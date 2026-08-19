const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  societyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Society',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['electricity', 'water', 'repairs', 'salaries', 'maintenance', 'security', 'gardening', 'others'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  expenseDate: {
    type: Date,
    default: Date.now
  },
  vendorName: {
    type: String,
    default: ''
  },
  invoiceNumber: {
    type: String,
    default: ''
  },
  receiptImage: {
    type: String,
    default: ''
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
