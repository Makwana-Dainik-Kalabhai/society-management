const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  bulkImportMembers,
  getSocietyAdmins
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Admins listing
router.get('/admins', protect, authorize('main_admin'), getSocietyAdmins);

// Members CRUD
router.get('/members', protect, getMembers);
router.get('/members/:id', protect, getMemberById);
router.post('/members', protect, authorize('society_admin', 'main_admin'), createMember);
router.put('/members/:id', protect, authorize('society_admin', 'main_admin'), updateMember);
router.delete('/members/:id', protect, authorize('society_admin', 'main_admin'), deleteMember);
router.post('/members/bulk-import', protect, authorize('society_admin', 'main_admin'), bulkImportMembers);

module.exports = router;
