/**
 * Validation utilities for common data types
 */

/**
 * Check if string is valid email
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
exports.isValidEmail = (email) => {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
};

/**
 * Check if string is valid phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Whether phone number is valid
 */
exports.isValidPhone = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    return phoneRegex.test(phone);
};

/**
 * Check if string is valid MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} - Whether ID is valid ObjectId
 */
exports.isValidObjectId = (id) => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
};

/**
 * Check if coordinates are valid latitude and longitude
 * @param {Array} coordinates - [latitude, longitude] array
 * @returns {boolean} - Whether coordinates are valid
 */
exports.isValidCoordinates = (coordinates) => {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        return false;
    }

    const [lat, lng] = coordinates;
    return isFinite(lat) &&
        isFinite(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180;
};

/**
 * Check if value is valid numeric value
 * @param {*} value - Value to check
 * @param {Object} options - Validation options
 * @returns {boolean} - Whether value is valid number within range
 */
exports.isValidNumber = (value, options = {}) => {
    const { min, max, allowFloat = true } = options;

    // Check if value is a valid number
    if (value === null || value === undefined || isNaN(Number(value))) {
        return false;
    }

    const num = Number(value);

    // Check if integer is required
    if (!allowFloat && !Number.isInteger(num)) {
        return false;
    }

    // Check min/max constraints
    if (min !== undefined && num < min) {
        return false;
    }

    if (max !== undefined && num > max) {
        return false;
    }

    return true;
};

/**
 * Sanitize string by removing HTML and script tags
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
exports.sanitizeString = (str) => {
    if (typeof str !== 'string') {
        return '';
    }

    // Remove HTML tags and encoded entities
    return str
        .replace(/<[^>]*>/g, '')
        .replace(/&[^;]+;/g, ' ')
        .trim();
};

/**
 * Validate JSON data against a schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - Schema definition
 * @returns {Object} - Validation result with errors
 */
exports.validateSchema = (data, schema) => {
    const errors = [];

    // Check required fields
    if (schema.required) {
        schema.required.forEach(field => {
            if (data[field] === undefined || data[field] === null || data[field] === '') {
                errors.push({
                    field,
                    message: `${field} is required`
                });
            }
        });
    }

    // Check field types and constraints
    if (schema.properties) {
        Object.keys(schema.properties).forEach(field => {
            if (data[field] !== undefined) {
                const prop = schema.properties[field];

                // Type checking
                if (prop.type === 'string' && typeof data[field] !== 'string') {
                    errors.push({
                        field,
                        message: `${field} must be a string`
                    });
                }
                else if (prop.type === 'number' && typeof data[field] !== 'number') {
                    errors.push({
                        field,
                        message: `${field} must be a number`
                    });
                }
                else if (prop.type === 'boolean' && typeof data[field] !== 'boolean') {
                    errors.push({
                        field,
                        message: `${field} must be a boolean`
                    });
                }
                else if (prop.type === 'array' && !Array.isArray(data[field])) {
                    errors.push({
                        field,
                        message: `${field} must be an array`
                    });
                }

                // String constraints
                if (prop.type === 'string' && typeof data[field] === 'string') {
                    if (prop.minLength && data[field].length < prop.minLength) {
                        errors.push({
                            field,
                            message: `${field} must be at least ${prop.minLength} characters long`
                        });
                    }

                    if (prop.maxLength && data[field].length > prop.maxLength) {
                        errors.push({
                            field,
                            message: `${field} cannot be longer than ${prop.maxLength} characters`
                        });
                    }

                    if (prop.pattern && !new RegExp(prop.pattern).test(data[field])) {
                        errors.push({
                            field,
                            message: `${field} has invalid format`
                        });
                    }

                    if (prop.enum && !prop.enum.includes(data[field])) {
                        errors.push({
                            field,
                            message: `${field} must be one of: ${prop.enum.join(', ')}`
                        });
                    }
                }

                // Number constraints
                if (prop.type === 'number' && typeof data[field] === 'number') {
                    if (prop.minimum !== undefined && data[field] < prop.minimum) {
                        errors.push({
                            field,
                            message: `${field} must be at least ${prop.minimum}`
                        });
                    }

                    if (prop.maximum !== undefined && data[field] > prop.maximum) {
                        errors.push({
                            field,
                            message: `${field} cannot be greater than ${prop.maximum}`
                        });
                    }
                }

                // Array constraints
                if (prop.type === 'array' && Array.isArray(data[field])) {
                    if (prop.minItems && data[field].length < prop.minItems) {
                        errors.push({
                            field,
                            message: `${field} must contain at least ${prop.minItems} items`
                        });
                    }

                    if (prop.maxItems && data[field].length > prop.maxItems) {
                        errors.push({
                            field,
                            message: `${field} cannot contain more than ${prop.maxItems} items`
                        });
                    }
                }
            }
        });
    }

    return {
        valid: errors.length === 0,
        errors
    };
};