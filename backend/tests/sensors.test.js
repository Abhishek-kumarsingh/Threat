const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Sensor = require('../models/Sensor');
const Location = require('../models/Location');

describe('Sensor Endpoints', () => {
    let adminToken;
    let userToken;
    let locationId;

    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGO_URI_TEST, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Create test users
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin'
        });

        const user = await User.create({
            name: 'Regular User',
            email: 'user@example.com',
            password: 'password123',
            role: 'user'
        });

        // Get tokens
        adminToken = admin.getSignedJwtToken();
        userToken = user.getSignedJwtToken();

        // Create test location
        const location = await Location.create({
            name: 'Test Refinery',
            address: '123 Test St, Test City',
            coordinates: [28.6139, 77.2090],
            locationType: 'refinery',
            createdBy: admin._id
        });

        locationId = location._id;
    });

    beforeEach(async () => {
        // Clear sensors before each test
        await Sensor.deleteMany({});
    });

    afterAll(async () => {
        // Clean up and disconnect
        await User.deleteMany({});
        await Location.deleteMany({});
        await mongoose.connection.close();
    });

    // Test getting sensors
    describe('GET /api/sensors', () => {
        beforeEach(async () => {
            // Create test sensors
            await Sensor.create([
                {
                    name: 'Test Sensor 1',
                    sensorId: 'SENSOR-001',
                    type: 'mq2',
                    location: locationId,
                    position: {
                        coordinates: [28.6139, 77.2090]
                    },
                    status: 'online',
                    createdBy: mongoose.Types.ObjectId()
                },
                {
                    name: 'Test Sensor 2',
                    sensorId: 'SENSOR-002',
                    type: 'mq4',
                    location: locationId,
                    position: {
                        coordinates: [28.6150, 77.2100]
                    },
                    status: 'offline',
                    createdBy: mongoose.Types.ObjectId()
                }
            ]);
        });

        it('should get all sensors when admin is authenticated', async () => {
            const response = await request(app)
                .get('/api/sensors')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data).toHaveLength(2);
        });

        it('should limit access for non-admin users', async () => {
            const response = await request(app)
                .get('/api/sensors')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.statusCode).toBe(200);
            // Regular users can still view sensors, but might have limited results
        });

        it('should not allow access without authentication', async () => {
            const response = await request(app).get('/api/sensors');

            expect(response.statusCode).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    // Test creating sensor
    describe('POST /api/sensors', () => {
        it('should create new sensor when admin is authenticated', async () => {
            const sensorData = {
                name: 'New Test Sensor',
                sensorId: 'SENSOR-003',
                type: 'multi',
                location: locationId,
                position: {
                    coordinates: [28.6160, 77.2110]
                }
            };

            const response = await request(app)
                .post('/api/sensors')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(sensorData);

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('name', 'New Test Sensor');
            expect(response.body.data).toHaveProperty('sensorId', 'SENSOR-003');
        });

        it('should not allow regular users to create sensors', async () => {
            const sensorData = {
                name: 'New Test Sensor',
                sensorId: 'SENSOR-003',
                type: 'multi',
                location: locationId,
                position: {
                    coordinates: [28.6160, 77.2110]
                }
            };

            const response = await request(app)
                .post('/api/sensors')
                .set('Authorization', `Bearer ${userToken}`)
                .send(sensorData);

            expect(response.statusCode).toBe(403);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    // Test sensor readings
    describe('POST /api/sensors/:id/readings', () => {
        let sensorId;

        beforeEach(async () => {
            // Create a test sensor
            const sensor = await Sensor.create({
                name: 'Reading Test Sensor',
                sensorId: 'SENSOR-READ-001',
                type: 'multi',
                location: locationId,
                position: {
                    coordinates: [28.6139, 77.2090]
                },
                status: 'online',
                createdBy: mongoose.Types.ObjectId()
            });

            sensorId = sensor._id;
        });

        it('should add new sensor reading', async () => {
            const readingData = {
                readings: {
                    mq2: 1.2,
                    mq4: 0.8,
                    mq6: 0.5,
                    mq8: 0.3,
                    temperature: 25.5,
                    humidity: 65.2
                },
                location: {
                    coordinates: [28.6139, 77.2090]
                }
            };

            const response = await request(app)
                .post(`/api/sensors/${sensorId}/readings`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(readingData);

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('sensor', sensorId.toString());
            expect(response.body.data).toHaveProperty('readings');
            expect(response.body.data.readings).toHaveProperty('mq2', 1.2);
        });
    });
});
