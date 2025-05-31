const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

describe('Authentication Endpoints', () => {
    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGO_URI_TEST, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    beforeEach(async () => {
        // Clear users collection before each test
        await User.deleteMany({});
    });

    afterAll(async () => {
        // Disconnect from test database
        await mongoose.connection.close();
    });

    // Test user registration
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'user'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('token');
        });

        it('should not allow duplicate email registration', async () => {
            // Create a user first
            await User.create({
                name: 'Existing User',
                email: 'test@example.com',
                password: 'password123',
                role: 'user'
            });

            // Try to register with same email
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'user'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('success', false);
        });

        it('should not allow registering as admin', async () => {
            const userData = {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'admin'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    // Test user login
    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user
            const user = new User({
                name: 'Test User',
                email: 'test@example.com',
                role: 'user'
            });

            // Set password
            user.password = 'password123';

            await user.save();
        });

        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('token');
        });

        it('should not login with incorrect email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'wrong@example.com',
                    password: 'password123'
                });

            expect(response.statusCode).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });

        it('should not login with incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(response.statusCode).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    // Test getting current user
    describe('GET /api/auth/me', () => {
        let token;

        beforeEach(async () => {
            // Create a test user
            const user = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'user'
            });

            // Get token
            token = user.getSignedJwtToken();
        });

        it('should get current user when authenticated', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('name', 'Test User');
            expect(response.body.data).toHaveProperty('email', 'test@example.com');
            expect(response.body.data).toHaveProperty('role', 'user');
            expect(response.body.data).not.toHaveProperty('password');
        });

        it('should not allow access without token', async () => {
            const response = await request(app).get('/api/auth/me');

            expect(response.statusCode).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });
    });
});
