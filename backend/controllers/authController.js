const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role, phoneNumber } = req.body;

    // Check if role is provided and user is not trying to register as admin
    if (role && role === 'admin') {
        return next(new ErrorResponse('Cannot register as admin', 400));
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'user',
        phoneNumber
    });

    // Send welcome email
    try {
        await sendEmail({
            email: user.email,
            subject: 'Welcome to Threat Zone Monitoring System',
            template: 'welcome',
            data: {
                name: user.name
            }
        });
    } catch (err) {
        console.log('Email could not be sent', err);
    }

    sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Log the login event
    const auditService = require('../services/auditService');
    await auditService.logAuthEvent('login', user, req);

    sendTokenResponse(user, 200, res);
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
    // Log the logout event if user is authenticated
    if (req.user) {
        const auditService = require('../services/auditService');
        await auditService.logAuthEvent('logout', req.user, req);
    }

    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        sameSite: 'lax'
    });

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Refresh JWT token
// @route   GET /api/auth/refresh-token
// @access  Private
exports.refreshToken = asyncHandler(async (req, res, next) => {
    // Get token from cookie or auth header
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from the token
        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        // Generate new token
        sendTokenResponse(user, 200, res);
    } catch (err) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('assignedLocations');

    // Create a sanitized user object without sensitive data
    const sanitizedUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        assignedLocations: user.assignedLocations
    };

    res.status(200).json({
        success: true,
        user: sanitizedUser
    });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
        key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get(
        'host'
    )}/api/auth/resetpassword/${resetToken}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            template: 'passwordReset',
            data: {
                name: user.name,
                resetUrl
            }
        });

        res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500));
    }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorResponse('Invalid token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc    Update notification preferences
// @route   PUT /api/auth/preferences
// @access  Private
exports.updatePreferences = asyncHandler(async (req, res, next) => {
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
        req.user.id,
        preferencesToUpdate,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Store web push subscription
// @route   POST /api/auth/webpush
// @access  Private
exports.storeWebPushSubscription = asyncHandler(async (req, res, next) => {
    const subscription = req.body;

    if (!subscription || !subscription.endpoint) {
        return next(new ErrorResponse('Invalid subscription object', 400));
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { webPushSubscription: subscription },
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        success: true,
        data: user
    });
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        sameSite: 'lax' // Allow cookies in cross-site requests
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    // Create a sanitized user object without sensitive data
    const sanitizedUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        permissions: ['read:alerts', 'read:sensors', 'read:threat-zones'] // Add default permissions
    };

    // Add admin permissions
    if (user.role === 'admin') {
        sanitizedUser.permissions = [
            ...sanitizedUser.permissions,
            'create:alerts',
            'update:alerts',
            'delete:alerts',
            'create:sensors',
            'update:sensors',
            'delete:sensors',
            'create:threat-zones',
            'update:threat-zones',
            'delete:threat-zones',
            'manage:users'
        ];
    }

    console.log('Login successful for user:', user.email);
    console.log('Generated token:', token.substring(0, 20) + '...');

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            user: sanitizedUser
        });
};
