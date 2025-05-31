const mongoose = require('mongoose');

const SensorReadingSchema = new mongoose.Schema({
    sensor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Sensor',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    readings: {
        mq2: {
            type: Number,
            required: true,
            min: 0
        },
        mq4: {
            type: Number,
            required: true,
            min: 0
        },
        mq6: {
            type: Number,
            required: true,
            min: 0
        },
        mq8: {
            type: Number,
            required: true,
            min: 0
        },
        temperature: {
            type: Number,
            required: true
        },
        humidity: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        }
    },
    status: {
        type: String,
        enum: ['normal', 'warning', 'danger', 'critical'],
        default: 'normal'
    },
    location: {
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
    metadata: {
        windSpeed: {
            type: Number,
            min: 0
        },
        windDirection: {
            type: Number,
            min: 0,
            max: 360
        },
        pressure: Number,
        batteryLevel: {
            type: Number,
            min: 0,
            max: 100
        }
    },
    isProcessed: {
        type: Boolean,
        default: false
    }
});

// Create index for fast time-based queries
SensorReadingSchema.index({ timestamp: -1 });

// Create compound index for sensor+timestamp queries
SensorReadingSchema.index({ sensor: 1, timestamp: -1 });

// Define a static method to get the latest readings for a single sensor
SensorReadingSchema.statics.getLatestReading = async function (sensorId) {
    return await this.findOne({ sensor: sensorId })
        .sort({ timestamp: -1 })
        .limit(1);
};

// Define a static method to get readings between dates
SensorReadingSchema.statics.getReadingsBetweenDates = async function (sensorId, startDate, endDate) {
    return await this.find({
        sensor: sensorId,
        timestamp: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ timestamp: 1 });
};

// Define a static method to get readings above threshold
SensorReadingSchema.statics.getAbnormalReadings = async function (threshold = 'warning') {
    const statusLevels = ['normal', 'warning', 'danger', 'critical'];
    const thresholdIndex = statusLevels.indexOf(threshold);

    if (thresholdIndex === -1) {
        throw new Error('Invalid threshold level');
    }

    const statuses = statusLevels.slice(thresholdIndex);

    return await this.find({
        status: { $in: statuses }
    })
        .sort({ timestamp: -1 })
        .populate('sensor', 'name location');
};

module.exports = mongoose.model('SensorReading', SensorReadingSchema);
