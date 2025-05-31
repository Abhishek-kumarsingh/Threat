const express = require('express');
const {
    getAlerts,
    getAlert,
    createAlert,
    updateAlert,
    deleteAlert,
    acknowledgeAlert,
    resolveAlert,
    getActiveAlerts,
    sendTestAlert
} = require('../controllers/alertController');

const Alert = require('../models/Alert');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/active')
    .get(getActiveAlerts);

router.route('/test')
    .post(protect, authorize('admin', 'supervisor'), sendTestAlert);

router.route('/')
    .get(advancedResults(Alert, ['location', 'createdBy']), getAlerts)
    .post(protect, authorize('admin', 'supervisor'), createAlert);

router.route('/:id')
    .get(protect, getAlert)
    .put(protect, authorize('admin', 'supervisor'), updateAlert)
    .delete(protect, authorize('admin'), deleteAlert);

router.route('/:id/acknowledge')
    .put(protect, acknowledgeAlert);

router.route('/:id/resolve')
    .put(protect, resolveAlert);

module.exports = router;
