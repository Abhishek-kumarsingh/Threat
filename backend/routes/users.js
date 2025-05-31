const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getUserNotifications,
    assignLocations,
    getUserLocations,
    updateUserPreferences
} = require('../controllers/userController');

const User = require('../models/User');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const { registerValidation } = require('../middleware/validation');

const router = express.Router();

// Protect all routes
router.use(protect);

// Admin only routes
router.use(authorize('admin'));

router
    .route('/')
    .get(advancedResults(User), getUsers)
    .post(registerValidation, createUser);

router
    .route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

router
    .route('/:id/notifications')
    .get(getUserNotifications);

router
    .route('/:id/locations')
    .get(getUserLocations)
    .put(assignLocations);

router
    .route('/:id/preferences')
    .put(updateUserPreferences);

module.exports = router;