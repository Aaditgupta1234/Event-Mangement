const express = require('express');
const { body, validationResult } = require('express-validator');
const BuddyResponse = require('../models/BuddyResponse');
const { protect, adminOnly } = require('../utils/authMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// Get all buddy responses
router.get('/', async (req, res) => {
    try {
        const responses = await BuddyResponse.find().populate('createdBy', 'name email role').sort({ createdAt: -1 });
        logger.info('Fetched all buddy responses');
        res.json({
            status: 'success',
            data: responses
        });
    } catch (error) {
        logger.error('Error fetching buddy responses:', error);
        res.status(500).json({ message: 'Error fetching buddy responses', error });
    }
});

// Create buddy response (admin only)
router.post('/', protect, adminOnly, [
    body('keyword').notEmpty().withMessage('Keyword is required'),
    body('trigger').isIn(['events', 'xp', 'map', 'rewards', 'general']).withMessage('Invalid trigger type'),
    body('response').notEmpty().withMessage('Response text is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation failed for buddy response creation:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { keyword, trigger, response } = req.body;

        const newResponse = new BuddyResponse({
            keyword: keyword.toLowerCase(),
            trigger,
            response,
            createdBy: req.user.id
        });

        await newResponse.save();
        logger.info(`Created buddy response with keyword: ${keyword}`);
        res.status(201).json({
            status: 'success',
            data: newResponse
        });
    } catch (error) {
        if (error.code === 11000) {
            logger.warn('Duplicate keyword:', req.body.keyword);
            return res.status(400).json({ message: 'Keyword already exists' });
        }
        logger.error('Error creating buddy response:', error);
        res.status(500).json({ message: 'Error creating buddy response', error });
    }
});

// Update buddy response (admin only)
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { keyword, trigger, response } = req.body;

        const updatedResponse = await BuddyResponse.findByIdAndUpdate(
            req.params.id,
            {
                keyword: keyword?.toLowerCase(),
                trigger,
                response,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );

        if (!updatedResponse) {
            return res.status(404).json({ message: 'Buddy response not found' });
        }

        logger.info(`Updated buddy response: ${req.params.id}`);
        res.json({
            status: 'success',
            data: updatedResponse
        });
    } catch (error) {
        if (error.code === 11000) {
            logger.warn('Duplicate keyword during update:', req.body.keyword);
            return res.status(400).json({ message: 'Keyword already exists' });
        }
        logger.error('Error updating buddy response:', error);
        res.status(500).json({ message: 'Error updating buddy response', error });
    }
});

// Delete buddy response (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const deletedResponse = await BuddyResponse.findByIdAndDelete(req.params.id);

        if (!deletedResponse) {
            return res.status(404).json({ message: 'Buddy response not found' });
        }

        logger.info(`Deleted buddy response: ${req.params.id}`);
        res.json({
            status: 'success',
            message: 'Buddy response deleted'
        });
    } catch (error) {
        logger.error('Error deleting buddy response:', error);
        res.status(500).json({ message: 'Error deleting buddy response', error });
    }
});

module.exports = router;
