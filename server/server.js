const mongoose = require('mongoose');
const logger = require('./utils/logger');
const app = require('./app');

const isProduction = process.env.NODE_ENV === 'production';

const requiredEnvVars = {
  JWT_SECRET: 'JWT_SECRET is required',
  JWT_REFRESH_SECRET: 'JWT_REFRESH_SECRET is required',
  MONGO_URI: 'MONGO_URI is required'
};

const validateEnvironment = () => {
  const missing = [];

  Object.entries(requiredEnvVars).forEach(([key]) => {
    const value = process.env[key];
    if (!value || !value.trim()) {
      missing.push(key);
    }
  });

  if (isProduction && missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }

  if (!isProduction && missing.length > 0) {
    logger.warn('Missing development environment variables', { missing });
  }

  if (isProduction) {
    const invalid = [];

    if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length < 32) {
      invalid.push('JWT_SECRET must be at least 32 characters in production');
    }

    if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.trim().length < 32) {
      invalid.push('JWT_REFRESH_SECRET must be at least 32 characters in production');
    }

    if (invalid.length > 0) {
      throw new Error(`Invalid production environment variables: ${invalid.join('; ')}`);
    }
  }
};

validateEnvironment();

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/festifyxr';

// Serverless-optimized MongoDB connection with caching
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true, // Enable buffering for serverless
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      logger.info('MongoDB connected successfully', { uri: MONGO_URI.replace(/\/\/.*@/, '//<credentials>@') });
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    logger.error('MongoDB connection error', { error: e.message });
    throw e;
  }

  return cached.conn;
};

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    logger.error('Database connection failed', { error: err.message });
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
});

// Start server
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB error', { error: err.message });
    });

    const server = app.listen(PORT, () => {
      logger.info('Server started', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
      });
    });

    const shutdown = (signal) => {
      logger.info(`${signal} signal received: closing HTTP server`);
      server.close(() => {
        logger.info('HTTP server closed');
        mongoose.connection.close(false, () => {
          logger.info('MongoDB connection closed');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Promise Rejection', { error: err.message, stack: err.stack });
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
module.exports.connectDB = connectDB;
