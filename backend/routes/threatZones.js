const express = require('express');
const {
    getThreatZones,
    getThreatZone,
    createThreatZone,
    updateThreatZone,
    deleteThreatZone,
    deactivateThreatZone,
    getActiveThreatZones,
    getActiveLocationThreatZone,
    generatePrediction,
    getLocationThreatZoneHistory,
    predictAllLocations
} = require('../controllers/threatZoneController');

const ThreatZone = require('../models/ThreatZone');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/active')
    .get(protect, getActiveThreatZones);

router.route('/predict')
    .post(protect, authorize('admin', 'supervisor'), generatePrediction);

router.route('/predict-all')
    .post(protect, authorize('admin'), predictAllLocations);

router.route('/locations/:locationId/active')
    .get(protect, getActiveLocationThreatZone);

router.route('/locations/:locationId/history')
    .get(protect, getLocationThreatZoneHistory);

router.route('/')
    .get(protect, advancedResults(ThreatZone, ['location', 'createdBy']), getThreatZones)
    .post(protect, authorize('admin', 'supervisor'), createThreatZone);

router.route('/:id')
    .get(protect, getThreatZone)
    .put(protect, authorize('admin', 'supervisor'), updateThreatZone)
    .delete(protect, authorize('admin'), deleteThreatZone);

router.route('/:id/deactivate')
    .put(protect, authorize('admin', 'supervisor'), deactivateThreatZone);

module.exports = router;
