const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseReport
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.get('/', protect, getExpenses);
router.get('/report', protect, getExpenseReport);
router.post('/', protect, authorize('society_admin', 'main_admin'), createExpense);
router.put('/:id', protect, authorize('society_admin', 'main_admin'), updateExpense);
router.delete('/:id', protect, authorize('society_admin', 'main_admin'), deleteExpense);

module.exports = router;
