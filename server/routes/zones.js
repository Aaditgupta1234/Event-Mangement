const express = require('express');
const router = express.Router();
const Zone = require('../models/Zone');
const { protect, adminOnly } = require('../utils/authMiddleware');
const { asyncHandler } = require('../utils/errorHandler');
const { createZoneValidation } = require('../utils/validators');
const logger = require('../utils/logger');

// Get all zones
router.get('/', asyncHandler(async (req, res) => {
    const zones = await Zone.find({}).populate('createdBy', 'name email role');

    logger.info('Zones fetched', { count: zones.length });

    res.json({
        success: true,
        count: zones.length,
        data: zones
    });
}));

// Get single zone
router.get('/:id', asyncHandler(async (req, res) => {
    const zone = await Zone.findById(req.params.id);

    if (!zone) {
        return res.status(404).json({ success: false, error: 'Zone not found' });
    }

    res.json({
        success: true,
        data: zone
    });
}));

// Create zone (admin only)
router.post('/', protect, adminOnly, createZoneValidation, asyncHandler(async (req, res) => {
    const zoneData = {
        ...req.body,
        createdBy: req.user.id
    };
    const zone = await Zone.create(zoneData);

    logger.info('Zone created', { zoneId: zone._id, name: zone.name, createdBy: req.user.id });

    res.status(201).json({
        success: true,
        data: zone
    });
}));

// Update zone (admin only)
router.put('/:id', protect, adminOnly, createZoneValidation, asyncHandler(async (req, res) => {
    const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!zone) {
        return res.status(404).json({ success: false, error: 'Zone not found' });
    }

    logger.info('Zone updated', { zoneId: zone._id, updatedBy: req.user.id });

    res.json({
        success: true,
        data: zone
    });
}));

// Delete zone (admin only)
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
    const zone = await Zone.findByIdAndDelete(req.params.id);

    if (!zone) {
        return res.status(404).json({ success: false, error: 'Zone not found' });
    }

    logger.info('Zone deleted', { zoneId: zone._id, deletedBy: req.user.id });

    res.json({
        success: true,
        message: 'Zone deleted successfully'
    });
}));

module.exports = router;
