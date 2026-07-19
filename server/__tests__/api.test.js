const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-test-jwt-secret-test-jwt-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-test-refresh-secret-test';
const app = require('../app');
const User = require('../models/User');
const Event = require('../models/Event');

describe('Auth API Tests', () => {
    beforeAll(async () => {
        // Connect to test database
        const testDbUri = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/festifyxr-test';
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(testDbUri);
        }
    });

    afterAll(async () => {
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe('POST /api/auth/signup', () => {
        it('should create a new user', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'test123',
                    role: 'participant'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.user).toHaveProperty('email', 'test@example.com');
            expect(res.body).toHaveProperty('tokens');
            expect(res.body.tokens).toHaveProperty('accessToken');
        });

        it('should fail with invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Test User',
                    email: 'invalid-email',
                    password: 'test123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should fail with duplicate email', async () => {
            await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Test User',
                    email: 'duplicate@example.com',
                    password: 'test123'
                });

            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Another User',
                    email: 'duplicate@example.com',
                    password: 'test456'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe('Email already registered');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/auth/signup')
                .send({
                    name: 'Test User',
                    email: 'login@example.com',
                    password: 'test123'
                });
        });

        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'test123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('tokens');
            expect(res.body.tokens).toHaveProperty('accessToken');
        });

        it('should fail with wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.error).toBe('Invalid email or password');
        });

        it('should fail with non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'test123'
                });

            expect(res.statusCode).toBe(401);
        });
    });
});

describe('Events API Tests', () => {
    let token;
    let adminToken;

    beforeAll(async () => {
        const testDbUri = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/festifyxr-test';
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(testDbUri);
        }

        await User.deleteMany({});

        await User.create({
            name: 'Admin User',
            email: 'admin@test.com',
            password: await bcrypt.hash('admin123', 12),
            role: 'admin'
        });

        // Create a regular user
        await request(app)
            .post('/api/auth/signup')
            .send({
                name: 'Regular User',
                email: 'user@test.com',
                password: 'test123',
                role: 'participant'
            });

        const userLoginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'user@test.com',
                password: 'test123'
            });

        token = userLoginRes.body.tokens.accessToken;

        // Create an admin user
        const adminRes = await request(app)
            .post('/api/auth/signup')
            .send({
                name: 'Admin User',
                email: 'admin@test.com',
                password: 'admin123',
                role: 'admin'
            });

        expect(adminRes.statusCode).toBe(403);

        const adminLoginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@test.com',
                password: 'admin123'
            });

        adminToken = adminLoginRes.body.tokens.accessToken;
    });

    afterAll(async () => {
        await Event.deleteMany({});
        await User.deleteMany({});
    });

    beforeEach(async () => {
        await Event.deleteMany({});
    });

    describe('GET /api/events', () => {
        it('should get all events', async () => {
            await Event.create({
                title: 'Test Event',
                time: 'Today 8:00 PM',
                venue: 'Main Stage',
                tag: 'music',
                points: 15,
                desc: 'Test description'
            });

            const res = await request(app)
                .get('/api/events')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('POST /api/events', () => {
        it('should create event as admin', async () => {
            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'New Event',
                    time: 'Tomorrow 9:00 PM',
                    venue: 'Test Venue',
                    tag: 'tech',
                    points: 20,
                    desc: 'New event description'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('title', 'New Event');
        });

        it('should fail to create event as regular user', async () => {
            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'New Event',
                    time: 'Tomorrow 9:00 PM',
                    venue: 'Test Venue',
                    tag: 'tech',
                    points: 20,
                    desc: 'New event description'
                });

            expect(res.statusCode).toBe(403);
        });

        it('should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/events')
                .send({
                    title: 'New Event',
                    time: 'Tomorrow 9:00 PM',
                    venue: 'Test Venue',
                    tag: 'tech',
                    points: 20,
                    desc: 'New event description'
                });

            expect(res.statusCode).toBe(401);
        });
    });
});
