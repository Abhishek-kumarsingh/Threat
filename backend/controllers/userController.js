const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const apiResponse = require('../utils/apiResponse');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);

    res.status(201).json({
        success: true,
        data: user
    });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    await user.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get all notifications for a user
// @route   GET /api/users/:id/notifications
// @access  Private/Admin
exports.getUserNotifications = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    const notifications = await mongoose.model('Notification').find({
        user: req.params.id
    }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications
    });
});

// @desc    Assign locations to user
// @route   PUT /api/users/:id/locations
// @access  Private/Admin
exports.assignLocations = asyncHandler(async (req, res, next) => {
    const { locations } = req.body;

    if (!locations || !Array.isArray(locations)) {
        return next(new ErrorResponse('Please provide an array of location IDs', 400));
    }

    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Check if all locations exist
    for (const locationId of locations) {
        const locationExists = await mongoose.model('Location').findById(locationId);
        if (!locationExists) {
            return next(new ErrorResponse(`Location not found with id of ${locationId}`, 404));
        }
    }

    // Update user with assigned locations
    user.assignedLocations = locations;
    await user.save();

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Get assigned locations for a user
// @route   GET /api/users/:id/locations
// @access  Private/Admin
exports.getUserLocations = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).populate('assignedLocations');

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        count: user.assignedLocations.length,
        data: user.assignedLocations
    });
});

// @desc    Update user notification preferences
// @route   PUT /api/users/:id/preferences
// @access  Private/Admin
exports.updateUserPreferences = asyncHandler(async (req, res, next) => {
    const { emailNotifications, smsNotifications, webNotifications, alertThreshold } = req.body;

    // Build preferences object
    const preferencesToUpdate = {};

    if (emailNotifications !== undefined) {
        preferencesToUpdate['preferences.emailNotifications'] = emailNotifications;
    }

    if (smsNotifications !== undefined) {
        preferencesToUpdate['preferences.smsNotifications'] = smsNotifications;
    }

    if (webNotifications !== undefined) {
        preferencesToUpdate['preferences.webNotifications'] = webNotifications;
    }

    if (alertThreshold !== undefined) {
        preferencesToUpdate['preferences.alertThreshold'] = alertThreshold;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        preferencesToUpdate,
        {
            new: true,
            runValidators: true
        }
    );

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});
