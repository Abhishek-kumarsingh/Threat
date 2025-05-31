const webpush = require('web-push');
const logger = require('../utils/logger');

/**
 * Web Push service for sending push notifications to browsers
 */
class WebPushService {
    constructor() {
        // Initialize web-push if VAPID keys are available
        if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
            webpush.setVapidDetails(
                process.env.VAPID_SUBJECT || 'mailto:admin@threatzones.com',
                process.env.VAPID_PUBLIC_KEY,
                process.env.VAPID_PRIVATE_KEY
            );
            this.enabled = true;
            this.publicKey = process.env.VAPID_PUBLIC_KEY;
        } else {
            logger.warn('VAPID keys not found. Web Push service is disabled.');
            this.enabled = false;
        }
    }

    /**
     * Get public VAPID key
     * @returns {string} - Public VAPID key
     */
    getPublicKey() {
        return this.publicKey;
    }

    /**
     * Send notification
     * @param {Object} subscription - Push subscription object
     * @param {string} payload - JSON string payload
     * @returns {Promise} - Notification sending result
     */
    async sendNotification(subscription, payload) {
        if (!this.enabled) {
            logger.warn('Web Push service is disabled. Notification not sent.');
            return {
                success: false,
                message: 'Web Push service is disabled'
            };
        }

        try {
            // Validate subscription
            if (!subscription || !subscription.endpoint) {
                throw new Error('Invalid subscription object');
            }

            // Send notification
            const result = await webpush.sendNotification(subscription, payload);

            logger.info(`Web Push notification sent: ${result.statusCode}`);
            return {
                success: true,
                statusCode: result.statusCode
            };
        } catch (err) {
            logger.error(`Error sending Web Push notification: ${err.message}`);

            // Check if subscription is expired or invalid
            if (err.statusCode === 404 || err.statusCode === 410) {
                return {
                    success: false,
                    error: 'Subscription expired',
                    expired: true
                };
            }

            return {
                success: false,
                error: err.message
            };
        }
    }

    /**
     * Send alert notification
     * @param {Object} subscription - Push subscription object
     * @param {Object} alert - Alert data
     * @returns {Promise} - Notification sending result
     */
    async sendAlertNotification(subscription, alert) {
        const payload = JSON.stringify({
            title: `[${alert.severity.toUpperCase()}] ${alert.title}`,
            body: alert.message,
            icon: `/assets/icons/alert-${alert.severity}.png`,
            badge: '/assets/icons/badge.png',
            data: {
                url: `/alerts/${alert._id}`,
                alertId: alert._id,
                severity: alert.severity,
                timestamp: alert.createdAt
            },
            actions: [
                {
                    action: 'view',
                    title: 'View Details'
                }
            ]
        });

        return await this.sendNotification(subscription, payload);
    }

    /**
     * Send threat zone notification
     * @param {Object} subscription - Push subscription object
     * @param {Object} threatZone - Threat zone data
     * @param {Object} location - Location data
     * @returns {Promise} - Notification sending result
     */
    async sendThreatZoneNotification(subscription, threatZone, location) {
        const payload = JSON.stringify({
            title: `Threat Zone Update`,
            body: `${threatZone.prediction.level.toUpperCase()} threat level detected at ${location.name}`,
            icon: `/assets/icons/threat-${threatZone.prediction.level}.png`,
            badge: '/assets/icons/badge.png',
            data: {
                url: `/threat-zones/${threatZone._id}`,
                threatZoneId: threatZone._id,
                level: threatZone.prediction.level,
                locationId: location._id,
                timestamp: threatZone.timestamp
            },
            actions: [
                {
                    action: 'view',
                    title: 'View Map'
                }
            ]
        });

        return await this.sendNotification(subscription, payload);
    }
}

module.exports = new WebPushService();
