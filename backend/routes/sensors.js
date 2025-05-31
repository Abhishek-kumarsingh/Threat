const express = require('express');
const {
    getSensors,
    getSensor,
    createSensor,
    updateSensor,
    deleteSensor,
    getSensorReadings,
    createSensorReading,
    getSensorStats,
    getMaintenanceDueSensors,
    getSensorThresholds,
    updateSensorThresholds
} = require('../controllers/sensorController');

const Sensor = require('../models/Sensor');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/status')
    .get(protect, getSensorStats);

router.route('/maintenance-due')
    .get(protect, authorize('admin', 'supervisor'), getMaintenanceDueSensors);

router.route('/')
    .get(protect, advancedResults(Sensor, 'location'), getSensors)
    .post(protect, authorize('admin', 'supervisor'), createSensor);

router.route('/:id')
    .get(protect, getSensor)
    .put(protect, authorize('admin', 'supervisor'), updateSensor)
    .delete(protect, authorize('admin'), deleteSensor);

router.route('/:id/readings')
    .get(protect, getSensorReadings)
    .post(protect, createSensorReading);

router.route('/:id/thresholds')
    .get(protect, getSensorThresholds)
    .put(protect, authorize('admin', 'supervisor'), updateSensorThresholds);

module.exports = router;
