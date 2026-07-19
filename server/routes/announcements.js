const express = require('express');
const { body, validationResult } = require('express-validator');
const Announcement = require('../models/Announcement');
const { protect, adminOnly } = require('../utils/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// Get all announcements
router.get('/', async (req, res) => {
    try {
        const announcements = await Announcement.find().populate('createdBy', 'name email role').sort({ createdAt: -1 });
        logger.info('Fetched all announcements');
        res.json({
            status: 'success',
            data: announcements
        });
    } catch (error) {
        logger.error('Error fetching announcements:', error);
        res.status(500).json({ message: 'Error fetching announcements', error });
    }
});

// Create announcement (admin only)
router.post('/', protect, adminOnly, [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation failed for announcement creation:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, content, icon, priority, active } = req.body;

        const newAnnouncement = new Announcement({
            title,
            content,
            icon: icon || '📢',
            priority,
            active: active !== false,
            createdBy: req.user.id
        });

        await newAnnouncement.save();
        logger.info(`Created announcement: ${title}`);
        res.status(201).json({
            status: 'success',
            data: newAnnouncement
        });
    } catch (error) {
        logger.error('Error creating announcement:', error);
        res.status(500).json({ message: 'Error creating announcement', error });
    }
});

// Update announcement (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { title, content, icon, priority, active } = req.body;

        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            req.params.id,
            {
                title,
                content,
                icon,
                priority,
                active,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );

        if (!updatedAnnouncement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        logger.info(`Updated announcement: ${req.params.id}`);
        res.json({
            status: 'success',
            data: updatedAnnouncement
        });
    } catch (error) {
        logger.error('Error updating announcement:', error);
        res.status(500).json({ message: 'Error updating announcement', error });
    }
});

// Delete announcement (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const deletedAnnouncement = await Announcement.findByIdAndDelete(req.params.id);

        if (!deletedAnnouncement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        logger.info(`Deleted announcement: ${req.params.id}`);
        res.json({
            status: 'success',
            message: 'Announcement deleted'
        });
    } catch (error) {
        logger.error('Error deleting announcement:', error);
        res.status(500).json({ message: 'Error deleting announcement', error });
    }
});

module.exports = router;
