require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const { errorHandler } = require('./utils/errorHandler');

const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const zonesRoutes = require('./routes/zones');
const rewardsRoutes = require('./routes/rewards');
const scansRoutes = require('./routes/scans');
const buddyRoutes = require('./routes/buddy');
const announcementsRoutes = require('./routes/announcements');
const leaderboardRoutes = require('./routes/leaderboard');
const exportRoutes = require('./routes/export');

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

app.use(mongoSanitize());
app.use(compression());

const parseAllowedOrigins = () => {
    const envOrigins = (process.env.CORS_ORIGIN || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

    return [
        'http://localhost:5173',
        'http://localhost:4173',
        ...envOrigins
    ];
};

const allowedOrigins = parseAllowedOrigins();

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS origin not allowed'), false);
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const isProd = process.env.NODE_ENV === 'production';
app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProd ? 100 : 1000,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
}));

app.use('/api/auth', rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProd ? 50 : 200,
    message: 'Too many authentication attempts, please try again later'
}));

app.use((req, res, next) => {
    logger.info('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/zones', zonesRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/scans', scansRoutes);
app.use('/api/buddy', buddyRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/export', exportRoutes);

app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'FestifyXR API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            events: '/api/events',
            zones: '/api/zones',
            rewards: '/api/rewards',
            scans: '/api/scans',
            buddy: '/api/buddy',
            announcements: '/api/announcements',
            leaderboard: '/api/leaderboard'
        }
    });
});

app.use((req, res) => {
    logger.warn('404 Not Found', { path: req.path, method: req.method });
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

app.use(errorHandler);

module.exports = app;