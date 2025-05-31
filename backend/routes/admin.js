const express = require('express');
const {
    getDashboardSummary,
    getUserStats,
    getRecentActivity,
    getSystemHealth,
    runMaintenance,
    getAuditLogs,
    createBackup
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Protect all routes and limit to admin role
router.use(protect);
router.use(authorize('admin'));
router.use(adminLimiter);

// Get admin dashboard summary
router.get('/dashboard', getDashboardSummary);

// Get user statistics
router.get('/user-stats', getUserStats);

// Get recent activity
router.get('/recent-activity', getRecentActivity);

// Get system health status
router.get('/system-health', getSystemHealth);

// Run system maintenance tasks
router.post('/maintenance', runMaintenance);

// Get audit logs
router.get('/audit-logs', getAuditLogs);

// Create system backup
router.post('/backup', createBackup);

module.exports = router;