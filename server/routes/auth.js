const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const HostRequest = require('../models/HostRequest');
const { asyncHandler, AppError } = require('../utils/errorHandler');
const { signupValidation, loginValidation } = require('../utils/validators');
const logger = require('../utils/logger');
const { protect, adminOnly } = require('../utils/authMiddleware');

// Generate access token (short-lived: 15 minutes)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Generate refresh token (long-lived: 7 days)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Send token response helper
const sendTokenResponse = (user, res, statusCode = 200) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.status(statusCode).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      xp: user.xp,
      level: user.level
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: 900 // 15 minutes in seconds
    }
  });
};

// Signup
router.post('/signup', signupValidation, asyncHandler(async (req, res, next) => {
  const { name, email, password, role, adminPasskey } = req.body;

  // Check if JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    throw new AppError('Server configuration error', 500);
  }

  // Verify admin passkey if role is admin
  if (role === 'admin') {
    if (!adminPasskey) {
      throw new AppError('Admin passkey is required for admin accounts', 400);
    }
    const envPasskey = (process.env.ADMIN_PASSKEY || '').trim();
    if (adminPasskey !== envPasskey) {
      logger.warn('Failed admin signup attempt - invalid passkey', { email, ip: req.ip });
      throw new AppError('Invalid admin passkey', 403);
    }
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // If role is host, create a pending host request instead
  if (role === 'host') {
    // Check if host request already exists
    const existingRequest = await HostRequest.findOne({ email });
    if (existingRequest) {
      throw new AppError('Host request already exists for this email', 400);
    }

    const hostRequest = await HostRequest.create({
      name,
      email,
      password: hashedPassword
    });

    logger.info('New host signup request created', { hostRequestId: hostRequest._id, email: hostRequest.email });

    return res.status(201).json({
      success: true,
      message: 'Host signup request submitted. Awaiting admin approval.',
      hostRequest: {
        id: hostRequest._id,
        name: hostRequest.name,
        email: hostRequest.email,
        status: hostRequest.status,
        requestedAt: hostRequest.requestedAt
      }
    });
  }

  // Create user for participant or admin
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || 'participant'
  });

  logger.info('New user registered', { userId: user._id, email: user.email, role: user.role });

  sendTokenResponse(user, res, 201);
}));

// Login
router.post('/login', loginValidation, asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    throw new AppError('Server configuration error', 500);
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    logger.warn('Failed login attempt', { email, ip: req.ip });
    throw new AppError('Invalid email or password', 401);
  }

  logger.info('User logged in', { userId: user._id, email: user.email });

  sendTokenResponse(user, res);
}));

// Refresh token endpoint
router.post('/refresh-token', asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    if (decoded.type !== 'refresh') {
      throw new AppError('Invalid token type', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    logger.info('Token refreshed', { userId: user._id });

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900
      }
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.warn('Token refresh failed', { error: error.message });
    throw new AppError('Invalid or expired refresh token', 401);
  }
}));

// Verify token endpoint
router.get('/verify-token', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      xp: user.xp,
      level: user.level
    }
  });
}));

// Logout endpoint (optional, for audit logging)
router.post('/logout', protect, asyncHandler(async (req, res) => {
  logger.info('User logged out', { userId: req.user.id });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// Get all users (admin only)
router.get('/users', protect, adminOnly, asyncHandler(async (req, res) => {
  logger.info(`Admin ${req.user.id} fetching all users`);

  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 });

  logger.info(`Retrieved ${users.length} users`);
  res.json({ success: true, data: users });
}));

// Get all pending host requests (admin only)
router.get('/host-requests', protect, adminOnly, asyncHandler(async (req, res) => {
  logger.info(`Admin ${req.user.id} fetching host requests`);

  const requests = await HostRequest.find()
    .select('-password')
    .sort({ requestedAt: -1 });

  logger.info(`Retrieved ${requests.length} host requests`);
  res.json({ success: true, data: requests });
}));

// Approve host request (admin only)
router.post('/host-requests/:id/approve', protect, adminOnly, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const hostRequest = await HostRequest.findById(id);
  if (!hostRequest) {
    throw new AppError('Host request not found', 404);
  }

  if (hostRequest.status !== 'pending') {
    throw new AppError('This request has already been reviewed', 400);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: hostRequest.email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  // Create the host user
  const user = await User.create({
    name: hostRequest.name,
    email: hostRequest.email,
    password: hostRequest.password,
    role: 'host'
  });

  // Update host request status
  hostRequest.status = 'approved';
  hostRequest.reviewedAt = new Date();
  hostRequest.reviewedBy = req.user.id;
  await hostRequest.save();

  logger.info('Host request approved', {
    adminId: req.user.id,
    hostRequestId: id,
    newUserId: user._id
  });

  res.json({
    success: true,
    message: 'Host request approved successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

// Reject host request (admin only)
router.post('/host-requests/:id/reject', protect, adminOnly, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const hostRequest = await HostRequest.findById(id);
  if (!hostRequest) {
    throw new AppError('Host request not found', 404);
  }

  if (hostRequest.status !== 'pending') {
    throw new AppError('This request has already been reviewed', 400);
  }

  // Update host request status
  hostRequest.status = 'rejected';
  hostRequest.rejectionReason = reason || 'No reason provided';
  hostRequest.reviewedAt = new Date();
  hostRequest.reviewedBy = req.user.id;
  await hostRequest.save();

  logger.info('Host request rejected', {
    adminId: req.user.id,
    hostRequestId: id,
    reason: hostRequest.rejectionReason
  });

  res.json({
    success: true,
    message: 'Host request rejected successfully',
    hostRequest: {
      id: hostRequest._id,
      status: hostRequest.status,
      rejectionReason: hostRequest.rejectionReason
    }
  });
}));

module.exports = router;
