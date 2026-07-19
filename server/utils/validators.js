const { body, param, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Validation middleware to check for errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg).join(', ');
        return next(new AppError(errorMessages, 400));
    }
    next();
};

// Auth validation rules
const signupValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(['participant', 'host', 'admin']).withMessage('Role must be either participant, host, or admin'),
    validate
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    validate
];

// Event validation rules
const createEventValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('time')
        .notEmpty().withMessage('Time is required'),
    body('venue')
        .trim()
        .notEmpty().withMessage('Venue is required'),
    body('tag')
        .trim()
        .notEmpty().withMessage('Tag is required'),
    body('points')
        .isInt({ min: 0, max: 1000 }).withMessage('Points must be between 0 and 1000'),
    body('desc')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
    validate
];

// Zone validation rules
const createZoneValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required'),
    body('x')
        .isInt({ min: 0, max: 100 }).withMessage('X coordinate must be between 0 and 100'),
    body('y')
        .isInt({ min: 0, max: 100 }).withMessage('Y coordinate must be between 0 and 100'),
    body('description')
        .trim()
        .optional(),
    body('icon')
        .optional(),
    body('mapQuery')
        .optional(),
    validate
];

// Reward validation rules
const createRewardValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required'),
    body('cost')
        .isInt({ min: 0 }).withMessage('Cost must be a positive number'),
    validate
];

// Scan validation rules
const createScanValidation = [
    body('code')
        .trim()
        .notEmpty().withMessage('QR code is required'),
    body('points')
        .isInt({ min: 0, max: 500 }).withMessage('Points must be between 0 and 500'),
    validate
];

// ID param validation
const validateObjectId = [
    param('id')
        .isMongoId().withMessage('Invalid ID format'),
    validate
];

module.exports = {
    signupValidation,
    loginValidation,
    createEventValidation,
    createZoneValidation,
    createRewardValidation,
    createScanValidation,
    validateObjectId,
    validate
};
