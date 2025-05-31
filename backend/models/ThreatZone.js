const mongoose = require('mongoose');

const ThreatZoneSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    location: {
        type: mongoose.Schema.ObjectId,
        ref: 'Location',
        required: true
    },
    source: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true,
            index: '2dsphere'
        }
    },
    prediction: {
        level: {
            type: String,
            enum: ['minimal', 'low', 'moderate', 'high', 'critical'],
            required: true
        },
        confidence: {
            type: Number,
            required: true,
            min: 0,
            max: 1
        },
        rawValue: Number
    },
    environmentalFactors: {
        windSpeed: {
            type: Number,
            min: 0
        },
        windDirection: {
            type: Number,
            min: 0,
            max: 360
        },
        temperature: Number,
        humidity: {
            type: Number,
            min: 0,
            max: 100
        },
        pressure: Number
    },
    zones: {
        extremeDanger: {
            type: {
                type: String,
                enum: ['Polygon'],
                default: 'Polygon'
            },
            coordinates: {
                type: [[[Number]]],
                required: true
            }
        },
        highDanger: {
            type: {
                type: String,
                enum: ['Polygon'],
                default: 'Polygon'
            },
            coordinates: {
                type: [[[Number]]],
                required: true
            }
        },
        moderateDanger: {
            type: {
                type: String,
                enum: ['Polygon'],
                default: 'Polygon'
            },
            coordinates: {
                type: [[[Number]]],
                required: true
            }
        },
        lowDanger: {
            type: {
                type: String,
                enum: ['Polygon'],
                default: 'Polygon'
            },
            coordinates: {
                type: [[[Number]]],
                required: true
            }
        }
    },
    evacuationRoutes: [{
        type: {
            type: String,
            enum: ['LineString'],
            default: 'LineString'
        },
        coordinates: {
            type: [[Number]],
            required: true
        },
        safetyLevel: {
            type: String,
            enum: ['safe', 'caution', 'riskyButNecessary'],
            default: 'safe'
        },
        estimatedTimeMinutes: Number
    }],
    triggeredAlerts: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Alert'
    }],
    modelVersion: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiration: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
});

// Create index for fast time-based queries
ThreatZoneSchema.index({ timestamp: -1 });

// Create index for location-based queries
ThreatZoneSchema.index({ location: 1, timestamp: -1 });

// Create index for active threat zones
ThreatZoneSchema.index({ isActive: 1, timestamp: -1 });

// Static method to get current active threat zone for a location
ThreatZoneSchema.statics.getCurrentThreatZone = async function (locationId) {
    return await this.findOne({
        location: locationId,
        isActive: true
    }).sort({ timestamp: -1 });
};

// Static method to get all active threat zones
ThreatZoneSchema.statics.getAllActiveThreatZones = async function () {
    return await this.find({
        isActive: true
    })
        .sort({ timestamp: -1 })
        .populate('location', 'name address coordinates');
};

// Method to deactivate threat zone
ThreatZoneSchema.methods.deactivate = async function () {
    this.isActive = false;
    return await this.save();
};

module.exports = mongoose.model('ThreatZone', ThreatZoneSchema);
