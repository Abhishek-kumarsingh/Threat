const express = require('express');
const {
    getDashboardSummary,
    getUserDashboard,
    getRecentActivity,
    getLocationOverview
} = require('../controllers/dashboardController');

const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get main dashboard summary - available to all authenticated users
router.get('/', getDashboardSummary);

// Get user-specific dashboard data
router.get('/user', getUserDashboard);

// Get recent activity
router.get('/activity', getRecentActivity);

// Get location overview - requires location ID parameter
router.get('/locations/:id', getLocationOverview);

// Export router
module.exports = router;