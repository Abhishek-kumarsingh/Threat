const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add an alert title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Please add an alert message'],
        maxlength: [500, 'Message cannot be more than 500 characters']
    },
    severity: {
        type: String,
        enum: ['info', 'warning', 'danger', 'critical', 'emergency'],
        default: 'warning',
        required: true
    },
    type: {
        type: String,
        enum: ['automatic', 'manual', 'test', 'drill'],
        default: 'automatic',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'acknowledged', 'resolved', 'expired'],
        default: 'active'
    },
    source: {
        type: String,
        enum: ['sensor', 'prediction', 'manual', 'system'],
        default: 'system',
        required: true
    },
    location: {
        type: mongoose.Schema.ObjectId,
        ref: 'Location',
        required: true
    },
    affectedAreas: [{
        type: {
            type: String,
            enum: ['Point', 'Polygon'],
            default: 'Polygon'
        },
        coordinates: {
            type: [[[Number]]],
            required: true
        },
        dangerLevel: {
            type: String,
            enum: ['low', 'moderate', 'high', 'extreme'],
            default: 'moderate'
        }
    }],
    actions: {
        type: [String],
        default: []
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    acknowledgedBy: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    resolvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    resolvedAt: {
        type: Date
    },
    notificationsSent: {
        email: {
            count: { type: Number, default: 0 },
            timestamps: [Date]
        },
        sms: {
            count: { type: Number, default: 0 },
            timestamps: [Date]
        },
        web: {
            count: { type: Number, default: 0 },
            timestamps: [Date]
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date
    }
});

// Create index for fast time-based queries
AlertSchema.index({ createdAt: -1 });

// Create index for location-based queries
AlertSchema.index({ location: 1, createdAt: -1 });

// Create index for status-based queries
AlertSchema.index({ status: 1, createdAt: -1 });

// Static method to get active alerts
AlertSchema.statics.getActiveAlerts = async function () {
    return await this.find({
        status: { $in: ['active', 'acknowledged'] }
    })
        .sort({ createdAt: -1 })
        .populate('location', 'name address coordinates')
        .populate('createdBy', 'name');
};

// Static method to get alerts by severity
AlertSchema.statics.getAlertsBySeverity = async function (severity) {
    return await this.find({
        severity,
        status: { $in: ['active', 'acknowledged'] }
    })
        .sort({ createdAt: -1 })
        .populate('location', 'name address coordinates')
        .populate('createdBy', 'name');
};

// Method to acknowledge alert
AlertSchema.methods.acknowledge = async function (userId) {
    // Check if already acknowledged by this user
    const alreadyAcknowledged = this.acknowledgedBy.some(
        ack => ack.user.toString() === userId.toString()
    );

    if (!alreadyAcknowledged) {
        this.acknowledgedBy.push({
            user: userId,
            timestamp: Date.now()
        });
    }

    this.status = 'acknowledged';
    return await this.save();
};

// Method to resolve alert
AlertSchema.methods.resolve = async function (userId) {
    this.status = 'resolved';
    this.resolvedBy = userId;
    this.resolvedAt = Date.now();
    return await this.save();
};

module.exports = mongoose.model('Alert', AlertSchema);
