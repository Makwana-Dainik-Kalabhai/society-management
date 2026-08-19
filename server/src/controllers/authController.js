const User = require('../models/User');
const Society = require('../models/Society');
const { generateToken, generateRefreshToken } = require('../utils/jwt');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password').populate('societyId');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Contact society admin.'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Filter out password from return object
    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      refreshToken,
      user: userObj
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Request OTP for mobile login
// @route   POST /api/auth/otp-login
// @access  Public
const otpLogin = async (req, res, next) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid registered mobile number'
      });
    }

    const user = await User.findOne({ mobileNumber: mobileNumber.trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with this mobile number.'
      });
    }

    // Generate 6-digit OTP (e.g., 123456 for predictable demo access)
    const otpCode = '123456';
    user.otp = {
      code: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
    };
    await user.save();

    res.json({
      success: true,
      message: `OTP sent successfully to +91 ${mobileNumber}. (Demo OTP: 123456)`,
      mobileNumber
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify OTP and login
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res, next) => {
  try {
    const { mobileNumber, otp } = req.body;

    if (!mobileNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide mobile number and OTP'
      });
    }

    const user = await User.findOne({ mobileNumber: mobileNumber.trim() }).populate('societyId');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.otp || user.otp.code !== otp || new Date() > user.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    user.otp = undefined;
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      refreshToken,
      user: userObj
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('societyId');
    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile & family
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, profileImage, memberDetails, staffDetails } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (fullName) user.fullName = fullName;
    if (profileImage) user.profileImage = profileImage;
    if (memberDetails) {
      user.memberDetails = { ...user.memberDetails.toObject(), ...memberDetails };
    }
    if (staffDetails && user.role === 'staff') {
      user.staffDetails = { ...user.staffDetails.toObject(), ...staffDetails };
    }

    await user.save();

    const updatedUser = await User.findById(user._id).populate('societyId');
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  otpLogin,
  verifyOTP,
  getMe,
  updateProfile,
  changePassword
};
