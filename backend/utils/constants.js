/**
 * Application constants
 */

/**
 * User roles and permissions
 */
exports.ROLES = {
    ADMIN: 'admin',
    SUPERVISOR: 'supervisor',
    USER: 'user'
};

/**
 * Permission levels for different roles
 */
exports.PERMISSIONS = {
    admin: [
        'manage_users',
        'manage_locations',
        'manage_sensors',
        'create_alerts',
        'manage_alerts',
        'view_all_data',
        'run_predictions',
        'manage_system',
        'view_reports',
        'export_data',
        'manage_backups'
    ],
    supervisor: [
        'manage_sensors',
        'create_alerts',
        'manage_alerts',
        'view_assigned_data',
        'run_predictions',
        'view_reports'
    ],
    user: [
        'view_assigned_data',
        'acknowledge_alerts',
        'view_reports'
    ]
};

/**
 * Alert severity levels with descriptions
 */
exports.ALERT_SEVERITIES = {
    info: {
        name: 'Information',
        description: 'Non-critical information that requires attention',
        color: '#3498db'
    },
    warning: {
        name: 'Warning',
        description: 'Potential issue that may require monitoring',
        color: '#f39c12'
    },
    danger: {
        name: 'Danger',
        description: 'Serious issue requiring immediate attention',
        color: '#e74c3c'
    },
    critical: {
        name: 'Critical',
        description: 'Severe issue with risk of damage or injury',
        color: '#c0392b'
    },
    emergency: {
        name: 'Emergency',
        description: 'Extreme situation requiring evacuation procedures',
        color: '#7b241c'
    }
};

/**
 * Threat prediction levels with descriptions
 */
exports.THREAT_LEVELS = {
    minimal: {
        name: 'Minimal',
        description: 'Normal operating conditions with no significant risk',
        color: '#3498db'
    },
    low: {
        name: 'Low',
        description: 'Slightly elevated risk, monitoring recommended',
        color: '#2ecc71'
    },
    moderate: {
        name: 'Moderate',
        description: 'Elevated risk requiring careful monitoring and preparation',
        color: '#f39c12'
    },
    high: {
        name: 'High',
        description: 'High risk with potential for significant danger',
        color: '#e74c3c'
    },
    critical: {
        name: 'Critical',
        description: 'Extreme risk requiring immediate emergency procedures',
        color: '#c0392b'
    }
};

/**
 * Sensor status codes with descriptions
 */
exports.SENSOR_STATUSES = {
    online: {
        name: 'Online',
        description: 'Sensor is operational and reporting normal readings',
        color: '#2ecc71'
    },
    offline: {
        name: 'Offline',
        description: 'Sensor is not connected or not responding',
        color: '#95a5a6'
    },
    warning: {
        name: 'Warning',
        description: 'Sensor is reporting elevated readings',
        color: '#f39c12'
    },
    danger: {
        name: 'Danger',
        description: 'Sensor is reporting high readings above safety thresholds',
        color: '#e74c3c'
    },
    critical: {
        name: 'Critical',
        description: 'Sensor is reporting critical readings requiring immediate action',
        color: '#c0392b'
    },
    maintenance: {
        name: 'Maintenance',
        description: 'Sensor is under maintenance or calibration',
        color: '#3498db'
    }
};

/**
 * Location types with descriptions
 */
exports.LOCATION_TYPES = {
    refinery: 'Oil Refinery',
    storage: 'Storage Facility',
    pipeline: 'Pipeline Installation',
    processing: 'Processing Plant',
    other: 'Other Installation'
};

/**
 * Sensor types with descriptions
 */
exports.SENSOR_TYPES = {
    mq2: {
        name: 'MQ2',
        description: 'Combustible Gas Sensor',
        detects: ['LPG', 'Propane', 'Hydrogen', 'Methane', 'Smoke']
    },
    mq4: {
        name: 'MQ4',
        description: 'Methane Gas Sensor',
        detects: ['Methane', 'CNG']
    },
    mq6: {
        name: 'MQ6',
        description: 'LPG Gas Sensor',
        detects: ['LPG', 'Butane']
    },
    mq8: {
        name: 'MQ8',
        description: 'Hydrogen Gas Sensor',
        detects: ['Hydrogen']
    },
    dht11: {
        name: 'DHT11',
        description: 'Temperature & Humidity Sensor',
        detects: ['Temperature', 'Humidity']
    },
    multi: {
        name: 'Multi-Sensor',
        description: 'Multiple Gas & Environmental Sensors',
        detects: ['Multiple Gases', 'Temperature', 'Humidity']
    },
    other: {
        name: 'Other',
        description: 'Custom or Specialized Sensor',
        detects: ['Various']
    }
};

/**
 * Default sensor thresholds
 */
exports.DEFAULT_THRESHOLDS = {
    mq2: {
        warning: 2.0,
        danger: 5.0,
        critical: 8.0
    },
    mq4: {
        warning: 2.0,
        danger: 5.0,
        critical: 8.0
    },
    mq6: {
        warning: 2.0,
        danger: 5.0,
        critical: 8.0
    },
    mq8: {
        warning: 2.0,
        danger: 5.0,
        critical: 8.0
    }
};

/**
 * Pagination defaults
 */
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
};

/**
 * API rate limits (requests per time window)
 */
exports.RATE_LIMITS = {
    auth: {
        window: 15 * 60 * 1000, // 15 minutes
        max: 10 // 10 attempts
    },
    standard: {
        window: 10 * 60 * 1000, // 10 minutes
        max: 100 // 100 requests
    },
    highVolume: {
        window: 60 * 1000, // 1 minute
        max: 60 // 60 requests
    }
};

/**
 * Notification types
 */
exports.NOTIFICATION_TYPES = {
    ALERT: 'alert',
    INFO: 'info',
    WARNING: 'warning',
    SUCCESS: 'success'
};

/**
 * Notification priorities
 */
exports.NOTIFICATION_PRIORITIES = {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    CRITICAL: 'critical'
};

/**
 * Application settings defaults
 */
exports.DEFAULT_SETTINGS = {
    notificationExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
    dataRetention: 90 * 24 * 60 * 60 * 1000, // 90 days
    backupFrequency: 24 * 60 * 60 * 1000, // Daily
    mapDefaultCenter: [20.5937, 78.9629], // India center
    mapDefaultZoom: 5
};

/**
 * HTTP status codes with descriptions
 */
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

/**
 * Common error types
 */
exports.ERROR_TYPES = {
    VALIDATION: 'ValidationError',
    AUTHENTICATION: 'AuthenticationError',
    AUTHORIZATION: 'AuthorizationError',
    NOT_FOUND: 'NotFoundError',
    INTERNAL: 'InternalError',
    EXTERNAL_SERVICE: 'ExternalServiceError',
    DATABASE: 'DatabaseError',
    NETWORK: 'NetworkError'
};

/**
 * Gas thresholds in ppm (parts per million)
 * Based on OSHA and similar safety standards
 */
exports.GAS_THRESHOLDS = {
    methane: {
        warning: 1000,  // 0.1% or 1000 ppm
        danger: 5000,   // 0.5% or 5000 ppm (10% of LEL)
        critical: 20000 // 2.0% or 20000 ppm (40% of LEL)
    },
    propane: {
        warning: 500,   // 0.05% or 500 ppm
        danger: 2100,   // 0.21% or 2100 ppm (10% of LEL)
        critical: 8400  // 0.84% or 8400 ppm (40% of LEL)
    },
    hydrogen: {
        warning: 400,   // 0.04% or 400 ppm
        danger: 4000,   // 0.4% or 4000 ppm (10% of LEL)
        critical: 16000 // 1.6% or 16000 ppm (40% of LEL)
    },
    lpg: {
        warning: 500,   // 0.05% or 500 ppm
        danger: 1800,   // 0.18% or 1800 ppm (10% of LEL)
        critical: 7200  // 0.72% or 7200 ppm (40% of LEL)
    }
};
