const Location = require('../models/Location');
const Sensor = require('../models/Sensor');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all locations
// @route   GET /api/locations
// @access  Private
exports.getLocations = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get single location
// @route   GET /api/locations/:id
// @access  Private
exports.getLocation = asyncHandler(async (req, res, next) => {
    const location = await Location.findById(req.params.id);

    if (!location) {
        return next(new ErrorResponse(`Location not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: location
    });
});

// @desc    Create location
// @route   POST /api/locations
// @access  Private/Admin
exports.createLocation = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    const location = await Location.create(req.body);

    res.status(201).json({
        success: true,
        data: location
    });
});

// @desc    Update location
// @route   PUT /api/locations/:id
// @access  Private/Admin
exports.updateLocation = asyncHandler(async (req, res, next) => {
    let location = await Location.findById(req.params.id);

    if (!location) {
        return next(new ErrorResponse(`Location not found with id of ${req.params.id}`, 404));
    }

    location = await Location.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: location
    });
});

// @desc    Delete location
// @route   DELETE /api/locations/:id
// @access  Private/Admin
exports.deleteLocation = asyncHandler(async (req, res, next) => {
    const location = await Location.findById(req.params.id);

    if (!location) {
        return next(new ErrorResponse(`Location not found with id of ${req.params.id}`, 404));
    }

    // Check if location has any sensors
    const sensors = await Sensor.find({ location: req.params.id });

    if (sensors.length > 0) {
        return next(new ErrorResponse(`Cannot delete location. Please delete or reassign its ${sensors.length} sensors first.`, 400));
    }

    await location.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get sensors for a location
// @route   GET /api/locations/:id/sensors
// @access  Private
exports.getLocationSensors = asyncHandler(async (req, res, next) => {
    const location = await Location.findById(req.params.id);

    if (!location) {
        return next(new ErrorResponse(`Location not found with id of ${req.params.id}`, 404));
    }

    const sensors = await Sensor.find({ location: req.params.id });

    res.status(200).json({
        success: true,
        count: sensors.length,
        data: sensors
    });
});

// @desc    Get emergency contacts for a location
// @route   GET /api/locations/:id/emergency-contacts
// @access  Private
exports.getEmergencyContacts = asyncHandler(async (req, res, next) => {
    const location = await Location.findById(req.params.id);

    if (!location) {
        return next(new ErrorResponse(`Location not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: location.emergencyContacts || []
    });
});

// @desc    Update emergency contacts for a location
// @route   PUT /api/locations/:id/emergency-contacts
// @access  Private/Admin
exports.updateEmergencyContacts = asyncHandler(async (req, res, next) => {
    let location = await Location.findById(req.params.id);

    if (!location) {
        return next(new ErrorResponse(`Location not found with id of ${req.params.id}`, 404));
    }

    location = await Location.findByIdAndUpdate(
        req.params.id,
        { emergencyContacts: req.body },
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        success: true,
        data: location.emergencyContacts
    });
});
