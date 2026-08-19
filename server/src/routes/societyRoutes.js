const express = require('express');
const router = express.Router();
const {
  getAllSocieties,
  getSocietyById,
  createSociety,
  updateSociety,
  getDashboardStats
} = require('../controllers/societyController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Dashboard statistics
router.get('/stats', protect, getDashboardStats);

// Society CRUD
router.get('/', protect, getAllSocieties);
router.get('/:id', protect, getSocietyById);
router.post('/', protect, authorize('main_admin'), createSociety);
router.put('/:id', protect, authorize('main_admin', 'society_admin'), updateSociety);

module.exports = router;
