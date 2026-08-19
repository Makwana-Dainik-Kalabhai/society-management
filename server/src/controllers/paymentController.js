const Payment = require('../models/Payment');
const Maintenance = require('../models/Maintenance');
const User = require('../models/User');
const Society = require('../models/Society');
const { createOrder, verifyPaymentSignature } = require('../services/paymentService');
const { generatePaymentReceiptPDF } = require('../services/pdfService');

// @desc    Get all society payments (Society Admin)
// @route   GET /api/society/payments
// @access  Private (society_admin, main_admin)
const getAllPayments = async (req, res, next) => {
  try {
    const rawSocietyId = req.user.societyId || req.query.societyId;
    const { status, paymentMethod, search } = req.query;

    const query = {};
    if (rawSocietyId) query.societyId = rawSocietyId;
    if (status && status !== 'all') query.status = status;
    if (paymentMethod && paymentMethod !== 'all') query.paymentMethod = paymentMethod;

    let payments = await Payment.find(query)
      .populate('userId', 'fullName email mobileNumber memberDetails')
      .populate('maintenanceId', 'title month year amount')
      .populate('recordedBy', 'fullName')
      .sort({ paymentDate: -1 });

    if (search) {
      payments = payments.filter(p => 
        p.userId?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        p.userId?.memberDetails?.flatNumber?.toLowerCase().includes(search.toLowerCase()) ||
        p.receiptNumber?.toLowerCase().includes(search.toLowerCase()) ||
        p.transactionId?.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in member's payments
// @route   GET /api/member/payments
// @access  Private (member)
const getMemberPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate('maintenanceId', 'title month year amount dueDate breakdown')
      .sort({ paymentDate: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Initiate Razorpay / Online Order
// @route   POST /api/member/payments/initiate
// @access  Private (member)
const initiatePaymentOrder = async (req, res, next) => {
  try {
    const { maintenanceId } = req.body;
    const maintenance = await Maintenance.findById(maintenanceId);

    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Maintenance bill not found' });
    }

    // Check if overdue
    const isOverdue = new Date() > new Date(maintenance.dueDate);
    const penalty = isOverdue ? (maintenance.penaltyAmount || 150) : 0;
    const totalAmount = maintenance.amount + penalty;

    const order = await createOrder({
      amount: totalAmount,
      currency: 'INR',
      receipt: `maint_${maintenanceId}_${req.user._id}`
    });

    res.json({
      success: true,
      order,
      amount: totalAmount,
      baseAmount: maintenance.amount,
      penaltyAmount: penalty,
      maintenance
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify and complete payment
// @route   POST /api/member/payments/verify
// @access  Private (member)
const verifyAndSavePayment = async (req, res, next) => {
  try {
    const { maintenanceId, paymentDetails, paymentMethod = 'online' } = req.body;

    const maintenance = await Maintenance.findById(maintenanceId);
    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    const isOverdue = new Date() > new Date(maintenance.dueDate);
    const penaltyAmount = isOverdue ? (maintenance.penaltyAmount || 150) : 0;
    const totalPayable = maintenance.amount + penaltyAmount;

    // Verify signature if provided
    if (paymentDetails && paymentDetails.signature) {
      const isValid = verifyPaymentSignature({
        orderId: paymentDetails.orderId,
        paymentId: paymentDetails.paymentId,
        signature: paymentDetails.signature
      });
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
    }

    // Check if already paid
    const existing = await Payment.findOne({
      userId: req.user._id,
      maintenanceId,
      status: 'completed'
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This maintenance bill has already been paid.',
        payment: existing
      });
    }

    const payment = await Payment.create({
      societyId: req.user.societyId,
      userId: req.user._id,
      maintenanceId,
      amount: maintenance.amount,
      paidAmount: totalPayable,
      penaltyAmount,
      paymentDate: new Date(),
      dueDate: maintenance.dueDate,
      paymentMethod,
      isPenalty: isOverdue,
      status: 'completed',
      transactionId: paymentDetails?.paymentId || `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      paymentDetails: paymentDetails || { gateway: 'online_demo' }
    });

    const populated = await Payment.findById(payment._id)
      .populate('userId', 'fullName email mobileNumber memberDetails')
      .populate('maintenanceId', 'title month year');

    // Real-time broadcast
    const io = req.app.get('io');
    if (io && req.user.societyId) {
      io.to(`society_${req.user.societyId}`).emit('payment_received', {
        payment: populated,
        message: `Maintenance payment of ₹${totalPayable} received from ${req.user.fullName}`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Payment completed successfully! Receipt generated.',
      payment: populated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Record manual offline payment (Admin)
// @route   POST /api/society/payments
// @access  Private (society_admin)
const recordOfflinePayment = async (req, res, next) => {
  try {
    const { userId, maintenanceId, paymentMethod = 'cash', paidAmount, notes } = req.body;

    const maintenance = await Maintenance.findById(maintenanceId);
    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    const isOverdue = new Date() > new Date(maintenance.dueDate);
    const penaltyAmount = isOverdue ? (maintenance.penaltyAmount || 150) : 0;
    const finalAmount = paidAmount || (maintenance.amount + penaltyAmount);

    const payment = await Payment.create({
      societyId: req.user.societyId,
      userId,
      maintenanceId,
      amount: maintenance.amount,
      paidAmount: finalAmount,
      penaltyAmount,
      paymentDate: new Date(),
      dueDate: maintenance.dueDate,
      paymentMethod,
      isPenalty: isOverdue,
      status: 'completed',
      notes: notes || `Recorded by ${req.user.fullName}`,
      recordedBy: req.user._id
    });

    const populated = await Payment.findById(payment._id)
      .populate('userId', 'fullName email mobileNumber memberDetails')
      .populate('maintenanceId', 'title month year');

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      payment: populated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Stream / Download PDF Receipt
// @route   GET /api/society/payments/receipt/:id or GET /api/member/payments/receipt/:id
// @access  Private
const getPaymentReceiptPDF = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const user = await User.findById(payment.userId);
    const society = await Society.findById(payment.societyId);
    const maintenance = await Maintenance.findById(payment.maintenanceId);

    const pdfBuffer = await generatePaymentReceiptPDF(payment, user, society, maintenance);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Receipt_${payment.receiptNumber || 'invoice'}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllPayments,
  getMemberPayments,
  initiatePaymentOrder,
  verifyAndSavePayment,
  recordOfflinePayment,
  getPaymentReceiptPDF
};
