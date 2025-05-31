const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Alert = require('../models/Alert');
const Location = require('../models/Location');

describe('Alert Endpoints', () => {
    let adminToken;
    let userToken;
    let locationId;
    let adminUserId;

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

        adminUserId = admin._id;

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
        // Clear alerts before each test
        await Alert.deleteMany({});
    });

    afterAll(async () => {
        // Clean up and disconnect
        await User.deleteMany({});
        await Location.deleteMany({});
        await mongoose.connection.close();
    });

    // Test creating alert
    describe('POST /api/alerts', () => {
        it('should create new alert when admin is authenticated', async () => {
            const alertData = {
                title: 'Test Alert',
                message: 'This is a test alert',
                severity: 'warning',
                type: 'manual',
                location: locationId,
                actions: ['Follow evacuation procedures', 'Report to muster point']
            };

            const response = await request(app)
                .post('/api/alerts')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(alertData);

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('title', 'Test Alert');
            expect(response.body.data).toHaveProperty('severity', 'warning');
        });

        it('should not allow regular users to create alerts', async () => {
            const alertData = {
                title: 'Test Alert',
                message: 'This is a test alert',
                severity: 'warning',
                type: 'manual',
                location: locationId
            };

            const response = await request(app)
                .post('/api/alerts')
                .set('Authorization', `Bearer ${userToken}`)
                .send(alertData);

            expect(response.statusCode).toBe(403);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    // Test getting alerts
    describe('GET /api/alerts', () => {
        beforeEach(async () => {
            // Create test alerts
            await Alert.create([
                {
                    title: 'Test Alert 1',
                    message: 'This is test alert 1',
                    severity: 'warning',
                    type: 'manual',
                    status: 'active',
                    source: 'manual',
                    location: locationId,
                    createdBy: adminUserId
                },
                {
                    title: 'Test Alert 2',
                    message: 'This is test alert 2',
                    severity: 'danger',
                    type: 'automatic',
                    status: 'active',
                    source: 'sensor',
                    location: locationId,
                    createdBy: adminUserId
                }
            ]);
        });

        it('should get all alerts when authenticated', async () => {
            const response = await request(app)
                .get('/api/alerts')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data).toHaveLength(2);
        });
    });

    // Test acknowledging alert
    describe('PUT /api/alerts/:id/acknowledge', () => {
        let alertId;

        beforeEach(async () => {
            // Create test alert
            const alert = await Alert.create({
                title: 'Acknowledge Test Alert',
                message: 'This is an alert to acknowledge',
                severity: 'warning',
                type: 'manual',
                status: 'active',
                source: 'manual',
                location: locationId,
                createdBy: adminUserId
            });

            alertId = alert._id;
        });

        it('should acknowledge an alert', async () => {
            const response = await request(app)
                .put(`/api/alerts/${alertId}/acknowledge`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('status', 'acknowledged');
            expect(response.body.data.acknowledgedBy).toBeInstanceOf(Array);
            expect(response.body.data.acknowledgedBy.length).toBe(1);
        });
    });
});
