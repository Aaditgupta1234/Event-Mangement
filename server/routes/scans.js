const express = require('express');
const router = express.Router();
const { protect } = require('../utils/authMiddleware');
const Scan = require('../models/Scan');
const User = require('../models/User');
const { asyncHandler, AppError } = require('../utils/errorHandler');
const { createScanValidation } = require('../utils/validators');
const logger = require('../utils/logger');

// Create scan (authenticated users)
router.post('/', protect, createScanValidation, asyncHandler(async (req, res) => {
  const { code, points } = req.body;

  // Check for duplicate scan
  const existingScan = await Scan.findOne({ user: req.user.id, code });
  if (existingScan) {
    throw new AppError('QR code already scanned', 400);
  }

  // Create scan
  const scan = await Scan.create({
    user: req.user.id,
    code,
    points
  });

  // Update user XP and level
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.xp = (user.xp || 0) + points;
  user.level = Math.floor(1 + user.xp / 100);
  user.scans.push(scan._id);
  await user.save();

  logger.info('QR code scanned', {
    userId: req.user.id,
    scanId: scan._id,
    code,
    points,
    newXP: user.xp,
    newLevel: user.level
  });

  res.status(201).json({
    success: true,
    data: {
      scan,
      xp: user.xp,
      level: user.level
    }
  });
}));

// Get user's scans
router.get('/user/:id', asyncHandler(async (req, res) => {
  const scans = await Scan.find({ user: req.params.id })
    .sort({ time: -1 })
    .populate('user', 'name email');

  logger.info('User scans fetched', { userId: req.params.id, count: scans.length });

  res.json({
    success: true,
    count: scans.length,
    data: scans
  });
}));

// Get my scans (authenticated)
router.get('/my-scans', protect, asyncHandler(async (req, res) => {
  const scans = await Scan.find({ user: req.user.id }).sort({ time: -1 });

  res.json({
    success: true,
    count: scans.length,
    data: scans
  });
}));

module.exports = router;
