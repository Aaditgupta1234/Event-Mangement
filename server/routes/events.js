const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, adminOnly } = require('../utils/authMiddleware');
const { asyncHandler } = require('../utils/errorHandler');
const { createEventValidation } = require('../utils/validators');
const logger = require('../utils/logger');

// Get all events
router.get('/', protect, asyncHandler(async (req, res) => {
  const { createdBy } = req.query;
  const filter = createdBy ? { createdBy } : {};
  const events = await Event.find(filter).populate('createdBy', 'name email role').sort({ createdAt: -1 });
  logger.info('Events fetched', { count: events.length, filter });

  res.json({
    success: true,
    count: events.length,
    data: events
  });
}));

// Get single event
router.get('/:id', protect, asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  res.json({
    success: true,
    data: event
  });
}));

// Create event (admin and host only)
router.post('/', protect, adminOnly, createEventValidation, asyncHandler(async (req, res) => {
  const eventData = {
    ...req.body,
    createdBy: req.user.id
  };
  const event = await Event.create(eventData);

  logger.info('Event created', { eventId: event._id, title: event.title, createdBy: req.user.id });

  res.status(201).json({
    success: true,
    data: event
  });
}));

// Update event (admin and host only)
router.put('/:id', protect, adminOnly, createEventValidation, asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!event) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  logger.info('Event updated', { eventId: event._id, updatedBy: req.user.id });

  res.json({
    success: true,
    data: event
  });
}));

// Delete event (admin and host only)
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  logger.info('Event deleted', { eventId: event._id, deletedBy: req.user.id });

  res.json({
    success: true,
    message: 'Event deleted successfully'
  });
}));

module.exports = router;
