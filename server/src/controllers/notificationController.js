const Notification = require('../models/Notification');

// @desc    Get all notifications / announcements
// @route   GET /api/society/notifications or GET /api/member/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const rawSocietyId = req.user.societyId || req.query.societyId;
    const userRole = req.user.role;
    const userWing = req.user.memberDetails?.wing;

    // Filter notices targeted for this user
    let query = rawSocietyId ? { societyId: rawSocietyId } : {};

    if (userRole === 'member') {
      query.$or = [
        { target: 'all' },
        { target: 'specific_roles', targetData: 'member' },
        ...(userWing ? [{ target: 'specific_wings', targetData: userWing }] : [])
      ];
    }

    const notifications = await Notification.find(query)
      .populate('createdBy', 'fullName role')
      .sort({ isPinned: -1, createdAt: -1 });

    // Calculate unread count for current user
    const unreadCount = notifications.filter(
      n => !n.readBy.some(r => r.userId?.toString() === req.user._id.toString())
    ).length;

    // Attach isRead flag for the current user
    const formatted = notifications.map(n => {
      const isRead = n.readBy.some(r => r.userId?.toString() === req.user._id.toString());
      return {
        ...n.toObject(),
        isRead
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      unreadCount,
      notifications: formatted
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Broadcast a new notification / announcement
// @route   POST /api/society/notifications
// @access  Private (society_admin, main_admin)
const createNotification = async (req, res, next) => {
  try {
    const societyId = req.user.societyId || req.body.societyId;
    const { title, message, type = 'general', priority = 'medium', target = 'all', targetData = [], isPinned = false, image } = req.body;

    const notification = await Notification.create({
      societyId,
      title,
      message,
      type,
      priority,
      target,
      targetData,
      isPinned,
      image: image || '',
      createdBy: req.user._id
    });

    const populated = await Notification.findById(notification._id).populate('createdBy', 'fullName role');

    // Real-time broadcast
    const io = req.app.get('io');
    if (io && societyId) {
      io.to(`society_${societyId}`).emit('notification_received', populated);
    }

    res.status(201).json({
      success: true,
      message: 'Announcement broadcasted successfully',
      notification: populated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark single notification as read
// @route   PATCH /api/member/notifications/:id/read or PATCH /api/society/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const alreadyRead = notification.readBy.some(r => r.userId?.toString() === req.user._id.toString());
    if (!alreadyRead) {
      notification.readBy.push({
        userId: req.user._id,
        readAt: new Date()
      });
      await notification.save();
    }

    res.json({
      success: true,
      message: 'Marked as read'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/member/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    const societyId = req.user.societyId;
    await Notification.updateMany(
      { societyId, 'readBy.userId': { $ne: req.user._id } },
      { $push: { readBy: { userId: req.user._id, readAt: new Date() } } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete notification
// @route   DELETE /api/society/notifications/:id
// @access  Private (society_admin, main_admin)
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification removed successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
