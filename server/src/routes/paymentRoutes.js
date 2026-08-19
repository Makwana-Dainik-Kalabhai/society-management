const express = require('express');
const router = express.Router();
const {
  getAllPayments,
  getMemberPayments,
  initiatePaymentOrder,
  verifyAndSavePayment,
  recordOfflinePayment,
  getPaymentReceiptPDF
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/', protect, authorize('society_admin', 'main_admin'), getAllPayments);
router.get('/my-payments', protect, getMemberPayments);
router.post('/initiate', protect, initiatePaymentOrder);
router.post('/verify', protect, verifyAndSavePayment);
router.post('/record', protect, authorize('society_admin', 'main_admin'), recordOfflinePayment);
router.get('/receipt/:id', protect, getPaymentReceiptPDF);

module.exports = router;
