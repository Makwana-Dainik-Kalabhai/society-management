const express = require('express');
const router = express.Router();
const {
  getMaintenanceBills,
  createMaintenanceBill,
  getDefaulters,
  getMemberDues
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/', protect, getMaintenanceBills);
router.post('/', protect, authorize('society_admin', 'main_admin'), createMaintenanceBill);
router.get('/defaulters', protect, authorize('society_admin', 'main_admin'), getDefaulters);
router.get('/dues', protect, getMemberDues);

module.exports = router;
