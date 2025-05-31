const rateLimit = require('express-rate-limit');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Creates a rate limiter middleware with custom configuration
 * @param {Object} options - Rate limiting options
 * @returns {function} - Express middleware function
 */
const createRateLimiter = (options = {}) => {
    const {
        windowMs = 10 * 1000, // 10 seconds by default
        max = 100, // 100 requests per windowMs by default
        message = 'Too many requests, please try again later',
        statusCode = 429,
        headers = true,
        skipSuccessfulRequests = false,
        skipFailedRequests = false,
        keyGenerator = (req) => req.ip
    } = options;

    return rateLimit({
        windowMs,
        max,
        message: {
            success: false,
            error: message
        },
        statusCode,
        headers,
        skipSuccessfulRequests,
        skipFailedRequests,
        keyGenerator
    });
};

/**
 * Rate limiter for authentication routes
 */
exports.authLimiter = createRateLimiter({
    windowMs: 10 * 1000, // 15 minutes
    max: 100, // 10 attempts per 15 minutes
    message: 'Too many login attempts, please try again after 15 minutes'
});

/**
 * Rate limiter for general API routes
 */
exports.apiLimiter = createRateLimiter({
    windowMs: 10 * 1000, // 10 minutes
    max: 1000 // 100 requests per 10 minutes
});

/**
 * Rate limiter for sensor data submission
 */
exports.sensorDataLimiter = createRateLimiter({
    windowMs: 10 * 1000, // 1 minute
    max: 60, // 60 requests per minute (1 per second)
    message: 'Too many sensor readings, throttling in effect'
});

/**
 * Rate limiter for admin operations
 */
exports.adminLimiter = createRateLimiter({
    windowMs: 10 * 1000, // 1 hour
    max: 100, // 100 admin operations per hour
    message: 'Too many administrative operations, please try again later'
});
