const express = require('express');
const {
    getModelHealth,
    getModelInfo,
    testPrediction,
    getEvacuationRoutes,
    forceHealthCheck,
    getModelStats
} = require('../controllers/mlModelController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Public routes (for authenticated users)
router.post('/evacuation-routes', getEvacuationRoutes);

// Admin only routes
router.get('/health', authorize('admin'), getModelHealth);
router.get('/info', authorize('admin'), getModelInfo);
router.get('/stats', authorize('admin'), getModelStats);
router.post('/test-prediction', authorize('admin'), testPrediction);
router.post('/health-check', authorize('admin'), forceHealthCheck);

module.exports = router;
