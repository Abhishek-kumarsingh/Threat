const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: [true, 'Action is required'],
        enum: ['create', 'update', 'delete', 'login', 'logout', 'view', 'export', 'import', 'other']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['user', 'sensor', 'alert', 'threat-zone', 'system', 'authentication', 'other']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    resourceType: {
        type: String,
        required: false
    },
    ipAddress: {
        type: String,
        required: false
    },
    userAgent: {
        type: String,
        required: false
    },
    metadata: {
        type: Object,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ category: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);