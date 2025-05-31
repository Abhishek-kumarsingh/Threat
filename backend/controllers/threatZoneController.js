const ThreatZone = require('../models/ThreatZone');
const SensorReading = require('../models/SensorReading');
const Location = require('../models/Location');
const Alert = require('../models/Alert');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const threatPredictionService = require('../services/threatPredictionService');
const notificationService = require('../services/notificationService');
const { broadcastThreatZone } = require('../services/websocketService');

// @desc    Get all threat zones
// @route   GET /api/threat-zones
// @access  Private
exports.getThreatZones = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get single threat zone
// @route   GET /api/threat-zones/:id
// @access  Private
exports.getThreatZone = asyncHandler(async (req, res, next) => {
    const threatZone = await ThreatZone.findById(req.params.id)
        .populate('location', 'name address coordinates')
        .populate('createdBy', 'name')
        .populate('triggeredAlerts');

    if (!threatZone) {
        return next(new ErrorResponse(`Threat zone not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: threatZone
    });
});

// @desc    Create new threat zone prediction
// @route   POST /api/threat-zones
// @access  Private/Admin
exports.createThreatZone = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Check if location exists
    const location = await Location.findById(req.body.location);
    if (!location) {
        return next(new ErrorResponse(`Location not found with id of ${req.body.location}`, 404));
    }

    // If manual creation, use provided data
    if (req.body.manual) {
        const threatZone = await ThreatZone.create(req.body);

        // Broadcast to connected clients
        broadcastThreatZone(threatZone);

        return res.status(201).json({
            success: true,
            data: threatZone
        });
    }

    // Otherwise get latest sensor readings for this location
    const sensors = await Location.getSensors(req.body.location);

    if (!sensors || sensors.length === 0) {
        return next(new ErrorResponse(`No sensors found for this location`, 404));
    }

    // Get the latest reading for each sensor
    const latestReadings = await Promise.all(
        sensors.map(async (sensor) => {
            return await SensorReading.getLatestReading(sensor._id);
        })
    );

    // Filter out null readings and find the most recent one
    const validReadings = latestReadings.filter(reading => reading !== null);

    if (validReadings.length === 0) {
        return next(new ErrorResponse(`No sensor readings available for prediction`, 404));
    }

    // Sort by timestamp, descending
    validReadings.sort((a, b) => b.timestamp - a.timestamp);
    const mostRecentReading = validReadings[0];

    // Prepare data for prediction model
    const predictionData = {
        mq2_reading: mostRecentReading.readings.mq2,
        mq4_reading: mostRecentReading.readings.mq4,
        mq6_reading: mostRecentReading.readings.mq6,
        mq8_reading: mostRecentReading.readings.mq8,
        temperature: mostRecentReading.readings.temperature,
        humidity: mostRecentReading.readings.humidity,
        wind_speed: mostRecentReading.metadata?.windSpeed || 5, // Default if not available
        wind_direction: mostRecentReading.metadata?.windDirection || 0, // Default if not available
        location: mostRecentReading.location.coordinates,
        pressure: mostRecentReading.metadata?.pressure
    };

    // Get prediction from model
    const prediction = await threatPredictionService.predictThreatZone(predictionData);

    // Create threat zone with prediction data
    const threatZoneData = {
        location: req.body.location,
        source: {
            type: 'Point',
            coordinates: mostRecentReading.location.coordinates
        },
        prediction: {
            level: prediction.threat_level.toLowerCase(),
            confidence: prediction.confidence || 0.8,
            rawValue: prediction.prediction_value
        },
        environmentalFactors: {
            windSpeed: predictionData.wind_speed,
            windDirection: predictionData.wind_direction,
            temperature: predictionData.temperature,
            humidity: predictionData.humidity,
            pressure: predictionData.pressure
        },
        zones: {
            extremeDanger: {
                type: 'Polygon',
                coordinates: [prediction.zones.extreme_danger]
            },
            highDanger: {
                type: 'Polygon',
                coordinates: [prediction.zones.high_danger]
            },
            moderateDanger: {
                type: 'Polygon',
                coordinates: [prediction.zones.moderate_danger]
            },
            lowDanger: {
                type: 'Polygon',
                coordinates: [prediction.zones.low_danger]
            }
        },
        evacuationRoutes: prediction.evacuation_routes || [],
        modelVersion: prediction.model_version || '1.0',
        isActive: true,
        expiration: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        createdBy: req.user.id
    };

    // Deactivate previous active threat zones for this location
    await ThreatZone.updateMany(
        { location: req.body.location, isActive: true },
        { isActive: false }
    );

    // Create new threat zone
    const threatZone = await ThreatZone.create(threatZoneData);

    // If prediction is dangerous, create an alert
    if (['moderate', 'high', 'critical'].includes(threatZone.prediction.level)) {
        const alertSeverity =
            threatZone.prediction.level === 'critical' ? 'emergency' :
                threatZone.prediction.level === 'high' ? 'critical' :
                    'danger';

        const alert = await Alert.create({
            title: `${threatZone.prediction.level.toUpperCase()} Threat Level Detected`,
            message: `A ${threatZone.prediction.level} threat level has been detected at ${location.name}. Please follow evacuation procedures.`,
            severity: alertSeverity,
            type: 'automatic',
            source: 'prediction',
            location: location._id,
            affectedAreas: [
                {
                    type: 'Polygon',
                    coordinates: threatZone.zones.extremeDanger.coordinates,
                    dangerLevel: 'extreme'
                },
                {
                    type: 'Polygon',
                    coordinates: threatZone.zones.highDanger.coordinates,
                    dangerLevel: 'high'
                }
            ],
            actions: [
                'Follow evacuation routes',
                'Move to assembly points',
                'Wait for further instructions'
            ],
            createdBy: req.user.id,
            expiresAt: threatZone.expiration
        });

        // Link alert to threat zone
        threatZone.triggeredAlerts.push(alert._id);
        await threatZone.save();

        // Send notifications about new alert
        await notificationService.notifyAboutAlert(alert);
    }

    // Broadcast to connected clients
    broadcastThreatZone(threatZone);

    res.status(201).json({
        success: true,
        data: threatZone
    });
});

// @desc    Update threat zone
// @route   PUT /api/threat-zones/:id
// @access  Private/Admin
exports.updateThreatZone = asyncHandler(async (req, res, next) => {
    let threatZone = await ThreatZone.findById(req.params.id);

    if (!threatZone) {
        return next(new ErrorResponse(`Threat zone not found with id of ${req.params.id}`, 404));
    }

    // Don't allow changing these fields after creation
    delete req.body.createdBy;
    delete req.body.createdAt;
    delete req.body.location;

    threatZone = await ThreatZone.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    // Broadcast to connected clients
    broadcastThreatZone(threatZone);

    res.status(200).json({
        success: true,
        data: threatZone
    });
});

// @desc    Deactivate threat zone
// @route   PUT /api/threat-zones/:id/deactivate
// @access  Private/Admin
exports.deactivateThreatZone = asyncHandler(async (req, res, next) => {
    const threatZone = await ThreatZone.findById(req.params.id);

    if (!threatZone) {
        return next(new ErrorResponse(`Threat zone not found with id of ${req.params.id}`, 404));
    }

    await threatZone.deactivate();

    // Broadcast to connected clients
    broadcastThreatZone(threatZone);

    res.status(200).json({
        success: true,
        data: threatZone
    });
});

// @desc    Delete threat zone
// @route   DELETE /api/threat-zones/:id
// @access  Private/Admin
exports.deleteThreatZone = asyncHandler(async (req, res, next) => {
    const threatZone = await ThreatZone.findById(req.params.id);

    if (!threatZone) {
        return next(new ErrorResponse(`Threat zone not found with id of ${req.params.id}`, 404));
    }

    // Only admins can delete threat zones
    if (req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to delete threat zones`,
                401
            )
        );
    }

    await threatZone.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get current active threat zones
// @route   GET /api/threat-zones/active
// @access  Private
exports.getActiveThreatZones = asyncHandler(async (req, res, next) => {
    const threatZones = await ThreatZone.getAllActiveThreatZones();

    res.status(200).json({
        success: true,
        count: threatZones.length,
        data: threatZones
    });
});

// @desc    Get current active threat zone for a location
// @route   GET /api/threat-zones/locations/:locationId/active
// @access  Private
exports.getActiveLocationThreatZone = asyncHandler(async (req, res, next) => {
    const threatZone = await ThreatZone.getCurrentThreatZone(req.params.locationId);

    if (!threatZone) {
        return next(new ErrorResponse(`No active threat zone found for this location`, 404));
    }

    res.status(200).json({
        success: true,
        data: threatZone
    });
});

// @desc    Generate a prediction without saving
// @route   POST /api/threat-zones/predict
// @access  Private
exports.generatePrediction = asyncHandler(async (req, res, next) => {
    // Validate input data
    const {
        mq2_reading,
        mq4_reading,
        mq6_reading,
        mq8_reading,
        temperature,
        humidity,
        wind_speed,
        wind_direction,
        location,
        pressure
    } = req.body;

    if (!mq2_reading || !mq4_reading || !mq6_reading || !mq8_reading ||
        !temperature || !humidity || !location) {
        return next(new ErrorResponse('Missing required parameters for prediction', 400));
    }

    // Get prediction from model
    const predictionData = {
        mq2_reading,
        mq4_reading,
        mq6_reading,
        mq8_reading,
        temperature,
        humidity,
        wind_speed: wind_speed || 5, // Default if not provided
        wind_direction: wind_direction || 0, // Default if not provided
        location,
        pressure
    };

    const prediction = await threatPredictionService.predictThreatZone(predictionData);

    res.status(200).json({
        success: true,
        data: prediction
    });
});

// @desc    Get historical threat zones for a location
// @route   GET /api/threat-zones/locations/:locationId/history
// @access  Private
exports.getLocationThreatZoneHistory = asyncHandler(async (req, res, next) => {
    // Check if location exists
    const location = await Location.findById(req.params.locationId);
    if (!location) {
        return next(new ErrorResponse(`Location not found with id of ${req.params.locationId}`, 404));
    }

    // Get start and end dates from query params
    const startDate = req.query.startDate
        ? new Date(req.query.startDate)
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default: 7 days ago

    const endDate = req.query.endDate
        ? new Date(req.query.endDate)
        : new Date(); // Default: now

    const threatZones = await ThreatZone.find({
        location: req.params.locationId,
        timestamp: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ timestamp: -1 });

    res.status(200).json({
        success: true,
        count: threatZones.length,
        data: threatZones
    });
});

// @desc    Run model prediction based on latest sensor data for all locations
// @route   POST /api/threat-zones/predict-all
// @access  Private/Admin
exports.predictAllLocations = asyncHandler(async (req, res, next) => {
    // Get all locations
    const locations = await Location.find({});

    if (!locations || locations.length === 0) {
        return next(new ErrorResponse('No locations found', 404));
    }

    const results = [];
    const errors = [];

    // Process each location
    for (const location of locations) {
        try {
            // Get sensors for this location
            const sensors = await Location.getSensors(location._id);

            if (!sensors || sensors.length === 0) {
                errors.push({
                    location: location._id,
                    name: location.name,
                    error: 'No sensors found for this location'
                });
                continue;
            }

            // Get the latest reading for each sensor
            const latestReadings = await Promise.all(
                sensors.map(async (sensor) => {
                    return await SensorReading.getLatestReading(sensor._id);
                })
            );

            // Filter out null readings and find the most recent one
            const validReadings = latestReadings.filter(reading => reading !== null);

            if (validReadings.length === 0) {
                errors.push({
                    location: location._id,
                    name: location.name,
                    error: 'No sensor readings available for prediction'
                });
                continue;
            }

            // Sort by timestamp, descending
            validReadings.sort((a, b) => b.timestamp - a.timestamp);
            const mostRecentReading = validReadings[0];

            // Prepare data for prediction model
            const predictionData = {
                mq2_reading: mostRecentReading.readings.mq2,
                mq4_reading: mostRecentReading.readings.mq4,
                mq6_reading: mostRecentReading.readings.mq6,
                mq8_reading: mostRecentReading.readings.mq8,
                temperature: mostRecentReading.readings.temperature,
                humidity: mostRecentReading.readings.humidity,
                wind_speed: mostRecentReading.metadata?.windSpeed || 5, // Default if not available
                wind_direction: mostRecentReading.metadata?.windDirection || 0, // Default if not available
                location: mostRecentReading.location.coordinates,
                pressure: mostRecentReading.metadata?.pressure
            };

            // Get prediction from model
            const prediction = await threatPredictionService.predictThreatZone(predictionData);

            // Create threat zone with prediction data
            const threatZoneData = {
                location: location._id,
                source: {
                    type: 'Point',
                    coordinates: mostRecentReading.location.coordinates
                },
                prediction: {
                    level: prediction.threat_level.toLowerCase(),
                    confidence: prediction.confidence || 0.8,
                    rawValue: prediction.prediction_value
                },
                environmentalFactors: {
                    windSpeed: predictionData.wind_speed,
                    windDirection: predictionData.wind_direction,
                    temperature: predictionData.temperature,
                    humidity: predictionData.humidity,
                    pressure: predictionData.pressure
                },
                zones: {
                    extremeDanger: {
                        type: 'Polygon',
                        coordinates: [prediction.zones.extreme_danger]
                    },
                    highDanger: {
                        type: 'Polygon',
                        coordinates: [prediction.zones.high_danger]
                    },
                    moderateDanger: {
                        type: 'Polygon',
                        coordinates: [prediction.zones.moderate_danger]
                    },
                    lowDanger: {
                        type: 'Polygon',
                        coordinates: [prediction.zones.low_danger]
                    }
                },
                evacuationRoutes: prediction.evacuation_routes || [],
                modelVersion: prediction.model_version || '1.0',
                isActive: true,
                expiration: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
                createdBy: req.user.id
            };

            // Deactivate previous active threat zones for this location
            await ThreatZone.updateMany(
                { location: location._id, isActive: true },
                { isActive: false }
            );

            // Create new threat zone
            const threatZone = await ThreatZone.create(threatZoneData);

            // If prediction is dangerous, create an alert
            if (['moderate', 'high', 'critical'].includes(threatZone.prediction.level)) {
                const alertSeverity =
                    threatZone.prediction.level === 'critical' ? 'emergency' :
                        threatZone.prediction.level === 'high' ? 'critical' :
                            'danger';

                const alert = await Alert.create({
                    title: `${threatZone.prediction.level.toUpperCase()} Threat Level Detected`,
                    message: `A ${threatZone.prediction.level} threat level has been detected at ${location.name}. Please follow evacuation procedures.`,
                    severity: alertSeverity,
                    type: 'automatic',
                    source: 'prediction',
                    location: location._id,
                    affectedAreas: [
                        {
                            type: 'Polygon',
                            coordinates: threatZone.zones.extremeDanger.coordinates,
                            dangerLevel: 'extreme'
                        },
                        {
                            type: 'Polygon',
                            coordinates: threatZone.zones.highDanger.coordinates,
                            dangerLevel: 'high'
                        }
                    ],
                    actions: [
                        'Follow evacuation routes',
                        'Move to assembly points',
                        'Wait for further instructions'
                    ],
                    createdBy: req.user.id,
                    expiresAt: threatZone.expiration
                });

                // Link alert to threat zone
                threatZone.triggeredAlerts.push(alert._id);
                await threatZone.save();

                // Send notifications about new alert
                await notificationService.notifyAboutAlert(alert);
            }

            // Broadcast to connected clients
            broadcastThreatZone(threatZone);

            results.push({
                location: location._id,
                name: location.name,
                threatZone: threatZone._id,
                predictionLevel: threatZone.prediction.level
            });
        } catch (err) {
            errors.push({
                location: location._id,
                name: location.name,
                error: err.message
            });
        }
    }

    res.status(200).json({
        success: true,
        resultsCount: results.length,
        errorsCount: errors.length,
        results,
        errors
    });
});
