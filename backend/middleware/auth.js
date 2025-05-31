const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    console.log('Auth headers:', req.headers.authorization);
    console.log('Auth cookies:', req.cookies);

    // Check for token in Authorization header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
        console.log('Token from Authorization header:', token);
    } else if (req.cookies.token) {
        // Set token from cookie
        token = req.cookies.token;
        console.log('Token from cookie:', token);
    }

    // Make sure token exists
    if (!token) {
        console.log('No token found in request');
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully:', decoded);

        // Get user from token id
        req.user = await User.findById(decoded.id);

        // Check if user still exists
        if (!req.user) {
            console.log('User not found for token ID:', decoded.id);
            return next(new ErrorResponse('User no longer exists', 401));
        }

        console.log('User authenticated:', req.user.email);
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `User role ${req.user.role} is not authorized to access this route`,
                    403
                )
            );
        }
        next();
    };
};
