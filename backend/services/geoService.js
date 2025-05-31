const axios = require('axios');
const NodeGeocoder = require('node-geocoder');
const logger = require('../utils/logger');

/**
 * Geo Service - provides geospatial utilities including geocoding,
 * reverse geocoding, distance calculations, and more
 */
class GeoService {
    constructor() {
        // Initialize geocoder with provider specified in environment variables
        const geocoderOptions = {
            provider: process.env.GEOCODER_PROVIDER || 'openstreetmap',
            formatter: null
        };

        if (geocoderOptions.provider !== 'openstreetmap') {
            geocoderOptions.apiKey = process.env.GEOCODER_API_KEY;
            geocoderOptions.httpAdapter = 'https';
        }

        this.geocoder = NodeGeocoder(geocoderOptions);


        // Default map provider URL for static maps
        this.mapProviderUrl = 'https://maps.googleapis.com/maps/api/staticmap';
    }

    /**
     * Geocode an address to latitude and longitude
     * @param {string} address - The address to geocode
     * @returns {Promise} - Location data including coordinates
     */
    async geocodeAddress(address) {
        try {
            const results = await this.geocoder.geocode(address);

            if (results && results.length > 0) {
                return {
                    success: true,
                    coordinates: [results[0].latitude, results[0].longitude],
                    formattedAddress: results[0].formattedAddress,
                    city: results[0].city,
                    state: results[0].state,
                    zipCode: results[0].zipcode,
                    country: results[0].countryCode
                };
            } else {
                return {
                    success: false,
                    error: 'Address not found'
                };
            }
        } catch (err) {
            logger.error(`Geocoding error: ${err.message}`);
            return {
                success: false,
                error: err.message
            };
        }
    }

    /**
     * Reverse geocode coordinates to an address
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Promise} - Address data
     */
    async reverseGeocode(lat, lng) {
        try {
            const results = await this.geocoder.reverse({ lat, lon: lng });

            if (results && results.length > 0) {
                return {
                    success: true,
                    address: results[0].formattedAddress,
                    streetName: results[0].streetName,
                    city: results[0].city,
                    state: results[0].state,
                    zipCode: results[0].zipcode,
                    country: results[0].countryCode
                };
            } else {
                return {
                    success: false,
                    error: 'No address found for these coordinates'
                };
            }
        } catch (err) {
            logger.error(`Reverse geocoding error: ${err.message}`);
            return {
                success: false,
                error: err.message
            };
        }
    }

    /**
     * Calculate distance between two coordinate points in kilometers
     * @param {number} lat1 - Latitude of point 1
     * @param {number} lon1 - Longitude of point 1
     * @param {number} lat2 - Latitude of point 2
     * @param {number} lon2 - Longitude of point 2
     * @returns {number} - Distance in kilometers
     */
    getDistanceInKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance;
    }

    /**
     * Convert degrees to radians
     * @param {number} deg - Degrees
     * @returns {number} - Radians
     */
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    /**
     * Generate a static map URL with markers
     * @param {Object} options - Map options
     * @param {Array} options.center - Center coordinates [lat, lng]
     * @param {number} options.zoom - Zoom level (1-20)
     * @param {Array} options.markers - Array of marker objects {lat, lng, label, color}
     * @returns {string} - Static map URL
     */
    getStaticMapUrl(options) {
        const {
            center = [0, 0],
            zoom = 13,
            size = '600x400',
            markers = []
        } = options;

        let url = `${this.mapProviderUrl}?center=${center[0]},${center[1]}&zoom=${zoom}&size=${size}&key=${process.env.MAPS_API_KEY}`;

        // Add markers to the map
        markers.forEach(marker => {
            url += `&markers=color:${marker.color || 'red'}|label:${marker.label || ''}|${marker.lat},${marker.lng}`;
        });

        return url;
    }

    /**
     * Check if point is within polygon
     * @param {Array} point - [lat, lng] coordinates of point
     * @param {Array} polygon - Array of [lat, lng] coordinates forming polygon
     * @returns {boolean} - Whether point is in polygon
     */
    isPointInPolygon(point, polygon) {
        const x = point[0];
        const y = point[1];

        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];

            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    }
}

module.exports = new GeoService();
