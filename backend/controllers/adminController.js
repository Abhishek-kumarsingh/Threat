const User = require('../models/User');
const Sensor = require('../models/Sensor');
const Alert = require('../models/Alert');
const ThreatZone = require('../models/ThreatZone');
const Location = require('../models/Location');
const SensorReading = require('../models/SensorReading');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const apiResponse = require('../utils/apiResponse');
const mongoose = require('mongoose');

// @desc    Get admin dashboard summary
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardSummary = asyncHandler(async (req, res, next) => {
    // Count items in collections
    const userCount = await User.countDocuments();
    const locationCount = await Location.countDocuments();
    const sensorCount = await Sensor.countDocuments();
    const alertCount = await Alert.countDocuments();

    // Get active alerts
    const activeAlerts = await Alert.find({
        status: { $in: ['active', 'acknowledged'] }
    })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('location', 'name');

    // Get active threat zones
    const activeThreatZones = await ThreatZone.find({ isActive: true })
        .sort({ timestamp: -1 })
        .limit(5)
        .populate('location', 'name');

    // Get sensor stats
    const sensorStats = await Sensor.getStatusStats();

    // Get recent activities
    const recentActivities = await getRecentActivities();

    // Calculate system uptime
    const uptimeSeconds = process.uptime();
    const uptimeHours = Math.floor(uptimeSeconds / 3600);
    const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptimeFormatted = `${uptimeHours}h ${uptimeMinutes}m`;

    // System health data
    const systemHealth = {
        status: 'healthy', // This could be calculated based on various metrics
        uptime: uptimeFormatted,
        lastRestart: new Date(Date.now() - uptimeSeconds * 1000).toISOString(),
        memoryUsage: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
    };

    // Statistics object to match frontend expectations
    const statistics = {
        totalSensors: sensorCount,
        activeSensors: sensorStats.online || 0,
        totalLocations: locationCount,
        totalUsers: userCount,
        activeAlerts: activeAlerts.length,
        activeThreatZones: activeThreatZones.length
    };

    // Format recent activities to match frontend expectations
    const recentActivity = recentActivities.map(activity => ({
        type: activity.type || 'system',
        message: activity.title || activity.description || 'System activity',
        timestamp: activity.timestamp || activity.createdAt
    }));

    res.status(200).json({
        success: true,
        data: {
            systemHealth,
            statistics,
            recentActivity,
            counts: {
                users: userCount,
                locations: locationCount,
                sensors: sensorCount,
                alerts: alertCount
            },
            activeAlerts,
            activeThreatZones,
            sensorStats,
            recentActivities
        }
    });
});

// @desc    Get user statistics
// @route   GET /api/admin/user-stats
// @access  Private/Admin
exports.getUserStats = asyncHandler(async (req, res, next) => {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get users by role
    const usersByRole = await User.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 }
            }
        }
    ]);

    // Format user role data
    const roleStats = {
        admin: 0,
        supervisor: 0,
        user: 0
    };

    usersByRole.forEach(item => {
        roleStats[item._id] = item.count;
    });

    // Get active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await User.countDocuments({
        lastLogin: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
        success: true,
        stats: {
            total: totalUsers,
            active: activeUsers,
            admins: roleStats.admin,
            supervisors: roleStats.supervisor,
            users: roleStats.user
        }
    });
});

// @desc    Get recent activity
// @route   GET /api/admin/recent-activity
// @access  Private/Admin
exports.getRecentActivity = asyncHandler(async (req, res, next) => {
    const activities = await getRecentActivities();

    res.status(200).json({
        success: true,
        count: activities.length,
        activities
    });
});

// @desc    Get system health status
// @route   GET /api/admin/system-health
// @access  Private/Admin
exports.getSystemHealth = asyncHandler(async (req, res, next) => {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Check prediction model service
    let predictionModelStatus;
    try {
        const response = await axios.get(`${process.env.PREDICTION_MODEL_URL}/health`, {
            timeout: 5000
        });
        predictionModelStatus = response.data.status === 'ok' ? 'online' : 'degraded';
    } catch (err) {
        predictionModelStatus = 'offline';
    }

    // Check notification services
    const notificationServices = {
        email: process.env.EMAIL_SERVICE && process.env.EMAIL_USERNAME ? 'configured' : 'unconfigured',
        sms: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'unconfigured',
        webPush: process.env.VAPID_PUBLIC_KEY ? 'configured' : 'unconfigured'
    };

    // Get system uptime
    const uptime = process.uptime();

    // Get memory usage
    const memoryUsage = process.memoryUsage();

    res.status(200).json({
        success: true,
        health: {
            status: dbStatus === 'connected' && predictionModelStatus !== 'offline' ? 'healthy' : 'degraded',
            components: {
                database: dbStatus,
                predictionModel: predictionModelStatus,
                notificationServices
            },
            system: {
                uptime,
                memory: {
                    rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
                    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
                    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) // MB
                },
                node: process.version
            }
        }
    });
});

// @desc    Run system maintenance tasks
// @route   POST /api/admin/maintenance
// @access  Private/Admin
exports.runMaintenance = asyncHandler(async (req, res, next) => {
    const tasks = req.body.tasks || ['cleanupNotifications', 'cleanupSensorReadings'];
    const results = {};

    // Clean up expired notifications
    if (tasks.includes('cleanupNotifications')) {
        const result = await mongoose.model('Notification').deleteMany({
            expiresAt: { $lt: new Date() }
        });
        results.notifications = {
            deleted: result.deletedCount
        };
    }

    // Clean up old sensor readings
    if (tasks.includes('cleanupSensorReadings')) {
        // Keep only last 30 days of readings unless they're abnormal
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await SensorReading.deleteMany({
            timestamp: { $lt: thirtyDaysAgo },
            status: 'normal'
        });
        results.sensorReadings = {
            deleted: result.deletedCount
        };
    }

    res.status(200).json({
        success: true,
        message: 'Maintenance tasks completed successfully',
        results
    });
});

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
exports.getAuditLogs = asyncHandler(async (req, res, next) => {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default to last 7 days
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const type = req.query.type || null;
    const userId = req.query.userId || null;

    // Build query
    const query = {
        timestamp: {
            $gte: startDate,
            $lte: endDate
        }
    };

    if (type) {
        query.type = type;
    }

    if (userId) {
        query.userId = userId;
    }

    // Get audit logs from collection
    const auditLogs = await mongoose.model('AuditLog').find(query)
        .sort({ timestamp: -1 })
        .limit(req.query.limit ? parseInt(req.query.limit) : 100)
        .populate('userId', 'name email');

    res.status(200).json({
        success: true,
        count: auditLogs.length,
        data: auditLogs
    });
});

// @desc    Create backup
// @route   POST /api/admin/backup
// @access  Private/Admin
exports.createBackup = asyncHandler(async (req, res, next) => {
    // This would typically trigger a database backup process
    // The actual implementation depends on your deployment environment

    // Simulate a backup process
    const backupId = `backup_${Date.now()}`;
    const timestamp = new Date();

    // Record the backup operation
    const backup = await mongoose.model('Backup').create({
        backupId,
        timestamp,
        createdBy: req.user.id,
        status: 'processing'
    });

    // In a real implementation, you would start a backup process here
    // For example, using a queue system or child process

    // For demonstration, we'll just return successfully
    res.status(200).json({
        success: true,
        message: 'Backup process initiated',
        data: {
            backupId,
            timestamp,
            status: 'processing'
        }
    });

    // In a real implementation, you would update the status when the backup completes
    // This would happen asynchronously after the response is sent
});

// Helper function to get recent activities
const getRecentActivities = async () => {
    // Get recent alerts (created in last 24 hours)
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);

    const recentAlerts = await Alert.find({
        createdAt: { $gte: dayAgo }
    })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('location', 'name')
        .populate('createdBy', 'name');

    // Get recent threat zones (created in last 24 hours)
    const recentThreatZones = await ThreatZone.find({
        timestamp: { $gte: dayAgo }
    })
        .sort({ timestamp: -1 })
        .limit(10)
        .populate('location', 'name');

    // Get recent sensor status changes
    const recentSensorStatusChanges = await SensorReading.find({
        timestamp: { $gte: dayAgo },
        status: { $ne: 'normal' }
    })
        .sort({ timestamp: -1 })
        .limit(10)
        .populate('sensor', 'name location');

    // Get recent user activities
    const auditService = require('../services/auditService');
    const recentUserActivities = await auditService.getRecentActivities({
        limit: 10,
        days: 1
    });

    // Combine and format activities
    const activities = [
        ...recentAlerts.map(alert => ({
            type: 'alert',
            id: alert._id,
            title: `Alert: ${alert.title}`,
            details: `${alert.severity.toUpperCase()} alert at ${alert.location?.name || 'Unknown'}`,
            timestamp: alert.createdAt,
            user: alert.createdBy?.name || 'System',
            severity: alert.severity
        })),
        ...recentThreatZones.map(zone => ({
            type: 'threatZone',
            id: zone._id,
            title: `Threat Zone: ${zone.prediction.level.toUpperCase()}`,
            details: `New threat zone at ${zone.location?.name || 'Unknown'}`,
            timestamp: zone.timestamp,
            severity: zone.prediction.level
        })),
        ...recentSensorStatusChanges.map(reading => ({
            type: 'sensorStatus',
            id: reading._id,
            title: `Sensor: ${reading.status.toUpperCase()}`,
            details: `Sensor ${reading.sensor?.name || 'Unknown'} status changed to ${reading.status}`,
            timestamp: reading.timestamp,
            severity: reading.status === 'critical' ? 'critical' :
                reading.status === 'danger' ? 'danger' :
                    reading.status === 'warning' ? 'warning' : 'info'
        })),
        ...recentUserActivities.map(activity => ({
            type: 'userActivity',
            id: activity._id,
            title: `User Activity: ${activity.action}`,
            details: activity.details,
            timestamp: activity.timestamp,
            user: activity.userId?.name || 'Unknown',
            severity: 'info'
        }))
    ];

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => b.timestamp - a.timestamp);

    return activities.slice(0, 20);
};
