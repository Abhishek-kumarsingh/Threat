const Alert = require('../models/Alert');
const Sensor = require('../models/Sensor');
const ThreatZone = require('../models/ThreatZone');
const Location = require('../models/Location');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get dashboard summary data
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardSummary = asyncHandler(async (req, res, next) => {
    // Get active alerts
    const activeAlerts = await Alert.find({
        status: { $in: ['active', 'acknowledged'] }
    })
        .populate('location', 'name address')
        .sort({ createdAt: -1 })
        .limit(5);

    // Get active threat zones
    const activeThreatZones = await ThreatZone.find({ isActive: true })
        .populate('location', 'name address')
        .sort({ timestamp: -1 });

    // Get sensor status stats
    const sensorStats = await Sensor.getStatusStats();

    // Get recent readings
    const recentReadings = await mongoose.model('SensorReading').find()
        .populate('sensor', 'name location')
        .sort({ timestamp: -1 })
        .limit(10);

    // Get locations with active threats
    const locationsWithThreats = await Location.find({
        _id: {
            $in: activeThreatZones.map(zone => zone.location)
        }
    });

    res.status(200).json({
        success: true,
        data: {
            activeAlerts,
            activeThreatZones,
            sensorStats,
            recentReadings,
            locationsWithThreats
        }
    });
});

// @desc    Get user-specific dashboard data
// @route   GET /api/dashboard/user
// @access  Private
exports.getUserDashboard = asyncHandler(async (req, res, next) => {
    // Get user's assigned locations
    const user = await User.findById(req.user.id).populate('assignedLocations');
    const locationIds = user.assignedLocations.map(loc => loc._id);

    // Get active alerts for user's locations
    const activeAlerts = await Alert.find({
        status: { $in: ['active', 'acknowledged'] },
        location: { $in: locationIds }
    })
        .populate('location', 'name address')
        .sort({ createdAt: -1 });

    // Get active threat zones for user's locations
    const activeThreatZones = await ThreatZone.find({
        isActive: true,
        location: { $in: locationIds }
    })
        .populate('location', 'name address')
        .sort({ timestamp: -1 });

    // Get sensors for user's locations
    const sensors = await Sensor.find({
        location: { $in: locationIds }
    })
        .populate('location', 'name address');

    // Get sensor status stats
    const sensorStats = {
        total: sensors.length,
        online: sensors.filter(s => s.status === 'online').length,
        offline: sensors.filter(s => s.status === 'offline').length,
        warning: sensors.filter(s => s.status === 'warning').length,
        critical: sensors.filter(s => s.status === 'critical').length,
        maintenance: sensors.filter(s => s.status === 'maintenance').length
    };

    // Get unread notifications
    const notifications = await mongoose.model('Notification').find({
        user: req.user.id,
        read: false
    }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: {
            activeAlerts,
            activeThreatZones,
            assignedLocations: user.assignedLocations,
            sensorStats,
            notifications
        }
    });
});

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
// @access  Private
exports.getRecentActivity = asyncHandler(async (req, res, next) => {
    // Get recent alerts
    const recentAlerts = await Alert.find()
        .populate('location', 'name')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .limit(10);

    // Get recent sensor status changes
    const recentReadings = await mongoose.model('SensorReading')
        .find({ status: { $ne: 'normal' } })
        .populate('sensor', 'name location')
        .sort({ timestamp: -1 })
        .limit(10);

    // Get recent threat zone predictions
    const recentThreatZones = await ThreatZone.find()
        .populate('location', 'name')
        .sort({ timestamp: -1 })
        .limit(10);

    // Combine activities and sort by date
    const activities = [
        ...recentAlerts.map(alert => ({
            type: 'alert',
            id: alert._id,
            title: alert.title,
            severity: alert.severity,
            location: alert.location?.name || 'Unknown',
            timestamp: alert.createdAt,
            createdBy: alert.createdBy?.name || 'System'
        })),
        ...recentReadings.map(reading => ({
            type: 'reading',
            id: reading._id,
            sensorId: reading.sensor?._id,
            sensorName: reading.sensor?.name || 'Unknown',
            status: reading.status,
            timestamp: reading.timestamp
        })),
        ...recentThreatZones.map(zone => ({
            type: 'threatZone',
            id: zone._id,
            level: zone.prediction.level,
            location: zone.location?.name || 'Unknown',
            timestamp: zone.timestamp,
            isActive: zone.isActive
        }))
    ];

    // Sort by timestamp, most recent first
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
        success: true,
        count: activities.length,
        activities: activities.slice(0, 20) // Return top 20 activities
    });
});

// @desc    Get location overview
// @route   GET /api/dashboard/locations/:id
// @access  Private
exports.getLocationOverview = asyncHandler(async (req, res, next) => {
    const location = await Location.findById(req.params.id);

    if (!location) {
        return next(new ErrorResponse(`Location not found with id of ${req.params.id}`, 404));
    }

    // Get sensors for this location
    const sensors = await Sensor.find({ location: req.params.id });

    // Get current threat zone if any
    const threatZone = await ThreatZone.getCurrentThreatZone(req.params.id);

    // Get active alerts for this location
    const activeAlerts = await Alert.find({
        location: req.params.id,
        status: { $in: ['active', 'acknowledged'] }
    }).sort({ createdAt: -1 });

    // Get recent sensor readings for this location
    const recentReadings = await mongoose.model('SensorReading')
        .find({
            sensor: { $in: sensors.map(sensor => sensor._id) }
        })
        .sort({ timestamp: -1 })
        .limit(50);

    // Compile summary data
    const summary = {
        location,
        sensors: {
            total: sensors.length,
            online: sensors.filter(s => s.status === 'online').length,
            offline: sensors.filter(s => s.status === 'offline').length,
            warning: sensors.filter(s => s.status === 'warning').length,
            critical: sensors.filter(s => s.status === 'critical').length
        },
        threatZone,
        activeAlerts,
        recentReadings: recentReadings.slice(0, 10)
    };

    res.status(200).json({
        success: true,
        data: summary
    });
});

// @desc    Get system stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
exports.getSystemStats = asyncHandler(async (req, res, next) => {
    // Get counts for each collection
    const userCount = await User.countDocuments();
    const locationCount = await Location.countDocuments();
    const sensorCount = await Sensor.countDocuments();
    const alertCount = await Alert.countDocuments();
    const readingCount = await mongoose.model('SensorReading').countDocuments();
    const threatZoneCount = await ThreatZone.countDocuments();

    // Get active alerts by severity
    const alertsBySeverity = await Alert.aggregate([
        {
            $match: {
                status: { $in: ['active', 'acknowledged'] }
            }
        },
        {
            $group: {
                _id: '$severity',
                count: { $sum: 1 }
            }
        }
    ]);

    // Format alert severity data
    const alertSeverityStats = {
        info: 0,
        warning: 0,
        danger: 0,
        critical: 0,
        emergency: 0
    };

    alertsBySeverity.forEach(item => {
        alertSeverityStats[item._id] = item.count;
    });

    // Get threat predictions by level
    const threatsByLevel = await ThreatZone.aggregate([
        {
            $match: {
                isActive: true
            }
        },
        {
            $group: {
                _id: '$prediction.level',
                count: { $sum: 1 }
            }
        }
    ]);

    // Format threat level data
    const threatLevelStats = {
        minimal: 0,
        low: 0,
        moderate: 0,
        high: 0,
        critical: 0
    };

    threatsByLevel.forEach(item => {
        threatLevelStats[item._id] = item.count;
    });

    res.status(200).json({
        success: true,
        stats: {
            counts: {
                users: userCount,
                locations: locationCount,
                sensors: sensorCount,
                alerts: alertCount,
                readings: readingCount,
                threatZones: threatZoneCount
            },
            alerts: alertSeverityStats,
            threats: threatLevelStats
        }
    });
});
