const Expense = require('../models/Expense');

// @desc    Get all society expenses
// @route   GET /api/society/expenses or GET /api/member/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const societyId = req.user.societyId || req.query.societyId;
    const { category, status, search } = req.query;

    const query = { societyId };
    if (category && category !== 'all') query.category = category;
    if (status && status !== 'all') query.status = status;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { vendorName: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const expenses = await Expense.find(query)
      .populate('addedBy', 'fullName role')
      .populate('approvedBy', 'fullName role')
      .sort({ expenseDate: -1 });

    const totalAmount = expenses.reduce((acc, exp) => acc + (exp.status === 'approved' ? exp.amount : 0), 0);

    res.json({
      success: true,
      count: expenses.length,
      totalAmount,
      expenses
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new society expense
// @route   POST /api/society/expenses
// @access  Private (society_admin, main_admin)
const createExpense = async (req, res, next) => {
  try {
    const societyId = req.user.societyId || req.body.societyId;
    const { title, category, description, amount, expenseDate, vendorName, invoiceNumber, notes, receiptImage } = req.body;

    const expense = await Expense.create({
      societyId,
      title,
      category,
      description,
      amount,
      expenseDate: expenseDate || new Date(),
      vendorName,
      invoiceNumber,
      notes,
      receiptImage: receiptImage || '',
      addedBy: req.user._id,
      approvedBy: req.user._id, // Auto-approved when created by society admin
      status: 'approved'
    });

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      expense
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update expense / approval
// @route   PUT /api/society/expenses/:id
// @access  Private (society_admin, main_admin)
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    Object.assign(expense, req.body);
    await expense.save();

    res.json({
      success: true,
      message: 'Expense updated successfully',
      expense
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete expense
// @route   DELETE /api/society/expenses/:id
// @access  Private (society_admin, main_admin)
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }

    res.json({
      success: true,
      message: 'Expense removed successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get expense analytics & category breakdown
// @route   GET /api/society/expenses/report
// @access  Private
const getExpenseReport = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const rawSocietyId = req.user.societyId || req.query.societyId;
    const societyId = rawSocietyId && mongoose.Types.ObjectId.isValid(rawSocietyId)
      ? new mongoose.Types.ObjectId(rawSocietyId)
      : null;

    const matchQuery = { status: 'approved' };
    if (societyId) matchQuery.societyId = societyId;

    const categoryBreakdown = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({
      success: true,
      categories: categoryBreakdown
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseReport
};
