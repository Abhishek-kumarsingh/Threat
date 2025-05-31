const User = require('../models/User');
const webPushService = require('./webPushService');
const emailService = require('./emailService');
const smsService = require('./smsService');
const logger = require('../utils/logger');

/**
 * Send notifications to users about a new alert
 * @param {Object} alert - The alert document
 */
exports.notifyAboutAlert = async (alert) => {
    try {
        // Get users to notify based on location and severity
        const users = await User.find({
            $or: [
                { assignedLocations: alert.location },
                { role: { $in: ['admin', 'supervisor'] } }
            ]
        });

        // Define severity level rankings
        const severityLevels = {
            'info': 0,
            'warning': 1,
            'danger': 2,
            'critical': 3,
            'emergency': 4
        };

        // Get alert severity level
        const alertSeverityLevel = severityLevels[alert.severity] || 0;

        // Process each user
        for (const user of users) {
            // Get user threshold level
            const userThresholdLevel = severityLevels[user.preferences.alertThreshold] || 0;

            // Only send if alert severity is at or above user's threshold
            if (alertSeverityLevel >= userThresholdLevel) {
                await this.sendAlertNotifications(user, alert);
            }
        }
    } catch (err) {
        logger.error(`Error in notifyAboutAlert: ${err.message}`);
    }
};

/**
 * Send alert notifications to a specific user
 * @param {Object} user - The user document
 * @param {Object} alert - The alert document
 */
exports.sendAlertNotifications = async (user, alert) => {
    try {
        const promises = [];

        // Send email notification if enabled
        if (user.preferences.emailNotifications) {
            promises.push(this.sendEmailNotification(user, alert));
        }

        // Send SMS notification if enabled and phone number available
        if (user.preferences.smsNotifications && user.phoneNumber) {
            promises.push(this.sendSMSNotification(user, alert));
        }

        // Send web push notification if enabled and subscription available
        if (user.preferences.webNotifications && user.webPushSubscription) {
            promises.push(this.sendWebPushNotification(user, alert));
        }

        await Promise.all(promises);
    } catch (err) {
        logger.error(`Error in sendAlertNotifications: ${err.message}`);
    }
};

/**
 * Send email notification
 * @param {Object} user - The user document
 * @param {Object} alert - The alert document
 */
exports.sendEmailNotification = async (user, alert) => {
    try {
        const emailData = {
            email: user.email,
            subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
            template: 'alert',
            data: {
                name: user.name,
                alert: {
                    title: alert.title,
                    message: alert.message,
                    severity: alert.severity,
                    timestamp: alert.createdAt,
                    location: alert.location,
                    actions: alert.actions
                }
            }
        };

        await emailService.sendEmail(emailData);
        logger.info(`Email notification sent to ${user.email} for alert ${alert._id}`);
        return true;
    } catch (err) {
        logger.error(`Error sending email notification: ${err.message}`);
        return false;
    }
};

/**
 * Send SMS notification
 * @param {Object} user - The user document
 * @param {Object} alert - The alert document
 */
exports.sendSMSNotification = async (user, alert) => {
    try {
        const message = `[${alert.severity.toUpperCase()}] ${alert.title}: ${alert.message}`;
        await smsService.sendSMS(user.phoneNumber, message);
        logger.info(`SMS notification sent to ${user.phoneNumber} for alert ${alert._id}`);
        return true;
    } catch (err) {
        logger.error(`Error sending SMS notification: ${err.message}`);
        return false;
    }
};

/**
 * Send web push notification
 * @param {Object} user - The user document
 * @param {Object} alert - The alert document
 */
exports.sendWebPushNotification = async (user, alert) => {
    try {
        const payload = JSON.stringify({
            title: `[${alert.severity.toUpperCase()}] ${alert.title}`,
            message: alert.message,
            icon: `/assets/icons/severity-${alert.severity}.png`,
            badge: '/assets/icons/badge.png',
            data: {
                alertId: alert._id.toString(),
                url: `/alerts/${alert._id}`,
                timestamp: alert.createdAt,
                severity: alert.severity
            }
        });

        await webPushService.sendNotification(user.webPushSubscription, payload);
        logger.info(`Web push notification sent to user ${user._id} for alert ${alert._id}`);
        return true;
    } catch (err) {
        logger.error(`Error sending web push notification: ${err.message}`);
        return false;
    }
};

/**
 * Send notifications about threat zone updates
 * @param {Object} threatZone - The threat zone document
 */
exports.notifyAboutThreatZone = async (threatZone) => {
    try {
        // Only notify if threat level is above minimal
        if (threatZone.prediction.level === 'minimal') {
            return;
        }

        // Get users to notify based on location
        const users = await User.find({
            $or: [
                { assignedLocations: threatZone.location },
                { role: { $in: ['admin', 'supervisor'] } }
            ]
        });

        // Define threat level rankings
        const threatLevels = {
            'minimal': 0,
            'low': 1,
            'moderate': 2,
            'high': 3,
            'critical': 4
        };

        // Get threat level
        const currentThreatLevel = threatLevels[threatZone.prediction.level] || 0;

        // Process each user
        for (const user of users) {
            // Convert user threshold from alert severity to threat level
            let userThresholdLevel;
            switch (user.preferences.alertThreshold) {
                case 'low':
                    userThresholdLevel = 1; // low threat
                    break;
                case 'medium':
                    userThresholdLevel = 2; // moderate threat
                    break;
                case 'high':
                    userThresholdLevel = 3; // high threat
                    break;
                case 'critical':
                    userThresholdLevel = 4; // critical threat
                    break;
                default:
                    userThresholdLevel = 2; // default to moderate
            }

            // Only send if threat level is at or above user's threshold
            if (currentThreatLevel >= userThresholdLevel) {
                await this.sendThreatZoneNotifications(user, threatZone);
            }
        }
    } catch (err) {
        logger.error(`Error in notifyAboutThreatZone: ${err.message}`);
    }
};

/**
 * Send threat zone notifications to a specific user
 * @param {Object} user - The user document
 * @param {Object} threatZone - The threat zone document
 */
exports.sendThreatZoneNotifications = async (user, threatZone) => {
    try {
        const promises = [];

        // Get location name
        const location = await mongoose.model('Location').findById(threatZone.location);
        const locationName = location ? location.name : 'Unknown Location';

        // Send email notification if enabled
        if (user.preferences.emailNotifications) {
            const emailData = {
                email: user.email,
                subject: `Threat Zone Update: ${threatZone.prediction.level.toUpperCase()} level at ${locationName}`,
                template: 'threatZone',
                data: {
                    name: user.name,
                    threatZone: {
                        level: threatZone.prediction.level,
                        location: locationName,
                        timestamp: threatZone.timestamp
                    }
                }
            };

            promises.push(emailService.sendEmail(emailData));
        }

        // Send SMS notification if enabled and phone number available
        if (user.preferences.smsNotifications && user.phoneNumber) {
            const message = `Threat Zone Update: ${threatZone.prediction.level.toUpperCase()} threat level detected at ${locationName}. Check app for evacuation routes.`;
            promises.push(smsService.sendSMS(user.phoneNumber, message));
        }

        // Send web push notification if enabled and subscription available
        if (user.preferences.webNotifications && user.webPushSubscription) {
            const payload = JSON.stringify({
                title: `Threat Zone Update`,
                message: `${threatZone.prediction.level.toUpperCase()} threat level detected at ${locationName}`,
                icon: `/assets/icons/threat-${threatZone.prediction.level}.png`,
                badge: '/assets/icons/badge.png',
                data: {
                    threatZoneId: threatZone._id.toString(),
                    url: `/threat-zones/${threatZone._id}`,
                    timestamp: threatZone.timestamp,
                    level: threatZone.prediction.level
                }
            });

            promises.push(webPushService.sendNotification(user.webPushSubscription, payload));
        }

        await Promise.all(promises);
    } catch (err) {
        logger.error(`Error in sendThreatZoneNotifications: ${err.message}`);
    }
};
