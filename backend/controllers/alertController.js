const Alert = require('../models/Alert');
const User = require('../models/User');
const Location = require('../models/Location');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const notificationService = require('../services/notificationService');
const { broadcastAlert } = require('../services/websocketService');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private
exports.getAlerts = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get single alert
// @route   GET /api/alerts/:id
// @access  Private
exports.getAlert = asyncHandler(async (req, res, next) => {
    const alert = await Alert.findById(req.params.id)
        .populate('location', 'name address coordinates')
        .populate('createdBy', 'name')
        .populate('resolvedBy', 'name')
        .populate('acknowledgedBy.user', 'name');

    if (!alert) {
        return next(new ErrorResponse(`Alert not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: alert
    });
});

// @desc    Create new alert
// @route   POST /api/alerts
// @access  Private/Admin
exports.createAlert = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Check if location exists
    const location = await Location.findById(req.body.location);
    if (!location) {
        return next(new ErrorResponse(`Location not found with id of ${req.body.location}`, 404));
    }

    // Set default expiration time (2 hours from now) if not provided
    if (!req.body.expiresAt) {
        const twoHours = new Date();
        twoHours.setHours(twoHours.getHours() + 2);
        req.body.expiresAt = twoHours;
    }

    // Create alert
    const alert = await Alert.create(req.body);

    // Get users to notify based on location and severity
    const users = await User.find({
        $or: [
            { assignedLocations: req.body.location },
            { role: { $in: ['admin', 'supervisor'] } }
        ]
    });

    // Send notifications to users
    await Promise.all(
        users.map(async (user) => {
            const shouldNotify = shouldSendNotification(user, alert.severity);

            if (shouldNotify) {
                await notificationService.sendAlertNotifications(user, alert);

                // Update notification count in alert document
                if (user.preferences.emailNotifications) {
                    alert.notificationsSent.email.count += 1;
                    alert.notificationsSent.email.timestamps.push(Date.now());
                }
                if (user.preferences.smsNotifications && user.phoneNumber) {
                    alert.notificationsSent.sms.count += 1;
                    alert.notificationsSent.sms.timestamps.push(Date.now());
                }
                if (user.preferences.webNotifications && user.webPushSubscription) {
                    alert.notificationsSent.web.count += 1;
                    alert.notificationsSent.web.timestamps.push(Date.now());
                }
            }
        })
    );

    // Save updated notification counts
    await alert.save();

    // Broadcast alert to connected clients
    broadcastAlert(alert);

    res.status(201).json({
        success: true,
        data: alert
    });
});

// @desc    Update alert
// @route   PUT /api/alerts/:id
// @access  Private/Admin
exports.updateAlert = asyncHandler(async (req, res, next) => {
    let alert = await Alert.findById(req.params.id);

    if (!alert) {
        return next(new ErrorResponse(`Alert not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is alert creator or admin
    if (
        alert.createdBy.toString() !== req.user.id &&
        req.user.role !== 'admin'
    ) {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update this alert`,
                401
            )
        );
    }

    // Don't allow changing createdBy field
    if (req.body.createdBy) {
        delete req.body.createdBy;
    }

    alert = await Alert.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    // If severity was increased, send notifications again
    if (
        req.body.severity &&
        getSeverityLevel(req.body.severity) > getSeverityLevel(alert.severity)
    ) {
        const users = await User.find({
            $or: [
                { assignedLocations: alert.location },
                { role: { $in: ['admin', 'supervisor'] } }
            ]
        });

        await Promise.all(
            users.map(async (user) => {
                const shouldNotify = shouldSendNotification(user, alert.severity);

                if (shouldNotify) {
                    await notificationService.sendAlertNotifications(user, alert);

                    // Update notification count in alert document
                    if (user.preferences.emailNotifications) {
                        alert.notificationsSent.email.count += 1;
                        alert.notificationsSent.email.timestamps.push(Date.now());
                    }
                    if (user.preferences.smsNotifications && user.phoneNumber) {
                        alert.notificationsSent.sms.count += 1;
                        alert.notificationsSent.sms.timestamps.push(Date.now());
                    }
                    if (user.preferences.webNotifications && user.webPushSubscription) {
                        alert.notificationsSent.web.count += 1;
                        alert.notificationsSent.web.timestamps.push(Date.now());
                    }
                }
            })
        );

        // Save updated notification counts
        await alert.save();

        // Broadcast updated alert to connected clients
        broadcastAlert(alert);
    }

    res.status(200).json({
        success: true,
        data: alert
    });
});

// @desc    Acknowledge alert
// @route   PUT /api/alerts/:id/acknowledge
// @access  Private
exports.acknowledgeAlert = asyncHandler(async (req, res, next) => {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
        return next(new ErrorResponse(`Alert not found with id of ${req.params.id}`, 404));
    }

    await alert.acknowledge(req.user.id);

    // Broadcast updated alert to connected clients
    broadcastAlert(alert);

    res.status(200).json({
        success: true,
        data: alert
    });
});

// @desc    Resolve alert
// @route   PUT /api/alerts/:id/resolve
// @access  Private
exports.resolveAlert = asyncHandler(async (req, res, next) => {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
        return next(new ErrorResponse(`Alert not found with id of ${req.params.id}`, 404));
    }

    // Only admins, supervisors, or alert creators can resolve
    if (
        alert.createdBy.toString() !== req.user.id &&
        req.user.role !== 'admin' &&
        req.user.role !== 'supervisor'
    ) {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to resolve this alert`,
                401
            )
        );
    }

    await alert.resolve(req.user.id);

    // Broadcast updated alert to connected clients
    broadcastAlert(alert);

    res.status(200).json({
        success: true,
        data: alert
    });
});

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private/Admin
exports.deleteAlert = asyncHandler(async (req, res, next) => {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
        return next(new ErrorResponse(`Alert not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is alert creator or admin
    if (
        alert.createdBy.toString() !== req.user.id &&
        req.user.role !== 'admin'
    ) {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to delete this alert`,
                401
            )
        );
    }

    await alert.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get active alerts
// @route   GET /api/alerts/active
// @access  Private
exports.getActiveAlerts = asyncHandler(async (req, res, next) => {
    const alerts = await Alert.getActiveAlerts();

    res.status(200).json({
        success: true,
        count: alerts.length,
        data: alerts
    });
});

// @desc    Send test alert
// @route   POST /api/alerts/test
// @access  Private/Admin
exports.sendTestAlert = asyncHandler(async (req, res, next) => {
    // Create test alert
    const testAlert = await Alert.create({
        title: 'Test Alert',
        message: req.body.message || 'This is a test alert. No action required.',
        severity: req.body.severity || 'info',
        type: 'test',
        source: 'manual',
        location: req.body.location,
        createdBy: req.user.id,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // Expires in 30 minutes
    });

    // Get users to notify (if specified in the request or all users)
    let users;
    if (req.body.userId) {
        users = await User.find({ _id: req.body.userId });
    } else {
        users = await User.find({
            $or: [
                { assignedLocations: req.body.location },
                { role: { $in: ['admin', 'supervisor'] } }
            ]
        });
    }

    // Send notifications to users
    await Promise.all(
        users.map(async (user) => {
            await notificationService.sendAlertNotifications(user, testAlert);

            // Update notification count in alert document
            if (user.preferences.emailNotifications) {
                testAlert.notificationsSent.email.count += 1;
                testAlert.notificationsSent.email.timestamps.push(Date.now());
            }
            if (user.preferences.smsNotifications && user.phoneNumber) {
                testAlert.notificationsSent.sms.count += 1;
                testAlert.notificationsSent.sms.timestamps.push(Date.now());
            }
            if (user.preferences.webNotifications && user.webPushSubscription) {
                testAlert.notificationsSent.web.count += 1;
                testAlert.notificationsSent.web.timestamps.push(Date.now());
            }
        })
    );

    // Save updated notification counts
    await testAlert.save();

    res.status(200).json({
        success: true,
        data: testAlert
    });
});

// Helper functions
const getSeverityLevel = (severity) => {
    const levels = {
        'info': 0,
        'warning': 1,
        'danger': 2,
        'critical': 3,
        'emergency': 4
    };
    return levels[severity] || 0;
};

const shouldSendNotification = (user, alertSeverity) => {
    const alertLevel = getSeverityLevel(alertSeverity);
    const userThresholdLevel = getSeverityLevel(user.preferences.alertThreshold);

    return alertLevel >= userThresholdLevel;
};
