const Sensor = require('../models/Sensor');
const SensorReading = require('../models/SensorReading');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { broadcastSensorReading } = require('../services/websocketService');
const threatPredictionService = require('../services/threatPredictionService');

// @desc    Get all sensors
// @route   GET /api/sensors
// @access  Private
exports.getSensors = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get single sensor
// @route   GET /api/sensors/:id
// @access  Private
exports.getSensor = asyncHandler(async (req, res, next) => {
    const sensor = await Sensor.findById(req.params.id)
        .populate('location', 'name address coordinates')
        .populate('createdBy', 'name');

    if (!sensor) {
        return next(new ErrorResponse(`Sensor not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: sensor
    });
});

// @desc    Create new sensor
// @route   POST /api/sensors
// @access  Private/Admin
exports.createSensor = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    const sensor = await Sensor.create(req.body);

    res.status(201).json({
        success: true,
        data: sensor
    });
});

// @desc    Update sensor
// @route   PUT /api/sensors/:id
// @access  Private/Admin
exports.updateSensor = asyncHandler(async (req, res, next) => {
    let sensor = await Sensor.findById(req.params.id);

    if (!sensor) {
        return next(new ErrorResponse(`Sensor not found with id of ${req.params.id}`, 404));
    }

    sensor = await Sensor.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: sensor
    });
});

// @desc    Delete sensor
// @route   DELETE /api/sensors/:id
// @access  Private/Admin
exports.deleteSensor = asyncHandler(async (req, res, next) => {
    const sensor = await Sensor.findById(req.params.id);

    if (!sensor) {
        return next(new ErrorResponse(`Sensor not found with id of ${req.params.id}`, 404));
    }

    // Delete associated readings
    await SensorReading.deleteMany({ sensor: req.params.id });

    // Delete sensor
    await sensor.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get sensor readings
// @route   GET /api/sensors/:id/readings
// @access  Private
exports.getSensorReadings = asyncHandler(async (req, res, next) => {
    const sensor = await Sensor.findById(req.params.id);

    if (!sensor) {
        return next(new ErrorResponse(`Sensor not found with id of ${req.params.id}`, 404));
    }

    // Get date range from query params
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(0);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    // Get readings for specified date range
    const readings = await SensorReading.find({
        sensor: req.params.id,
        timestamp: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ timestamp: req.query.sortOrder === 'asc' ? 1 : -1 });

    res.status(200).json({
        success: true,
        count: readings.length,
        data: readings
    });
});

// @desc    Create sensor reading
// @route   POST /api/sensors/:id/readings
// @access  Private
exports.createSensorReading = asyncHandler(async (req, res, next) => {
    const sensor = await Sensor.findById(req.params.id);

    if (!sensor) {
        return next(new ErrorResponse(`Sensor not found with id of ${req.params.id}`, 404));
    }

    // Add sensor id to req.body
    req.body.sensor = req.params.id;

    // Determine status based on readings
    const status = determineStatus(req.body.readings, sensor.thresholds);
    req.body.status = status;

    // Create reading
    const reading = await SensorReading.create(req.body);

    // Update sensor status and last reading time
    await Sensor.findByIdAndUpdate(req.params.id, {
        status,
        lastReading: Date.now()
    });

    // Broadcast to WebSocket clients
    broadcastSensorReading(reading);

    // If status is warning or above, check if we need to make a prediction
    if (status !== 'normal') {
        try {
            const shouldPredict = await checkForPredictionTrigger(reading, sensor);

            if (shouldPredict) {
                // Call prediction service (async)
                triggerPrediction(reading, sensor);
            }
        } catch (err) {
            console.error('Error checking for prediction trigger:', err);
        }
    }

    res.status(201).json({
        success: true,
        data: reading
    });
});

// @desc    Get sensor status stats
// @route   GET /api/sensors/status
// @access  Private
exports.getSensorStats = asyncHandler(async (req, res, next) => {
    const stats = await Sensor.getStatusStats();

    res.status(200).json({
        success: true,
        stats
    });
});

// @desc    Get sensors that need maintenance
// @route   GET /api/sensors/maintenance-due
// @access  Private/Admin
exports.getMaintenanceDueSensors = asyncHandler(async (req, res, next) => {
    const sensors = await Sensor.findMaintenanceDue();

    res.status(200).json({
        success: true,
        count: sensors.length,
        data: sensors
    });
});

// @desc    Get sensor thresholds
// @route   GET /api/sensors/:id/thresholds
// @access  Private
exports.getSensorThresholds = asyncHandler(async (req, res, next) => {
    const sensor = await Sensor.findById(req.params.id);

    if (!sensor) {
        return next(new ErrorResponse(`Sensor not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: sensor.thresholds
    });
});

// @desc    Update sensor thresholds
// @route   PUT /api/sensors/:id/thresholds
// @access  Private/Admin
exports.updateSensorThresholds = asyncHandler(async (req, res, next) => {
    const sensor = await Sensor.findById(req.params.id);

    if (!sensor) {
        return next(new ErrorResponse(`Sensor not found with id of ${req.params.id}`, 404));
    }

    // Update thresholds
    const updatedSensor = await Sensor.findByIdAndUpdate(
        req.params.id,
        { thresholds: req.body },
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        success: true,
        data: updatedSensor.thresholds
    });
});

// Helper functions

// Determine the status based on sensor readings and thresholds
const determineStatus = (readings, thresholds) => {
    // Default to normal
    let status = 'normal';

    // Check each gas reading against its thresholds
    for (const [key, value] of Object.entries(readings)) {
        if (!key.startsWith('mq') || !thresholds[key]) continue;

        if (value >= thresholds[key].critical) {
            return 'critical'; // Return immediately if any reading is critical
        } else if (value >= thresholds[key].danger && status !== 'critical') {
            status = 'danger';
        } else if (value >= thresholds[key].warning && status !== 'danger' && status !== 'critical') {
            status = 'warning';
        }
    }

    return status;
};

// Check if we should trigger a prediction
const checkForPredictionTrigger = async (reading, sensor) => {
    // Get recent readings from this sensor
    const recentReadings = await SensorReading.find({
        sensor: sensor._id,
        timestamp: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // Last 10 minutes
    }).sort({ timestamp: -1 });

    // If this is the first warning/danger reading after normal readings, trigger prediction
    if (recentReadings.length > 1) {
        const previousReading = recentReadings[1]; // Second most recent

        if (
            (reading.status === 'warning' || reading.status === 'danger' || reading.status === 'critical') &&
            previousReading.status === 'normal'
        ) {
            return true;
        }

        // If readings are getting worse, also trigger
        if (
            (reading.status === 'critical' && previousReading.status !== 'critical') ||
            (reading.status === 'danger' && previousReading.status === 'warning')
        ) {
            return true;
        }
    }

    return false;
};

// Trigger prediction model asynchronously
const triggerPrediction = async (reading, sensor) => {
    try {
        // Get location from sensor
        const location = await mongoose.model('Location').findById(sensor.location);

        if (!location) {
            console.error('Location not found for sensor:', sensor._id);
            return;
        }

        // Prepare prediction data
        const predictionData = {
            location: location._id,
            source: {
                type: 'Point',
                coordinates: reading.location.coordinates
            }
        };

        // Call prediction service
        const predictionResponse = await axios.post(
            `${process.env.API_URL}/api/threat-zones`,
            predictionData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.API_TOKEN}`
                }
            }
        );

        console.log('Prediction triggered successfully:', predictionResponse.data);
    } catch (err) {
        console.error('Error triggering prediction:', err);
    }
};
