/**
 * Data formatting utilities for consistent display across the application
 */

/**
 * Format date to ISO string
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
exports.formatDate = (date) => {
    if (!date) return null;

    const d = new Date(date);
    return d.toISOString();
};

/**
 * Format date to localized string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date string
 */
exports.formatLocalDate = (date, options = {}) => {
    if (!date) return null;

    const d = new Date(date);
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };

    return d.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @param {number} decimals - Decimal places
 * @returns {string} - Formatted number
 */
exports.formatNumber = (num, decimals = 0) => {
    if (num === null || num === undefined || isNaN(num)) {
        return '';
    }

    return Number(num).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} - Formatted currency string
 */
exports.formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '';
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(amount);
};

/**
 * Format file size to human readable format
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Decimal places
 * @returns {string} - Formatted file size
 */
exports.formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Format elapsed time in human readable form
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} - Formatted time string
 */
exports.formatElapsedTime = (milliseconds) => {
    if (milliseconds < 1000) {
        return `${milliseconds}ms`;
    } else if (milliseconds < 60000) {
        return `${(milliseconds / 1000).toFixed(1)}s`;
    } else if (milliseconds < 3600000) {
        return `${Math.floor(milliseconds / 60000)}m ${Math.floor((milliseconds % 60000) / 1000)}s`;
    } else {
        return `${Math.floor(milliseconds / 3600000)}h ${Math.floor((milliseconds % 3600000) / 60000)}m`;
    }
};

/**
 * Format time ago (relative time)
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted relative time
 */
exports.formatTimeAgo = (date) => {
    if (!date) return null;

    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
        return `${interval} years ago`;
    }
    if (interval === 1) {
        return '1 year ago';
    }

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return `${interval} months ago`;
    }
    if (interval === 1) {
        return '1 month ago';
    }

    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return `${interval} days ago`;
    }
    if (interval === 1) {
        return '1 day ago';
    }

    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return `${interval} hours ago`;
    }
    if (interval === 1) {
        return '1 hour ago';
    }

    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return `${interval} minutes ago`;
    }
    if (interval === 1) {
        return '1 minute ago';
    }

    if (seconds < 10) {
        return 'just now';
    }

    return `${Math.floor(seconds)} seconds ago`;
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @param {string} suffix - Suffix to add when truncated
 * @returns {string} - Truncated text
 */
exports.truncateText = (text, length = 100, suffix = '...') => {
    if (!text || text.length <= length) {
        return text;
    }

    return text.substring(0, length - suffix.length) + suffix;
};

/**
 * Format coordinates to string
 * @param {Array} coordinates - [latitude, longitude] array
 * @param {boolean} includeLabels - Whether to include labels
 * @returns {string} - Formatted coordinates
 */
exports.formatCoordinates = (coordinates, includeLabels = true) => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
        return '';
    }

    const [lat, lng] = coordinates;

    if (includeLabels) {
        return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    } else {
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
};

/**
 * Format sensor status for display
 * @param {string} status - Status code
 * @returns {Object} - Formatted status with text and class
 */
exports.formatSensorStatus = (status) => {
    switch (status) {
        case 'online':
            return { text: 'Online', class: 'status-online', icon: 'check-circle' };
        case 'offline':
            return { text: 'Offline', class: 'status-offline', icon: 'times-circle' };
        case 'warning':
            return { text: 'Warning', class: 'status-warning', icon: 'exclamation-circle' };
        case 'critical':
            return { text: 'Critical', class: 'status-critical', icon: 'exclamation-triangle' };
        case 'maintenance':
            return { text: 'Maintenance', class: 'status-maintenance', icon: 'tools' };
        default:
            return { text: 'Unknown', class: 'status-unknown', icon: 'question-circle' };
    }
};

/**
 * Format alert severity for display
 * @param {string} severity - Severity code
 * @returns {Object} - Formatted severity with text and class
 */
exports.formatAlertSeverity = (severity) => {
    switch (severity) {
        case 'info':
            return { text: 'Information', class: 'severity-info', icon: 'info-circle' };
        case 'warning':
            return { text: 'Warning', class: 'severity-warning', icon: 'exclamation-circle' };
        case 'danger':
            return { text: 'Danger', class: 'severity-danger', icon: 'exclamation-triangle' };
        case 'critical':
            return { text: 'Critical', class: 'severity-critical', icon: 'radiation' };
        case 'emergency':
            return { text: 'Emergency', class: 'severity-emergency', icon: 'skull-crossbones' };
        default:
            return { text: 'Unknown', class: 'severity-unknown', icon: 'question-circle' };
    }
};