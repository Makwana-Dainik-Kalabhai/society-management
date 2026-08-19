const User = require('../models/User');
const Society = require('../models/Society');

// @desc    Get all members of current society or filtered
// @route   GET /api/society/members
// @access  Private (society_admin, main_admin)
const getMembers = async (req, res, next) => {
  try {
    const societyId = req.user.societyId || req.query.societyId;
    const { wing, search, isOwner } = req.query;

    const query = { role: 'member' };
    if (societyId) query.societyId = societyId;
    if (wing && wing !== 'all') query['memberDetails.wing'] = wing;
    if (isOwner !== undefined && isOwner !== 'all') query['memberDetails.isOwner'] = isOwner === 'true';

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
        { 'memberDetails.flatNumber': { $regex: search, $options: 'i' } }
      ];
    }

    const members = await User.find(query).sort({ 'memberDetails.wing': 1, 'memberDetails.flatNumber': 1 });

    res.json({
      success: true,
      count: members.length,
      members
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single member
// @route   GET /api/society/members/:id
// @access  Private
const getMemberById = async (req, res, next) => {
  try {
    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.json({
      success: true,
      member
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create / Onboard a new member
// @route   POST /api/society/members
// @access  Private (society_admin, main_admin)
const createMember = async (req, res, next) => {
  try {
    const societyId = req.user.societyId || req.body.societyId;
    if (!societyId && req.user.role !== 'main_admin') {
      return res.status(400).json({ success: false, message: 'Society ID is required' });
    }

    const {
      fullName,
      email,
      mobileNumber,
      password = 'password123',
      role = 'member',
      memberDetails,
      staffDetails
    } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { mobileNumber: mobileNumber.trim() }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email or mobile number already exists.'
      });
    }

    const user = await User.create({
      societyId,
      fullName,
      email: email.toLowerCase().trim(),
      mobileNumber: mobileNumber.trim(),
      password,
      role,
      memberDetails: memberDetails || {},
      staffDetails: staffDetails || {}
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: 'Member registered successfully',
      member: userObj
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update member
// @route   PUT /api/society/members/:id
// @access  Private (society_admin, main_admin)
const updateMember = async (req, res, next) => {
  try {
    const { fullName, email, mobileNumber, memberDetails, staffDetails, isActive, role } = req.body;

    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (fullName) member.fullName = fullName;
    if (email) member.email = email.toLowerCase().trim();
    if (mobileNumber) member.mobileNumber = mobileNumber.trim();
    if (typeof isActive === 'boolean') member.isActive = isActive;
    if (role) member.role = role;

    if (memberDetails) {
      member.memberDetails = { ...member.memberDetails?.toObject(), ...memberDetails };
    }
    if (staffDetails) {
      member.staffDetails = { ...member.staffDetails?.toObject(), ...staffDetails };
    }

    await member.save();

    res.json({
      success: true,
      message: 'Member updated successfully',
      member
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete / deactivate member
// @route   DELETE /api/society/members/:id
// @access  Private (society_admin, main_admin)
const deleteMember = async (req, res, next) => {
  try {
    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Bulk import members
// @route   POST /api/society/members/bulk-import
// @access  Private (society_admin, main_admin)
const bulkImportMembers = async (req, res, next) => {
  try {
    const { members } = req.body;
    const societyId = req.user.societyId || req.body.societyId;

    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or empty members array' });
    }

    const results = { imported: 0, skipped: 0, errors: [] };

    for (const item of members) {
      try {
        const existing = await User.findOne({
          $or: [{ email: item.email?.toLowerCase().trim() }, { mobileNumber: item.mobileNumber?.trim() }]
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        await User.create({
          societyId,
          fullName: item.fullName,
          email: item.email.toLowerCase().trim(),
          mobileNumber: item.mobileNumber.trim(),
          password: 'password123',
          role: 'member',
          memberDetails: {
            wing: item.wing || 'A',
            flatNumber: item.flatNumber || '101',
            floor: item.floor || 1,
            isOwner: item.isOwner !== false,
            occupation: item.occupation || ''
          }
        });
        results.imported++;
      } catch (err) {
        results.skipped++;
        results.errors.push(`${item.fullName || 'User'}: ${err.message}`);
      }
    }

    res.json({
      success: true,
      message: `Bulk import completed: ${results.imported} created, ${results.skipped} skipped.`,
      results
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all society admins (Main Admin)
// @route   GET /api/admin/admins
// @access  Private (main_admin)
const getSocietyAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'society_admin' }).populate('societyId', 'name city address');
    res.json({
      success: true,
      admins
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  bulkImportMembers,
  getSocietyAdmins
};
