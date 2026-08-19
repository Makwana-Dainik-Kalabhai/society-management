const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc    Get all complaints (Role filtered)
// @route   GET /api/society/complaints or GET /api/member/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'member') {
      // Member only sees their complaints
      query.userId = req.user._id;
    } else if (req.user.role === 'society_admin' || req.user.role === 'staff') {
      query.societyId = req.user.societyId;
      if (req.user.role === 'staff') {
        // Staff sees assigned tickets or all society tickets
        if (req.query.assignedOnly === 'true') {
          query.assignedTo = req.user._id;
        }
      }
    } else if (req.user.role === 'main_admin' && req.query.societyId) {
      query.societyId = req.query.societyId;
    }

    const { status, category, priority, search } = req.query;
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (priority && priority !== 'all') query.priority = priority;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('userId', 'fullName email mobileNumber memberDetails profileImage')
      .populate('assignedTo', 'fullName staffDetails role mobileNumber')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single complaint detail with comments
// @route   GET /api/society/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'fullName email mobileNumber memberDetails profileImage')
      .populate('assignedTo', 'fullName staffDetails role mobileNumber')
      .populate('timeline.changedBy', 'fullName role')
      .populate('comments.userId', 'fullName profileImage role');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Ensure member only accesses their own ticket
    if (req.user.role === 'member' && complaint.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied to this ticket' });
    }

    res.json({
      success: true,
      complaint
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create / Raise a new complaint
// @route   POST /api/member/complaints or POST /api/society/complaints
// @access  Private
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority, images } = req.body;
    const societyId = req.user.societyId;

    if (!societyId) {
      return res.status(400).json({ success: false, message: 'User is not assigned to a society' });
    }

    const complaint = await Complaint.create({
      societyId,
      userId: req.user._id,
      title,
      description,
      category: category || 'maintenance',
      priority: priority || 'medium',
      images: images || [],
      timeline: [
        {
          status: 'pending',
          changedBy: req.user._id,
          note: `Complaint filed by ${req.user.fullName} (${req.user.memberDetails?.wing ? req.user.memberDetails.wing + '-' : ''}${req.user.memberDetails?.flatNumber || ''})`
        }
      ]
    });

    const populated = await Complaint.findById(complaint._id)
      .populate('userId', 'fullName email memberDetails');

    // Real-time broadcast
    const io = req.app.get('io');
    if (io && societyId) {
      io.to(`society_${societyId}`).emit('complaint_created', populated);
    }

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint: populated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update complaint status, assignment & resolution
// @route   PATCH /api/society/complaints/:id/status or PUT /api/society/complaints/:id
// @access  Private (society_admin, staff, main_admin)
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, assignedTo, adminRemarks, resolution, note } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (assignedTo !== undefined) complaint.assignedTo = assignedTo || null;
    if (adminRemarks !== undefined) complaint.adminRemarks = adminRemarks;
    if (resolution !== undefined) {
      complaint.resolution = resolution;
      if (status === 'resolved') {
        complaint.resolvedAt = new Date();
      }
    }

    // Add to timeline
    complaint.timeline.push({
      status: status || complaint.status,
      changedBy: req.user._id,
      note: note || `Status updated to ${status || complaint.status} by ${req.user.fullName}`
    });

    await complaint.save();

    const updated = await Complaint.findById(complaint._id)
      .populate('userId', 'fullName email mobileNumber memberDetails')
      .populate('assignedTo', 'fullName staffDetails role')
      .populate('timeline.changedBy', 'fullName role')
      .populate('comments.userId', 'fullName profileImage role');

    // Real-time broadcast
    const io = req.app.get('io');
    if (io && complaint.societyId) {
      io.to(`society_${complaint.societyId}`).emit('complaint_updated', updated);
      io.to(`complaint_${complaint._id}`).emit('complaint_updated', updated);
    }

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      complaint: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to complaint thread
// @route   POST /api/society/complaints/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Comment message is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const newComment = {
      userId: req.user._id,
      message: message.trim(),
      createdAt: new Date()
    };

    complaint.comments.push(newComment);
    await complaint.save();

    const updated = await Complaint.findById(complaint._id)
      .populate('comments.userId', 'fullName profileImage role');

    const addedCommentPopulated = updated.comments[updated.comments.length - 1];

    // Real-time chat broadcasting
    const io = req.app.get('io');
    if (io) {
      io.to(`complaint_${complaint._id}`).emit('complaint_message_received', {
        complaintId: complaint._id,
        comment: addedCommentPopulated,
        comments: updated.comments
      });
      if (complaint.societyId) {
        io.to(`society_${complaint.societyId}`).emit('complaint_updated', updated);
      }
    }

    res.json({
      success: true,
      message: 'Comment posted successfully',
      comments: updated.comments,
      comment: addedCommentPopulated
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintStatus,
  addComment
};
