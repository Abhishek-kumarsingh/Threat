const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const threatPredictionService = require('../services/threatPredictionService');
const logger = require('../utils/logger');

/**
 * @desc    Get ML model health status
 * @route   GET /api/v1/ml/health
 * @access  Private (Admin only)
 */
exports.getModelHealth = asyncHandler(async (req, res, next) => {
    try {
        const isHealthy = await threatPredictionService.checkHealth();
        
        res.status(200).json({
            success: true,
            data: {
                status: isHealthy ? 'healthy' : 'unhealthy',
                lastCheck: threatPredictionService.lastHealthCheck,
                modelReady: threatPredictionService.modelReady
            }
        });
    } catch (error) {
        logger.error('Error checking ML model health:', error);
        return next(new ErrorResponse('Failed to check model health', 500));
    }
});

/**
 * @desc    Get ML model information
 * @route   GET /api/v1/ml/info
 * @access  Private (Admin only)
 */
exports.getModelInfo = asyncHandler(async (req, res, next) => {
    try {
        const modelInfo = await threatPredictionService.getModelInfo();
        
        res.status(200).json({
            success: true,
            data: modelInfo
        });
    } catch (error) {
        logger.error('Error getting ML model info:', error);
        return next(new ErrorResponse('Failed to get model information', 500));
    }
});

/**
 * @desc    Test ML model prediction
 * @route   POST /api/v1/ml/test-prediction
 * @access  Private (Admin only)
 */
exports.testPrediction = asyncHandler(async (req, res, next) => {
    try {
        const {
            mq2_reading = 5,
            mq4_reading = 3,
            mq6_reading = 4,
            mq8_reading = 2,
            temperature = 25,
            humidity = 60,
            location = [40.7128, -74.0060], // Default to NYC
            wind_speed = 10,
            wind_direction = 180
        } = req.body;

        const testData = {
            mq2_reading,
            mq4_reading,
            mq6_reading,
            mq8_reading,
            temperature,
            humidity,
            location,
            wind_speed,
            wind_direction
        };

        logger.info('Testing ML model prediction with data:', testData);

        const prediction = await threatPredictionService.predictThreatZone(testData);
        
        res.status(200).json({
            success: true,
            data: {
                input: testData,
                prediction: prediction
            }
        });
    } catch (error) {
        logger.error('Error testing ML model prediction:', error);
        return next(new ErrorResponse('Failed to test prediction', 500));
    }
});

/**
 * @desc    Get evacuation routes from ML model
 * @route   POST /api/v1/ml/evacuation-routes
 * @access  Private
 */
exports.getEvacuationRoutes = asyncHandler(async (req, res, next) => {
    try {
        const {
            location,
            threatZone,
            environmentalFactors
        } = req.body;

        if (!location) {
            return next(new ErrorResponse('Location is required', 400));
        }

        const routeData = {
            location,
            threatZone,
            environmentalFactors
        };

        const routes = await threatPredictionService.getEvacuationRoutes(routeData);
        
        res.status(200).json({
            success: true,
            data: routes
        });
    } catch (error) {
        logger.error('Error getting evacuation routes:', error);
        return next(new ErrorResponse('Failed to get evacuation routes', 500));
    }
});

/**
 * @desc    Force ML model health check
 * @route   POST /api/v1/ml/health-check
 * @access  Private (Admin only)
 */
exports.forceHealthCheck = asyncHandler(async (req, res, next) => {
    try {
        logger.info('Forcing ML model health check...');
        const isHealthy = await threatPredictionService.checkHealth();
        
        res.status(200).json({
            success: true,
            data: {
                status: isHealthy ? 'healthy' : 'unhealthy',
                timestamp: new Date(),
                modelReady: threatPredictionService.modelReady
            }
        });
    } catch (error) {
        logger.error('Error forcing ML model health check:', error);
        return next(new ErrorResponse('Failed to perform health check', 500));
    }
});

/**
 * @desc    Get ML model statistics
 * @route   GET /api/v1/ml/stats
 * @access  Private (Admin only)
 */
exports.getModelStats = asyncHandler(async (req, res, next) => {
    try {
        // This would typically come from a database or model service
        // For now, we'll return mock statistics
        const stats = {
            totalPredictions: 1250,
            accuracyRate: 94.5,
            averageResponseTime: 150, // milliseconds
            lastTrainingDate: '2024-01-01',
            modelVersion: '1.0.0',
            uptime: process.uptime(),
            healthStatus: threatPredictionService.modelReady ? 'healthy' : 'unhealthy'
        };
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error('Error getting ML model stats:', error);
        return next(new ErrorResponse('Failed to get model statistics', 500));
    }
});
