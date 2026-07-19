const express = require('express');
const router = express.Router();
const Reward = require('../models/Reward');
const User = require('../models/User');
const { protect, adminOnly } = require('../utils/authMiddleware');
const { asyncHandler } = require('../utils/errorHandler');
const { createRewardValidation } = require('../utils/validators');
const logger = require('../utils/logger');

// Get all rewards
router.get('/', asyncHandler(async (req, res) => {
    const rewards = await Reward.find({}).populate('createdBy', 'name email role');

    logger.info('Rewards fetched', { count: rewards.length });

    res.json({
        success: true,
        count: rewards.length,
        data: rewards
    });
}));

// Get single reward
router.get('/:id', asyncHandler(async (req, res) => {
    const reward = await Reward.findById(req.params.id);

    if (!reward) {
        return res.status(404).json({ success: false, error: 'Reward not found' });
    }

    res.json({
        success: true,
        data: reward
    });
}));

// Create reward (admin only)
router.post('/', protect, adminOnly, createRewardValidation, asyncHandler(async (req, res) => {
    const rewardData = {
        ...req.body,
        createdBy: req.user.id
    };
    const reward = await Reward.create(rewardData);

    logger.info('Reward created', { rewardId: reward._id, title: reward.title, createdBy: req.user.id });

    res.status(201).json({
        success: true,
        data: reward
    });
}));

// Update reward (admin only)
router.put('/:id', protect, adminOnly, createRewardValidation, asyncHandler(async (req, res) => {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!reward) {
        return res.status(404).json({ success: false, error: 'Reward not found' });
    }

    logger.info('Reward updated', { rewardId: reward._id, updatedBy: req.user.id });

    res.json({
        success: true,
        data: reward
    });
}));

// Delete reward (admin only)
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
    const reward = await Reward.findByIdAndDelete(req.params.id);

    if (!reward) {
        return res.status(404).json({ success: false, error: 'Reward not found' });
    }

    logger.info('Reward deleted', { rewardId: reward._id, deletedBy: req.user.id });

    res.json({
        success: true,
        message: 'Reward deleted successfully'
    });
}));

// Redeem reward by QR code (participant)
router.post('/redeem/:qrCode', protect, asyncHandler(async (req, res) => {
    const reward = await Reward.findOne({ qrCode: req.params.qrCode });

    if (!reward) {
        return res.status(404).json({ success: false, error: 'Invalid QR code' });
    }

    if (reward.redeemed) {
        return res.status(400).json({ success: false, error: 'Reward already redeemed' });
    }

    // Update reward
    reward.redeemed = true;
    reward.redeemedBy = req.user.id;
    reward.redeemedAt = new Date();
    await reward.save();

    // Add XP to user
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { xp: reward.cost } },
        { new: true }
    );

    // Calculate level based on XP (100 XP per level)
    const newLevel = Math.floor(user.xp / 100) + 1;
    if (user.level !== newLevel) {
        user.level = newLevel;
        await user.save();
    }

    logger.info('Reward redeemed', {
        rewardId: reward._id,
        qrCode: req.params.qrCode,
        redeemedBy: req.user.id,
        xpGained: reward.cost,
        totalXP: user.xp,
        newLevel: user.level
    });

    res.json({
        success: true,
        message: 'Reward redeemed successfully!',
        data: {
            reward,
            user: {
                id: user._id,
                name: user.name,
                xp: user.xp,
                level: user.level
            },
            xpGained: reward.cost
        }
    });
}));

// Regenerate QR code for reward (admin only)
router.post('/:id/regenerate-qr', protect, adminOnly, asyncHandler(async (req, res) => {
    const crypto = require('crypto');
    const reward = await Reward.findById(req.params.id);

    if (!reward) {
        return res.status(404).json({ success: false, error: 'Reward not found' });
    }

    reward.qrCode = crypto.randomBytes(16).toString('hex');
    reward.redeemed = false;
    reward.redeemedBy = null;
    reward.redeemedAt = null;
    await reward.save();

    logger.info('QR code regenerated', { rewardId: reward._id, regeneratedBy: req.user.id });

    res.json({
        success: true,
        data: reward
    });
}));

module.exports = router;
