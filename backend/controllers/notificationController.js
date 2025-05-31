const Notification = require('../models/Notification');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = asyncHandler(async (req, res, next) => {
    const query = {
        user: req.user.id
    };

    // Filter by read status if provided
    if (req.query.read === 'true') {
        query.read = true;
    } else if (req.query.read === 'false') {
        query.read = false;
    }

    // Filter by type if provided
    if (req.query.type) {
        query.type = req.query.type;
    }

    // Get valid notifications (not expired)
    query.$or = [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
    ];

    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(req.query.limit) || 50);

    // Get count of unread notifications
    const unreadCount = await Notification.countDocuments({
        user: req.user.id,
        read: false,
        $or: [
            { expiresAt: { $gt: new Date() } },
            { expiresAt: null }
        ]
    });

    res.status(200).json({
        success: true,
        count: notifications.length,
        unreadCount,
        data: notifications
    });
});

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
exports.getNotification = asyncHandler(async (req, res, next) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
    }

    // Make sure notification belongs to user
    if (notification.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to access this notification', 401));
    }

    res.status(200).json({
        success: true,
        data: notification
    });
});

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private/Admin
exports.createNotification = asyncHandler(async (req, res, next) => {
    // Check if there's a user to send notification to
    if (!req.body.user) {
        return next(new ErrorResponse('User ID is required', 400));
    }

    // Check if user exists
    const user = await User.findById(req.body.user);
    if (!user) {
        return next(new ErrorResponse(`No user found with id of ${req.body.user}`, 404));
    }

    // Create notification
    const notification = await Notification.create(req.body);

    res.status(201).json({
        success: true,
        data: notification
    });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
        return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
    }

    // Make sure notification belongs to user
    if (notification.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to update this notification', 401));
    }

    // Mark as read
    await notification.markAsRead();

    res.status(200).json({
        success: true,
        data: notification
    });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
    await Notification.updateMany(
        { user: req.user.id, read: false },
        { read: true, readAt: Date.now() }
    );

    res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
    });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
    }

    // Make sure notification belongs to user or user is admin
    if (notification.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to delete this notification', 401));
    }

    await notification.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/read
// @access  Private
exports.deleteReadNotifications = asyncHandler(async (req, res, next) => {
    const result = await Notification.deleteMany({
        user: req.user.id,
        read: true
    });

    res.status(200).json({
        success: true,
        data: {
            count: result.deletedCount
        }
    });
});

// @desc    Create notification for multiple users
// @route   POST /api/notifications/bulk
// @access  Private/Admin
exports.createBulkNotifications = asyncHandler(async (req, res, next) => {
    const { users, notification } = req.body;

    if (!users || !Array.isArray(users) || users.length === 0) {
        return next(new ErrorResponse('Valid array of user IDs is required', 400));
    }

    if (!notification || !notification.title || !notification.message) {
        return next(new ErrorResponse('Notification must include title and message', 400));
    }

    // Create notifications for all specified users
    const notifications = [];
    for (const userId of users) {
        try {
            const notificationData = {
                ...notification,
                user: userId
            };

            const newNotification = await Notification.create(notificationData);
            notifications.push(newNotification);
        } catch (err) {
            console.error(`Error creating notification for user ${userId}: ${err.message}`);
        }
    }

    res.status(201).json({
        success: true,
        count: notifications.length,
        data: notifications
    });
});
