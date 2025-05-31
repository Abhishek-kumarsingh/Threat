const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/User');
const Location = require('./models/Location');
const Sensor = require('./models/Sensor');
const SensorReading = require('./models/SensorReading');
const ThreatZone = require('./models/ThreatZone');
const Alert = require('./models/Alert');
const Notification = require('./models/Notification');

require('dotenv').config();

// Connect DB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
};

// Sample Users
const users = [
    {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        password: 'Password123',
        phoneNumber: '+1234567890',
        preferences: {
            emailNotifications: true,
            smsNotifications: false,
            webNotifications: true,
            alertThreshold: 'high'
        }
    },
    {
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'supervisor',
        password: 'Password123',
        phoneNumber: '+9876543210',
        preferences: {
            emailNotifications: true,
            smsNotifications: true,
            webNotifications: true,
            alertThreshold: 'medium'
        }
    }
];

// Sample Locations (with dummy coordinates to satisfy Mongoose validation)
const locations = [
    {
        name: 'Downtown Fire Station',
        description: 'Central emergency HQ',
        address: '123 Main St, Los Angeles, CA',
        locationType: 'refinery',
        hazardLevel: 'high',
        contactInfo: {
            name: 'Fire Chief',
            phone: '+1234567890',
            email: 'chief@firedept.org'
        },
        coordinates: [-118.2437, 34.0522]  // Placeholder for validation
    },
    {
        name: 'Northside Emergency HQ',
        description: 'Backup command center',
        address: '456 North Ave, New York, NY',
        locationType: 'storage',
        hazardLevel: 'medium',
        contactInfo: {
            name: 'Emergency Manager',
            phone: '+9876543210',
            email: 'manager@emergency.org'
        },
        coordinates: [-74.0060, 40.7128]  // Placeholder for validation
    }
];

// Sample Sensors
// Sample Sensors
const sensors = (locationIds, userId) => [
    {
        name: 'Gas Sensor A1',
        sensorId: 'SENS-A1',
        type: 'multi',
        location: locationIds[0],
        position: {
            coordinates: [-118.2437, 34.0522]
        },
        status: 'online',
        lastReading: new Date(),
        thresholds: {
            mq2: { warning: 2, danger: 5, critical: 8 },
            mq4: { warning: 2, danger: 5, critical: 8 },
            mq6: { warning: 2, danger: 5, critical: 8 },
            mq8: { warning: 2, danger: 5, critical: 8 }
        },
        manufacturer: 'FireTech Inc.',
        model: 'FT-MQX',
        serialNumber: 'SN123456',
        firmwareVersion: 'v2.0.1',
        createdBy: userId
    },
    {
        name: 'Gas Sensor B2',
        sensorId: 'SENS-B2',
        type: 'mq2',
        location: locationIds[1],
        position: {
            coordinates: [-74.0060, 40.7128]
        },
        status: 'offline',
        thresholds: {
            mq2: { warning: 2, danger: 5, critical: 8 }
        },
        manufacturer: 'AirSafe Ltd.',
        model: 'AS-MQ2',
        serialNumber: 'SN789012',
        firmwareVersion: 'v1.3.2',
        createdBy: userId
    }
];


// Sample Sensor Readings
const sensorReadings = (sensorIds) => [
    {
        sensor: sensorIds[0],
        readings: {
            mq2: 3.5,
            mq4: 2.1,
            mq6: 1.8,
            mq8: 2.7,
            temperature: 31.2,
            humidity: 45
        },
        status: 'warning',
        location: {
            coordinates: [-118.2437, 34.0522]
        },
        metadata: {
            windSpeed: 12,
            windDirection: 270,
            pressure: 1013,
            batteryLevel: 85
        }
    },
    {
        sensor: sensorIds[1],
        readings: {
            mq2: 9.1,
            mq4: 0,
            mq6: 0,
            mq8: 0,
            temperature: 33.5,
            humidity: 40
        },
        status: 'critical',
        location: {
            coordinates: [-74.0060, 40.7128]
        },
        metadata: {
            windSpeed: 10,
            windDirection: 90,
            pressure: 1010,
            batteryLevel: 30
        }
    }
];

// Sample Threat Zones
const threatZones = (locationIds) => [
    {
        location: locationIds[0],
        source: {
            coordinates: [-118.2437, 34.0522]
        },
        prediction: {
            level: 'high',
            confidence: 0.85
        },
        environmentalFactors: {
            windSpeed: 15,
            windDirection: 270,
            temperature: 32,
            humidity: 45
        },
        zones: {
            extremeDanger: {
                coordinates: [[[-118.2437, 34.0522], [-118.2447, 34.0522], [-118.2442, 34.0532], [-118.2437, 34.0522]]]
            },
            highDanger: {
                coordinates: [[[-118.2437, 34.0522], [-118.2457, 34.0522], [-118.2447, 34.0542], [-118.2437, 34.0522]]]
            },
            moderateDanger: {
                coordinates: [[[-118.2437, 34.0522], [-118.2467, 34.0522], [-118.2457, 34.0552], [-118.2437, 34.0522]]]
            },
            lowDanger: {
                coordinates: [[[-118.2437, 34.0522], [-118.2477, 34.0522], [-118.2467, 34.0562], [-118.2437, 34.0522]]]
            }
        },
        evacuationRoutes: [{
            coordinates: [[-118.2437, 34.0522], [-118.2487, 34.0572]],
            safetyLevel: 'safe'
        }],
        modelVersion: 'v1.2.3',
        createdBy: null
    }
];

// Sample Alerts
const alerts = (userIds, locationIds, threatZoneIds) => [
    {
        title: 'High Gas Level Detected',
        message: 'Sensor SENS-A1 detected a high gas level near Downtown Fire Station.',
        severity: 'danger',
        type: 'automatic',
        status: 'active',
        source: 'sensor',
        location: locationIds[0],
        affectedAreas: [{
            coordinates: [[[-118.2437, 34.0522], [-118.2447, 34.0522], [-118.2442, 34.0532], [-118.2437, 34.0522]]],
            dangerLevel: 'high'
        }],
        actions: ['Evacuate area', 'Check sensor data', 'Contact fire department'],
        createdBy: userIds[0],
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
    },
    {
        title: 'Critical Threat Zone Activated',
        message: 'A critical threat zone has been activated at Downtown Fire Station.',
        severity: 'critical',
        type: 'automatic',
        status: 'acknowledged',
        source: 'prediction',
        location: locationIds[0],
        affectedAreas: threatZoneIds.map(id => ({
            coordinates: [[[-118.2437, 34.0522], [-118.2447, 34.0522], [-118.2442, 34.0532], [-118.2437, 34.0522]]],
            dangerLevel: 'extreme'
        })),
        actions: ['Initiate evacuation', 'Deploy drones', 'Notify emergency services'],
        createdBy: userIds[0],
        acknowledgedBy: [{ user: userIds[1], timestamp: Date.now() }],
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours
    }
];

// Sample Notifications
const notifications = (userIds, sensorIds, alertIds) => [
    {
        user: userIds[0],
        title: 'New Alert: High Gas Level',
        message: 'An alert was triggered by sensor SENS-A1.',
        type: 'alert',
        priority: 'high',
        relatedTo: 'sensor',
        relatedId: sensorIds[0],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    {
        user: userIds[1],
        title: 'Critical Alert Acknowledged',
        message: 'A critical alert has been acknowledged.',
        type: 'alert',
        priority: 'critical',
        relatedTo: 'alert',
        relatedId: alertIds[0],
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
    }
];

// Hash passwords
const hashPasswords = async (users) => {
    const salt = await bcrypt.genSalt(10);
    return Promise.all(
        users.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, salt);
            return { ...user, password: hashedPassword };
        })
    );
};

// Seed function
const seedData = async () => {
    try {
        // Clear collections
        await User.deleteMany();
        await Location.deleteMany();
        await ThreatZone.deleteMany();
        await Sensor.deleteMany();
        await SensorReading.deleteMany();
        await Alert.deleteMany();
        await Notification.deleteMany();
        console.log('Existing data cleared.');

        // Insert users
        const hashedUsers = await hashPasswords(users);
        const insertedUsers = await User.insertMany(hashedUsers);
        console.log('Users seeded.');

        // Insert locations with createdBy set dynamically
        const seededLocations = locations.map(loc => ({
            ...loc,
            createdBy: insertedUsers[0]._id
        }));
        const insertedLocations = await Location.insertMany(seededLocations);
        console.log('Locations seeded.');

        // Insert sensors
        // Insert sensors
        const insertedSensors = await Sensor.insertMany(
            sensors(insertedLocations.map(loc => loc._id), insertedUsers[0]._id)
        );
        console.log('Sensors seeded.');

        // Insert sensor readings
        const insertedReadings = await SensorReading.insertMany(sensorReadings(insertedSensors.map(s => s._id)));
        console.log('Sensor readings seeded.');

        // Insert threat zones
        const insertedThreatZones = await ThreatZone.insertMany(threatZones(insertedLocations.map(loc => loc._id)).map(tz => ({
            ...tz,
            createdBy: insertedUsers[0]._id
        })));
        console.log('Threat zones seeded.');

        // Insert alerts
        const insertedAlerts = await Alert.insertMany(alerts(
            insertedUsers.map(u => u._id),
            insertedLocations.map(l => l._id),
            insertedThreatZones.map(tz => tz._id)
        ));
        console.log('Alerts seeded.');

        // Insert notifications
        const insertedNotifications = await Notification.insertMany(notifications(
            insertedUsers.map(u => u._id),
            insertedSensors.map(s => s._id),
            insertedAlerts.map(a => a._id)
        ));
        console.log('Notifications seeded.');

    } catch (err) {
        console.error('Error seeding data:', err);
    } finally {
        mongoose.connection.close();
    }
};

// Run script
(async () => {
    await connectDB();
    await seedData();
})();