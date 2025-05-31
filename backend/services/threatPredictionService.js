const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Service to communicate with the Python threat prediction model
 */
class ThreatPredictionService {
    constructor() {
        this.baseUrl = process.env.PREDICTION_MODEL_URL || 'http://localhost:5001';
        this.modelReady = false;
        this.lastHealthCheck = null;

        // Initialize health check
        this.checkHealth();

        // Set up periodic health checks
        setInterval(() => this.checkHealth(), 60000); // Check every minute
    }

    /**
     * Check if the prediction model service is healthy
     */
    async checkHealth() {
        try {
            const response = await axios.get(`${this.baseUrl}/health`, {
                timeout: 5000
            });
            this.modelReady = response.data.status === 'ok';
            this.lastHealthCheck = new Date();
            logger.info(`Prediction model health check: ${this.modelReady ? 'OK' : 'FAILED'}`);
        } catch (err) {
            this.modelReady = false;
            this.lastHealthCheck = new Date();
            logger.error(`Error in prediction model health check: ${err.message}`);
        }
        return this.modelReady;
    }

    /**
     * Get threat zone prediction from the model
     * @param {Object} data - Sensor and environmental data for prediction
     * @returns {Object} - Prediction results
     */
    async predictThreatZone(data) {
        try {
            // If model isn't ready, check health first
            if (!this.modelReady) {
                const isHealthy = await this.checkHealth();
                if (!isHealthy) {
                    // If still not ready, use fallback prediction
                    logger.warn('Prediction model not available, using fallback prediction');
                    return this.fallbackPrediction(data);
                }
            }

            const response = await axios.post(`${this.baseUrl}/predict`, data, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });

            return response.data;
        } catch (err) {
            logger.error(`Error in predictThreatZone: ${err.message}`);

            // Use fallback prediction if the request fails
            return this.fallbackPrediction(data);
        }
    }

    /**
     * Get evacuation routes based on threat zone and location
     * @param {Object} data - Threat zone and location data
     * @returns {Object} - Evacuation route results
     */
    async getEvacuationRoutes(data) {
        try {
            if (!this.modelReady) {
                const isHealthy = await this.checkHealth();
                if (!isHealthy) {
                    logger.warn('Prediction model not available, using fallback evacuation routes');
                    return this.fallbackEvacuationRoutes(data);
                }
            }

            const response = await axios.post(`${this.baseUrl}/evacuation-routes`, data, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            return response.data;
        } catch (err) {
            logger.error(`Error in getEvacuationRoutes: ${err.message}`);
            return this.fallbackEvacuationRoutes(data);
        }
    }

    /**
     * Get model information
     * @returns {Object} - Model version and capabilities
     */
    async getModelInfo() {
        try {
            const response = await axios.get(`${this.baseUrl}/info`);
            return response.data;
        } catch (err) {
            logger.error(`Error in getModelInfo: ${err.message}`);
            return {
                version: 'unknown',
                status: 'unavailable'
            };
        }
    }

    /**
     * Fallback prediction when the model service is unavailable
     * @param {Object} data - Sensor and environmental data
     * @returns {Object} - Simple fallback prediction
     */
    fallbackPrediction(data) {
        logger.info('Using fallback prediction algorithm');

        // Simple threat level calculation based on gas readings
        const gasSum = data.mq2_reading + data.mq4_reading + data.mq6_reading + data.mq8_reading;
        let threatLevel = 'minimal';
        let predictionValue = 0;

        if (gasSum > 15) {
            threatLevel = 'critical';
            predictionValue = 9;
        } else if (gasSum > 10) {
            threatLevel = 'high';
            predictionValue = 7;
        } else if (gasSum > 5) {
            threatLevel = 'moderate';
            predictionValue = 5;
        } else if (gasSum > 2) {
            threatLevel = 'low';
            predictionValue = 3;
        }

        // Generate simple threat zones
        const lat = data.location[0];
        const lon = data.location[1];

        // Convert wind direction to radians
        const windDirRad = (data.wind_direction || 0) * Math.PI / 180;

        // Wind speed factor (stronger wind = larger threat zone)
        const windSpeedFactor = Math.min(data.wind_speed || 5, 30) / 5;

        // Generate threat zones with simple algorithm
        const zones = {
            extreme_danger: this.generateZonePoints(lat, lon, 0.2 * windSpeedFactor, windDirRad),
            high_danger: this.generateZonePoints(lat, lon, 0.5 * windSpeedFactor, windDirRad),
            moderate_danger: this.generateZonePoints(lat, lon, 1.0 * windSpeedFactor, windDirRad),
            low_danger: this.generateZonePoints(lat, lon, 2.0 * windSpeedFactor, windDirRad)
        };

        // Generate simple evacuation routes
        const evacuationRoutes = this.generateFallbackEvacuationRoutes(lat, lon, windDirRad);

        return {
            threat_level: threatLevel,
            prediction_value: predictionValue,
            confidence: 0.5, // Low confidence for fallback
            zones,
            evacuation_routes: evacuationRoutes,
            model_version: 'fallback-1.0',
            is_fallback: true
        };
    }

    /**
     * Generate simple evacuation routes when the model is unavailable
     * @param {Object} data - Threat zone data
     * @returns {Array} - Fallback evacuation routes
     */
    fallbackEvacuationRoutes(data) {
        // Extract coordinates from the threat zone if available
        let lat, lon, windDirRad;

        if (data.source && data.source.coordinates) {
            lat = data.source.coordinates[0];
            lon = data.source.coordinates[1];
        } else if (data.location) {
            lat = data.location[0];
            lon = data.location[1];
        } else {
            // Default coordinates if none available
            lat = 0;
            lon = 0;
        }

        // Get wind direction or use a default
        if (data.environmentalFactors && data.environmentalFactors.windDirection) {
            windDirRad = data.environmentalFactors.windDirection * Math.PI / 180;
        } else if (data.wind_direction) {
            windDirRad = data.wind_direction * Math.PI / 180;
        } else {
            windDirRad = 0;
        }

        return this.generateFallbackEvacuationRoutes(lat, lon, windDirRad);
    }

    /**
     * Generate points for a threat zone
     * @param {number} lat - Latitude of center point
     * @param {number} lon - Longitude of center point
     * @param {number} distance - Base distance in kilometers
     * @param {number} windDirRad - Wind direction in radians
     * @returns {Array} - Array of coordinate points forming a polygon
     */
    generateZonePoints(lat, lon, distance, windDirRad) {
        const points = [];

        // Generate points in a circle, distorted by wind direction
        for (let angle = 0; angle < 360; angle += 10) {
            const angleRad = angle * Math.PI / 180;

            // Make the shape more elliptical in wind direction
            // Downwind gets 3x the distance, upwind gets 0.5x the distance
            const distortionFactor = 1 + 2 * Math.cos(angleRad - windDirRad);
            const adjustedDistance = distance * distortionFactor;

            // Convert to lat/lon
            // 111.32 km = 1 degree of latitude
            const dlat = adjustedDistance * Math.cos(angleRad) / 111.32;
            // Longitude degrees vary with latitude
            const dlon = adjustedDistance * Math.sin(angleRad) / (111.32 * Math.cos(lat * Math.PI / 180));

            points.push([lat + dlat, lon + dlon]);
        }

        // Close the loop
        points.push(points[0]);

        return points;
    }

    /**
     * Generate fallback evacuation routes
     * @param {number} lat - Latitude of center point
     * @param {number} lon - Longitude of center point
     * @param {number} windDirRad - Wind direction in radians
     * @returns {Array} - Array of evacuation routes
     */
    generateFallbackEvacuationRoutes(lat, lon, windDirRad) {
        const routes = [];

        // Generate routes perpendicular to wind direction (safest)
        const perpendicularAngle1 = windDirRad + Math.PI / 2;
        const perpendicularAngle2 = windDirRad - Math.PI / 2;

        // Also generate a route directly upwind (if necessary)
        const upwindAngle = windDirRad + Math.PI;

        // Create perpendicular routes
        routes.push({
            type: 'LineString',
            coordinates: this.generateRoutePath(lat, lon, perpendicularAngle1, 3),
            safetyLevel: 'safe',
            estimatedTimeMinutes: 15
        });

        routes.push({
            type: 'LineString',
            coordinates: this.generateRoutePath(lat, lon, perpendicularAngle2, 3),
            safetyLevel: 'safe',
            estimatedTimeMinutes: 15
        });

        // Create upwind route (emergency use)
        routes.push({
            type: 'LineString',
            coordinates: this.generateRoutePath(lat, lon, upwindAngle, 2),
            safetyLevel: 'riskyButNecessary',
            estimatedTimeMinutes: 10
        });

        return routes;
    }

    /**
     * Generate a path for an evacuation route
     * @param {number} lat - Starting latitude
     * @param {number} lon - Starting longitude
     * @param {number} direction - Direction in radians
     * @param {number} kilometers - Length of path in kilometers
     * @returns {Array} - Array of coordinates forming a path
     */
    generateRoutePath(lat, lon, direction, kilometers) {
        const points = [[lat, lon]];
        const segments = 5;

        for (let i = 1; i <= segments; i++) {
            const distance = (kilometers * i) / segments;

            // Calculate new point at distance in the given direction
            // 111.32 km = 1 degree of latitude
            const dlat = distance * Math.cos(direction) / 111.32;
            // Longitude degrees vary with latitude
            const dlon = distance * Math.sin(direction) / (111.32 * Math.cos(lat * Math.PI / 180));

            points.push([lat + dlat, lon + dlon]);
        }

        return points;
    }
}

module.exports = new ThreatPredictionService();