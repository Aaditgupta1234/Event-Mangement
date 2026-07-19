const express = require('express');
const User = require('../models/User');
const { protect } = require('../utils/authMiddleware');
const { asyncHandler } = require('../utils/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/leaderboard - Get top users by XP
router.get('/', protect, asyncHandler(async (req, res) => {
    const leaderboard = await User.find({ role: 'participant' })
        .select('_id name email xp level')
        .sort({ xp: -1, level: -1 })
        .limit(100)
        .lean();

    // Get current user ID from token
    const currentUserId = req.user?.id || req.user?._id;

    // Add rank to each user
    const leaderboardWithRank = leaderboard.map((user, index) => ({
        ...user,
        rank: index + 1,
        isCurrentUser: user._id?.toString() === currentUserId?.toString()
    }));

    logger.info('Leaderboard fetched', { count: leaderboardWithRank.length, currentUserId });

    res.json({
        success: true,
        data: leaderboardWithRank
    });
}));

module.exports = router;
