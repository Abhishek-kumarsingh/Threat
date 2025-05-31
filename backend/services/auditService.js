const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Log an audit event
 * @param {Object} logData - Audit log data
 * @param {string} logData.action - Action performed (create, update, delete, etc.)
 * @param {string} logData.category - Category of the action (user, sensor, alert, etc.)
 * @param {string} logData.description - Description of the action
 * @param {string} [logData.userId] - User ID who performed the action
 * @param {string} [logData.resourceId] - ID of the resource affected
 * @param {string} [logData.resourceType] - Type of resource affected
 * @param {string} [logData.ipAddress] - IP address of the user
 * @param {string} [logData.userAgent] - User agent of the user
 * @param {Object} [logData.metadata] - Additional metadata
 * @returns {Promise<Object>} - Created audit log
 */
exports.logActivity = async (logData) => {
    try {
        const auditLog = await AuditLog.create(logData);
        return auditLog;
    } catch (error) {
        logger.error(`Error creating audit log: ${error.message}`);
        // Don't throw error, just log it - audit logging should not block main operations
        return null;
    }
};

/**
 * Get recent activities
 * @param {Object} options - Query options
 * @param {number} [options.limit=10] - Number of records to return
 * @param {number} [options.days=1] - Number of days to look back
 * @param {string} [options.userId] - Filter by user ID
 * @param {string} [options.category] - Filter by category
 * @param {string} [options.action] - Filter by action
 * @returns {Promise<Array>} - Array of audit logs
 */
exports.getRecentActivities = async (options = {}) => {
    try {
        const {
            limit = 10,
            days = 1,
            userId,
            category,
            action
        } = options;

        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - days);

        const query = {
            timestamp: { $gte: dayAgo }
        };

        if (userId) query.userId = userId;
        if (category) query.category = category;
        if (action) query.action = action;

        const activities = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .limit(limit)
            .populate('userId', 'name email');

        return activities;
    } catch (error) {
        logger.error(`Error getting recent activities: ${error.message}`);
        throw error;
    }
};

/**
 * Log user authentication events
 * @param {string} action - 'login' or 'logout'
 * @param {Object} user - User object
 * @param {Object} req - Express request object
 */
exports.logAuthEvent = async (action, user, req) => {
    try {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        await this.logActivity({
            action,
            category: 'authentication',
            description: `User ${action}: ${user.email}`,
            userId: user._id,
            ipAddress,
            userAgent,
            metadata: {
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        logger.error(`Error logging auth event: ${error.message}`);
    }
};

/**
 * Log resource events (create, update, delete)
 * @param {string} action - 'create', 'update', or 'delete'
 * @param {string} resourceType - Type of resource
 * @param {Object} resource - Resource object
 * @param {Object} user - User who performed the action
 * @param {Object} req - Express request object
 */
exports.logResourceEvent = async (action, resourceType, resource, user, req) => {
    try {
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        await this.logActivity({
            action,
            category: resourceType,
            description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resourceType}: ${resource.name || resource._id}`,
            userId: user._id,
            resourceId: resource._id,
            resourceType,
            ipAddress,
            userAgent,
            metadata: {
                resourceName: resource.name,
                changes: req.body
            }
        });
    } catch (error) {
        logger.error(`Error logging resource event: ${error.message}`);
    }
};