const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-test-jwt-secret-test-jwt-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-test-refresh-secret-test';

const app = require('../app');
const User = require('../models/User');
const HostRequest = require('../models/HostRequest');

describe('Host Request API Tests', () => {
    let adminToken;

    beforeAll(async () => {
        const testDbUri = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/festifyxr-test';
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(testDbUri);
        }

        await HostRequest.syncIndexes();
    });

    beforeEach(async () => {
        await HostRequest.deleteMany({});
        await User.deleteMany({});

        await User.create({
            name: 'Admin User',
            email: 'admin@test.com',
            password: await bcrypt.hash('admin123', 12),
            role: 'admin'
        });

        const adminLoginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@test.com',
                password: 'admin123'
            });

        adminToken = adminLoginRes.body.tokens.accessToken;
    });

    afterAll(async () => {
        await HostRequest.deleteMany({});
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    const submitHostRequest = (email) => request(app)
        .post('/api/auth/signup')
        .send({
            name: 'Host Candidate',
            email,
            password: 'host123',
            role: 'host'
        });

    it('allows a new user to submit a host request', async () => {
        const res = await submitHostRequest('new-host@example.com');

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Host signup request submitted. Awaiting admin approval.');

        const pending = await HostRequest.findOne({ email: 'new-host@example.com', status: 'pending' });
        expect(pending).toBeTruthy();
    });

    it('blocks an active host from submitting another request', async () => {
        await User.create({
            name: 'Active Host',
            email: 'active-host@example.com',
            password: await bcrypt.hash('host123', 12),
            role: 'host'
        });

        const res = await submitHostRequest('active-host@example.com');

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Active host already exists for this email');
    });

    it('blocks a pending host request duplicate', async () => {
        await HostRequest.create({
            name: 'Pending Host',
            email: 'pending-host@example.com',
            password: await bcrypt.hash('host123', 12),
            status: 'pending'
        });

        const res = await submitHostRequest('pending-host@example.com');

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe('Host request already exists for this email');
    });

    it('allows a deleted host to submit again', async () => {
        await User.create({
            name: 'Deleted Host',
            email: 'deleted-host@example.com',
            password: await bcrypt.hash('host123', 12),
            role: 'host'
        });

        await User.deleteOne({ email: 'deleted-host@example.com' });

        const res = await submitHostRequest('deleted-host@example.com');

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it('allows a rejected host request to submit again', async () => {
        await HostRequest.create({
            name: 'Rejected Host',
            email: 'rejected-host@example.com',
            password: await bcrypt.hash('host123', 12),
            status: 'rejected'
        });

        const res = await submitHostRequest('rejected-host@example.com');

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it('promotes an existing participant to host on approval', async () => {
        await request(app)
            .post('/api/auth/signup')
            .send({
                name: 'Participant User',
                email: 'participant-host@example.com',
                password: 'participant123',
                role: 'participant'
            });

        const hostRequestRes = await submitHostRequest('participant-host@example.com');
        expect(hostRequestRes.statusCode).toBe(201);

        const createdRequest = await HostRequest.findOne({ email: 'participant-host@example.com', status: 'pending' });
        expect(createdRequest).toBeTruthy();

        const approveRes = await request(app)
            .post(`/api/auth/host-requests/${createdRequest._id}/approve`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(approveRes.statusCode).toBe(200);
        expect(approveRes.body.user).toHaveProperty('role', 'host');

        const updatedUser = await User.findOne({ email: 'participant-host@example.com' });
        expect(updatedUser.role).toBe('host');
    });

    it('allows a revoked host to submit again after being removed from active hosts', async () => {
        await request(app)
            .post('/api/auth/signup')
            .send({
                name: 'Revoked Host',
                email: 'revoked-host@example.com',
                password: 'participant123',
                role: 'participant'
            });

        const hostRequestRes = await submitHostRequest('revoked-host@example.com');
        expect(hostRequestRes.statusCode).toBe(201);

        const approvedRequest = await HostRequest.findOne({ email: 'revoked-host@example.com', status: 'pending' });
        await request(app)
            .post(`/api/auth/host-requests/${approvedRequest._id}/approve`)
            .set('Authorization', `Bearer ${adminToken}`);

        await User.updateOne({ email: 'revoked-host@example.com' }, { $set: { role: 'participant' } });

        const res = await submitHostRequest('revoked-host@example.com');

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
    });

    it('keeps duplicate active requests impossible', async () => {
        const firstRes = await submitHostRequest('duplicate-host@example.com');
        expect(firstRes.statusCode).toBe(201);

        const secondRes = await submitHostRequest('duplicate-host@example.com');

        expect(secondRes.statusCode).toBe(400);
        expect(secondRes.body.error).toBe('Host request already exists for this email');
    });
});