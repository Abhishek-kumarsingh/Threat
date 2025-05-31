/**
 * Notification configuration
 * Contains settings for notification behavior and thresholds
 */

module.exports = {
    // Default notification expiration time in seconds (24 hours)
    defaultExpiration: 86400,
    
    // Notification throttling per user (to avoid spamming)
    throttling: {
      // Minimum time between email notifications in seconds
      emailInterval: 300, // 5 minutes
      
      // Minimum time between SMS notifications in seconds
      smsInterval: 600, // 10 minutes
      
      // Minimum time between web push notifications in seconds
      webPushInterval: 60, // 1 minute
      
      // Maximum notifications per user per hour
      maxPerHour: {
        email: 5,
        sms: 3,
        webPush: 10
      }
    },
    
    // Alert threshold mappings
    // Maps alert severities to notification thresholds
    alertThresholds: {
      info: {
        requireUserAction: false,
        sendEmail: false,
        sendSMS: false,
        sendWebPush: true
      },
      warning: {
        requireUserAction: false,
        sendEmail: true,
        sendSMS: false,
        sendWebPush: true
      },
      danger: {
        requireUserAction: true,
        sendEmail: true,
        sendSMS: true,
        sendWebPush: true
      },
      critical: {
        requireUserAction: true,
        sendEmail: true,
        sendSMS: true,
        sendWebPush: true,
        repeatInterval: 1800 // Repeat every 30 minutes until acknowledged
      },
      emergency: {
        requireUserAction: true,
        sendEmail: true,
        sendSMS: true,
        sendWebPush: true,
        repeatInterval: 900 // Repeat every 15 minutes until acknowledged
      }
    },
    
    // Threat level mappings
    // Maps threat levels to notification settings
    threatLevelThresholds: {
      minimal: {
        requireUserAction: false,
        sendEmail: false,
        sendSMS: false,
        sendWebPush: false
      },
      low: {
        requireUserAction: false,
        sendEmail: false,
        sendSMS: false,
        sendWebPush: true
      },
      moderate: {
        requireUserAction: false,
        sendEmail: true,
        sendSMS: false,
        sendWebPush: true
      },
      high: {
        requireUserAction: true,
        sendEmail: true,
        sendSMS: true,
        sendWebPush: true
      },
      critical: {
        requireUserAction: true,
        sendEmail: true,
        sendSMS: true,
        sendWebPush: true,
        repeatInterval: 1800 // Repeat every 30 minutes until acknowledged
      }
    },
    
    // Templates for different notification types
    templates: {
      email: {
        alert: 'alert',
        threatZone: 'threatZone',
        sensorWarning: 'sensorWarning',
        systemUpdate: 'systemUpdate'
      },
      sms: {
        alert: '[{severity}] {title}: {message}',
        threatZone: 'THREAT ZONE: {level} at {location}. Check app for details.',
        sensorWarning: 'SENSOR WARNING: {sensorName} at {location} - {status}',
        systemUpdate: 'SYSTEM UPDATE: {message}'
      }
    }
  };
  