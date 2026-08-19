const express = require('express');
const router = express.Router();
const {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintStatus,
  addComment
} = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/', protect, getComplaints);
router.get('/:id', protect, getComplaintById);
router.post('/', protect, createComplaint);
router.put('/:id', protect, authorize('society_admin', 'staff', 'main_admin'), updateComplaintStatus);
router.patch('/:id/status', protect, authorize('society_admin', 'staff', 'main_admin'), updateComplaintStatus);
router.post('/:id/comments', protect, addComment);

module.exports = router;
