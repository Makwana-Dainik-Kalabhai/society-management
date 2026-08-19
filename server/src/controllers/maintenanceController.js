const Maintenance = require('../models/Maintenance');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Society = require('../models/Society');

// @desc    Get all maintenance cycles
// @route   GET /api/society/maintenance
// @access  Private
const getMaintenanceBills = async (req, res, next) => {
  try {
    const rawSocietyId = req.user.societyId || req.query.societyId;
    const query = rawSocietyId ? { societyId: rawSocietyId } : {};
    const maintenance = await Maintenance.find(query).sort({ year: -1, month: -1 });

    // Enrich each cycle with collection progress
    const enriched = await Promise.all(
      maintenance.map(async (item) => {
        const itemSocId = item.societyId;
        const totalMembers = await User.countDocuments({ societyId: itemSocId, role: 'member' });
        const paidCount = await Payment.countDocuments({
          maintenanceId: item._id,
          status: 'completed'
        });
        const totalCollected = await Payment.aggregate([
          { $match: { maintenanceId: item._id, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$paidAmount' } } }
        ]);

        return {
          ...item.toObject(),
          totalFlats: totalMembers,
          paidCount,
          pendingCount: Math.max(0, totalMembers - paidCount),
          collectedAmount: totalCollected[0]?.total || 0,
          expectedAmount: totalMembers * item.amount
        };
      })
    );

    res.json({
      success: true,
      count: enriched.length,
      maintenance: enriched
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new monthly maintenance cycle
// @route   POST /api/society/maintenance
// @access  Private (society_admin, main_admin)
const createMaintenanceBill = async (req, res, next) => {
  try {
    const societyId = req.user.societyId || req.body.societyId;
    const { month, year, title, amount, breakdown, dueDate, penaltyAmount, lateFeeDays, description } = req.body;

    const existing = await Maintenance.findOne({ societyId, month, year });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Maintenance bill for month ${month}/${year} already exists.`
      });
    }

    const maintenance = await Maintenance.create({
      societyId,
      month,
      year,
      title: title || `Maintenance Bill for ${month}/${year}`,
      amount,
      breakdown: breakdown || [
        { item: 'Security & Surveillance', amount: Math.round(amount * 0.35) },
        { item: 'Common Area Utilities & Power', amount: Math.round(amount * 0.25) },
        { item: 'Lift & Building Maintenance', amount: Math.round(amount * 0.25) },
        { item: 'Sinking & Emergency Fund', amount: Math.round(amount * 0.15) }
      ],
      dueDate: dueDate || new Date(year, month - 1, 10),
      penaltyAmount: penaltyAmount || 150,
      lateFeeDays: lateFeeDays || 5,
      description,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Monthly maintenance cycle generated successfully',
      maintenance
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Defaulters List
// @route   GET /api/society/maintenance/defaulters
// @access  Private (society_admin, main_admin)
const getDefaulters = async (req, res, next) => {
  try {
    const societyId = req.user.societyId || req.query.societyId;
    const members = await User.find({ societyId, role: 'member' });
    const allCycles = await Maintenance.find({ societyId }).sort({ year: -1, month: -1 });

    const defaulters = [];
    const today = new Date();

    for (const member of members) {
      const unpaidCycles = [];
      let totalDue = 0;
      let totalPenalty = 0;

      for (const cycle of allCycles) {
        const payment = await Payment.findOne({
          userId: member._id,
          maintenanceId: cycle._id,
          status: 'completed'
        });

        if (!payment) {
          const isOverdue = today > new Date(cycle.dueDate);
          const penalty = isOverdue ? (cycle.penaltyAmount || 150) : 0;
          unpaidCycles.push({
            cycleId: cycle._id,
            title: cycle.title,
            month: cycle.month,
            year: cycle.year,
            amount: cycle.amount,
            dueDate: cycle.dueDate,
            isOverdue,
            penalty
          });
          totalDue += cycle.amount;
          totalPenalty += penalty;
        }
      }

      if (unpaidCycles.length > 0) {
        defaulters.push({
          member: {
            _id: member._id,
            fullName: member.fullName,
            email: member.email,
            mobileNumber: member.mobileNumber,
            memberDetails: member.memberDetails
          },
          unpaidCyclesCount: unpaidCycles.length,
          unpaidCycles,
          totalBaseDue: totalDue,
          totalPenalty,
          totalPayable: totalDue + totalPenalty
        });
      }
    }

    res.json({
      success: true,
      count: defaulters.length,
      defaulters
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in member's pending dues
// @route   GET /api/member/payments/due
// @access  Private (member)
const getMemberDues = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const societyId = req.user.societyId;

    const maintenanceList = await Maintenance.find({ societyId }).sort({ year: -1, month: -1 });
    const dues = [];
    const today = new Date();

    for (const cycle of maintenanceList) {
      const payment = await Payment.findOne({
        userId,
        maintenanceId: cycle._id,
        status: 'completed'
      });

      if (!payment) {
        const isOverdue = today > new Date(cycle.dueDate);
        const penalty = isOverdue ? (cycle.penaltyAmount || 150) : 0;

        dues.push({
          _id: cycle._id,
          title: cycle.title,
          month: cycle.month,
          year: cycle.year,
          amount: cycle.amount,
          breakdown: cycle.breakdown,
          dueDate: cycle.dueDate,
          penaltyAmount: penalty,
          isOverdue,
          totalPayable: cycle.amount + penalty
        });
      }
    }

    res.json({
      success: true,
      totalPendingBills: dues.length,
      totalAmountDue: dues.reduce((acc, item) => acc + item.totalPayable, 0),
      dues
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMaintenanceBills,
  createMaintenanceBill,
  getDefaulters,
  getMemberDues
};
