/**
 * Utility functions for data formatting
 */

/**
 * Format a date to a string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string ('short', 'medium', 'long', 'full')
 * @returns {string} - Formatted date string
 */
exports.formatDate = (date, format = 'medium') => {
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
    }

    const options = {
        short: {
            year: 'numeric', month: 'numeric', day: 'numeric'
        },
        medium: {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        },
        long: {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        },
        full: {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            timeZoneName: 'short'
        }
    };

    return dateObj.toLocaleString('en-US', options[format] || options.medium);
};

/**
 * Format a number with specified precision
 * @param {number} number - Number to format
 * @param {number} precision - Number of decimal places
 * @returns {string} - Formatted number string
 */
exports.formatNumber = (number, precision = 2) => {
    return Number.isFinite(number)
        ? number.toFixed(precision)
        : 'Invalid Number';
};

/**
 * Format a geographic coordinate pair
 * @param {number[]} coordinates - [latitude, longitude] pair
 * @param {string} format - Format string ('dms', 'decimal')
 * @returns {string} - Formatted coordinates string
 */
exports.formatCoordinates = (coordinates, format = 'decimal') => {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        return 'Invalid Coordinates';
    }

    const [latitude, longitude] = coordinates;

    if (format === 'dms') {
        return `${this.decimalToDMS(latitude, 'lat')}, ${this.decimalToDMS(longitude, 'lon')}`;
    } else {
        return `${latitude.toFixed(6)}°, ${longitude.toFixed(6)}°`;
    }
};

/**
 * Convert decimal degrees to degrees, minutes, seconds
 * @param {number} decimal - Decimal degrees
 * @param {string} type - 'lat' for latitude, 'lon' for longitude
 * @returns {string} - DMS format string
 */
exports.decimalToDMS = (decimal, type) => {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutes = Math.floor((absolute - degrees) * 60);
    const seconds = ((absolute - degrees - minutes / 60) * 3600).toFixed(2);

    const direction = type === 'lat'
        ? (decimal >= 0 ? 'N' : 'S')
        : (decimal >= 0 ? 'E' : 'W');

    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
};

/**
 * Format a file size in bytes to a human-readable string
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Decimal places
 * @returns {string} - Formatted size string
 */
exports.formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Format an alert severity level with color and icon
 * @param {string} severity - Alert severity ('info', 'warning', 'danger', 'critical', 'emergency')
 * @returns {Object} - Formatted severity object with display name, color, and icon name
 */
exports.formatAlertSeverity = (severity) => {
    const severityMap = {
        info: {
            display: 'Information',
            color: 'blue',
            icon: 'info-circle'
        },
        warning: {
            display: 'Warning',
            color: 'orange',
            icon: 'exclamation-triangle'
        },
        danger: {
            display: 'Danger',
            color: 'red',
            icon: 'radiation'
        },
        critical: {
            display: 'Critical',
            color: 'darkred',
            icon: 'skull-crossbones'
        },
        emergency: {
            display: 'Emergency',
            color: 'black',
            icon: 'biohazard'
        }
    };

    return severityMap[severity] || {
        display: severity.charAt(0).toUpperCase() + severity.slice(1),
        color: 'gray',
        icon: 'question-circle'
    };
};

/**
 * Format a duration in seconds to a human-readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration string
 */
exports.formatDuration = (seconds) => {
    if (!Number.isFinite(seconds)) {
        return 'Invalid Duration';
    }

    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const parts = [];

    if (days > 0) {
        parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    }

    if (hours > 0) {
        parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    }

    if (minutes > 0) {
        parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
    }

    if (remainingSeconds > 0 || parts.length === 0) {
        parts.push(`${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`);
    }

    return parts.join(', ');
};

/**
 * Format a JSON object to a prettified string
 * @param {Object} obj - Object to format
 * @returns {string} - Prettified JSON string
 */
exports.formatJSON = (obj) => {
    try {
        return JSON.stringify(obj, null, 2);
    } catch (err) {
        return 'Invalid JSON';
    }
};
