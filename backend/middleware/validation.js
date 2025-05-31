const { validationResult, check } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Process validation results and return errors if any
 */
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ErrorResponse(errors.array()[0].msg, 400));
    }
    next();
};

/**
 * User registration validation rules
 */
exports.registerValidation = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('role', 'Role must be valid').optional().isIn(['user', 'supervisor']),
    this.validate
];

/**
 * User login validation rules
 */
exports.loginValidation = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    this.validate
];

/**
 * Sensor creation validation rules
 */
exports.sensorValidation = [
    check('name', 'Name is required').not().isEmpty(),
    check('sensorId', 'Sensor ID is required').not().isEmpty(),
    check('location', 'Location ID is required').isMongoId(),
    check('type', 'Type must be valid').optional().isIn(['mq2', 'mq4', 'mq6', 'mq8', 'dht11', 'multi', 'other']),
    check('position.coordinates', 'Coordinates must be valid').isArray().isLength({ min: 2, max: 2 }),
    check('position.coordinates.0', 'Latitude must be valid').isFloat({ min: -90, max: 90 }),
    check('position.coordinates.1', 'Longitude must be valid').isFloat({ min: -180, max: 180 }),
    this.validate
];

/**
 * Sensor reading validation rules
 */
exports.sensorReadingValidation = [
    check('readings.mq2', 'MQ2 reading must be valid').optional().isFloat({ min: 0 }),
    check('readings.mq4', 'MQ4 reading must be valid').optional().isFloat({ min: 0 }),
    check('readings.mq6', 'MQ6 reading must be valid').optional().isFloat({ min: 0 }),
    check('readings.mq8', 'MQ8 reading must be valid').optional().isFloat({ min: 0 }),
    check('readings.temperature', 'Temperature must be valid').optional().isFloat(),
    check('readings.humidity', 'Humidity must be valid').optional().isFloat({ min: 0, max: 100 }),
    check('location.coordinates', 'Coordinates must be valid').isArray().isLength({ min: 2, max: 2 }),
    check('location.coordinates.0', 'Latitude must be valid').isFloat({ min: -90, max: 90 }),
    check('location.coordinates.1', 'Longitude must be valid').isFloat({ min: -180, max: 180 }),
    this.validate
];

/**
 * Alert creation validation rules
 */
exports.alertValidation = [
    check('title', 'Title is required').not().isEmpty().isLength({ max: 100 }),
    check('message', 'Message is required').not().isEmpty().isLength({ max: 500 }),
    check('severity', 'Severity must be valid').isIn(['info', 'warning', 'danger', 'critical', 'emergency']),
    check('location', 'Location ID is required').isMongoId(),
    this.validate
];

/**
 * Location creation validation rules
 */
exports.locationValidation = [
    check('name', 'Name is required').not().isEmpty().isLength({ max: 50 }),
    check('address', 'Address is required').not().isEmpty(),
    check('coordinates', 'Coordinates must be valid').optional().isArray().isLength({ min: 2, max: 2 }),
    check('coordinates.0', 'Latitude must be valid').optional().isFloat({ min: -90, max: 90 }),
    check('coordinates.1', 'Longitude must be valid').optional().isFloat({ min: -180, max: 180 }),
    check('locationType', 'Location type must be valid').optional().isIn(['refinery', 'storage', 'pipeline', 'processing', 'other']),
    this.validate
];

/**
 * ID validation rule
 */
exports.idValidation = [
    check('id', 'ID must be valid').isMongoId(),
    this.validate
];

/**
 * MongoDB ObjectID parameter validation
 */
exports.validateObjectId = (paramName) => [
    check(paramName, `${paramName} must be a valid MongoDB ObjectID`).isMongoId(),
    this.validate
];
