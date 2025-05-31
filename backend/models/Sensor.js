const mongoose = require('mongoose');

const SensorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a sensor name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    sensorId: {
        type: String,
        required: [true, 'Please add a sensor ID'],
        unique: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['mq2', 'mq4', 'mq6', 'mq8', 'dht11', 'multi', 'other'],
        default: 'multi'
    },
    description: {
        type: String,
        maxlength: [200, 'Description cannot be more than 200 characters']
    },
    location: {
        type: mongoose.Schema.ObjectId,
        ref: 'Location',
        required: true
    },
    position: {
        // GeoJSON Point
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true,
            index: '2dsphere'
        },
        floor: {
            type: Number,
            default: 0
        },
        zone: String
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'warning', 'critical', 'maintenance'],
        default: 'offline'
    },
    lastReading: {
        type: Date
    },
    lastCalibration: {
        type: Date
    },
    installationDate: {
        type: Date,
        default: Date.now
    },
    nextMaintenanceDate: {
        type: Date
    },
    manufacturer: String,
    model: String,
    serialNumber: String,
    firmwareVersion: String,
    thresholds: {
        mq2: {
            warning: { type: Number, default: 2 },
            danger: { type: Number, default: 5 },
            critical: { type: Number, default: 8 }
        },
        mq4: {
            warning: { type: Number, default: 2 },
            danger: { type: Number, default: 5 },
            critical: { type: Number, default: 8 }
        },
        mq6: {
            warning: { type: Number, default: 2 },
            danger: { type: Number, default: 5 },
            critical: { type: Number, default: 8 }
        },
        mq8: {
            warning: { type: Number, default: 2 },
            danger: { type: Number, default: 5 },
            critical: { type: Number, default: 8 }
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Create index for sensorId
SensorSchema.index({ sensorId: 1 });

// Create index for location
SensorSchema.index({ location: 1 });

// Create compound index for status and location
SensorSchema.index({ status: 1, location: 1 });

// Reverse populate with readings
SensorSchema.virtual('readings', {
    ref: 'SensorReading',
    localField: '_id',
    foreignField: 'sensor',
    justOne: false
});

// Static method to get latest readings for all sensors
SensorSchema.statics.getLatestReadings = async function () {
    const sensors = await this.find();

    const latestReadings = await Promise.all(
        sensors.map(async (sensor) => {
            const reading = await mongoose.model('SensorReading')
                .findOne({ sensor: sensor._id })
                .sort({ timestamp: -1 })
                .limit(1);

            return {
                sensor,
                reading
            };
        })
    );

    return latestReadings;
};

// Static method to get sensor status statistics
SensorSchema.statics.getStatusStats = async function () {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // Format results into an object
    const formattedStats = {
        total: 0,
        online: 0,
        offline: 0,
        warning: 0,
        critical: 0,
        maintenance: 0
    };

    stats.forEach(stat => {
        formattedStats[stat._id] = stat.count;
        formattedStats.total += stat.count;
    });

    return formattedStats;
};

// Static method to find sensors that need maintenance
SensorSchema.statics.findMaintenanceDue = async function () {
    const today = new Date();

    return await this.find({
        nextMaintenanceDate: { $lte: today }
    })
        .populate('location', 'name address');
};

module.exports = mongoose.model('Sensor', SensorSchema);
