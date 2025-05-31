const twilio = require('twilio');
const logger = require('../utils/logger');

/**
 * SMS service for sending text messages
 */
class SmsService {
    constructor() {
        // Initialize Twilio client if credentials are available
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
            this.phoneNumber = process.env.TWILIO_PHONE_NUMBER;
            this.enabled = true;
        } else {
            logger.warn('Twilio credentials not found. SMS service is disabled.');
            this.enabled = false;
        }
    }

    /**
     * Send SMS message
     * @param {string} to - Recipient phone number
     * @param {string} body - Message content
     * @returns {Promise} - SMS sending result
     */
    async sendSMS(to, body) {
        if (!this.enabled) {
            logger.warn('SMS service is disabled. Message not sent.');
            return {
                success: false,
                message: 'SMS service is disabled'
            };
        }

        try {
            // Validate phone number format
            if (!this.isValidPhoneNumber(to)) {
                throw new Error(`Invalid phone number format: ${to}`);
            }

            // Send message using Twilio
            const message = await this.client.messages.create({
                body,
                from: this.phoneNumber,
                to
            });

            logger.info(`SMS sent to ${to}: ${message.sid}`);
            return {
                success: true,
                sid: message.sid,
                status: message.status
            };
        } catch (err) {
            logger.error(`Error sending SMS: ${err.message}`);
            return {
                success: false,
                error: err.message
            };
        }
    }

    /**
     * Send alert notification SMS
     * @param {string} phoneNumber - Recipient phone number
     * @param {Object} alert - Alert data
     * @returns {Promise} - SMS sending result
     */
    async sendAlertSMS(phoneNumber, alert) {
        // Create concise message for SMS
        const message =
            `${alert.severity.toUpperCase()} ALERT: ${alert.title}\n` +
            `Location: ${alert.location?.name || 'Unknown'}\n` +
            `${alert.message}\n\n` +
            `See app for details.`;

        return await this.sendSMS(phoneNumber, message);
    }

    /**
     * Send threat zone notification SMS
     * @param {string} phoneNumber - Recipient phone number
     * @param {Object} threatZone - Threat zone data
     * @param {Object} location - Location data
     * @returns {Promise} - SMS sending result
     */
    async sendThreatZoneSMS(phoneNumber, threatZone, location) {
        // Create concise message for SMS
        const message =
            `THREAT ZONE UPDATE: ${threatZone.prediction.level.toUpperCase()} level\n` +
            `Location: ${location.name}\n` +
            `Time: ${new Date(threatZone.timestamp).toLocaleString()}\n\n` +
            `Check app for evacuation routes and further instructions.`;

        return await this.sendSMS(phoneNumber, message);
    }

    /**
     * Validate phone number format
     * @param {string} phoneNumber - Phone number to validate
     * @returns {boolean} - Whether the phone number is valid
     */
    isValidPhoneNumber(phoneNumber) {
        // Basic validation: must start with + and contain 10-15 digits
        const phoneRegex = /^\+?[1-9]\d{9,14}$/;
        return phoneRegex.test(phoneNumber);
    }
}

module.exports = new SmsService();
