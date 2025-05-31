const mongoose = require('mongoose');
const geocoder = require('../utils/geocoder');

const LocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    coordinates: {
        // GeoJSON Point
        type: [Number],
        required: true,
        index: '2dsphere'
    },
    formattedAddress: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
    locationType: {
        type: String,
        enum: ['refinery', 'storage', 'pipeline', 'processing', 'other'],
        default: 'other'
    },
    capacity: {
        type: Number, // Capacity in metric tons or appropriate unit
        min: [0, 'Capacity must be at least 0']
    },
    hazardLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'extreme'],
        default: 'medium'
    },
    contactInfo: {
        name: String,
        phone: String,
        email: String
    },
    emergencyContacts: [{
        name: String,
        role: String,
        phone: String,
        email: String
    }],
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

// Geocode & create location field
LocationSchema.pre('save', async function (next) {
    // If coordinates are already provided, skip geocoding
    if (this.coordinates && this.coordinates.length === 2) {
        return next();
    }

    try {
        const loc = await geocoder.geocode(this.address);
        this.coordinates = [
            loc[0].latitude,
            loc[0].longitude
        ];
        this.formattedAddress = loc[0].formattedAddress;
        this.street = loc[0].streetName;
        this.city = loc[0].city;
        this.state = loc[0].stateCode;
        this.zipcode = loc[0].zipcode;
        this.country = loc[0].countryCode;
    } catch (err) {
        console.error('Geocoding error:', err);
    }

    next();
});

// Reverse populate with sensors
LocationSchema.virtual('sensors', {
    ref: 'Sensor',
    localField: '_id',
    foreignField: 'location',
    justOne: false
});

// Get sensors for a location
LocationSchema.statics.getSensors = async function (locationId) {
    return await this.model('Sensor').find({ location: locationId });
};

module.exports = mongoose.model('Location', LocationSchema);
