const ErrorResponse = require('../utils/errorResponse');

/**
 * Middleware to check if a user has one of the specified roles
 * @param {string[]} roles - Array of allowed roles
 * @returns {function} - Express middleware function
 */
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ErrorResponse('Authentication required', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `Role ${req.user.role} is not authorized to access this route`,
                    403
                )
            );
        }

        next();
    };
};

module.exports = checkRole;
