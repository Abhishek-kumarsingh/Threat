const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a notification title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Please add a notification message'],
        maxlength: [500, 'Message cannot be more than 500 characters']
    },
    type: {
        type: String,
        enum: ['alert', 'info', 'warning', 'success'],
        default: 'info'
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'critical'],
        default: 'normal'
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    relatedTo: {
        type: String,
        enum: ['alert', 'sensor', 'threatZone', 'system', 'user', 'other'],
        default: 'other'
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date
    }
});

// Create indexes for efficiency
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, expiresAt: 1 });

// Mark notification as read
NotificationSchema.methods.markAsRead = async function () {
    this.read = true;
    this.readAt = Date.now();
    return await this.save();
};

// Static method to get unread notifications for a user
NotificationSchema.statics.getUnreadNotifications = async function (userId) {
    return await this.find({
        user: userId,
        read: false,
        $or: [
            { expiresAt: { $gt: Date.now() } },
            { expiresAt: null }
        ]
    })
        .sort({ createdAt: -1 });
};

// Delete expired notifications
NotificationSchema.statics.deleteExpired = async function () {
    const now = new Date();
    const result = await this.deleteMany({
        expiresAt: { $lt: now }
    });
    return result;
};

module.exports = mongoose.model('Notification', NotificationSchema);
