const winston = require('winston');
const path = require('path');

// Check if running in serverless environment (Vercel, AWS Lambda, etc.)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production';

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0 && meta.stack) {
            log += `\n${meta.stack}`;
        } else if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }
        return log;
    })
);

// Create transports array based on environment
const transports = [];

// Always add console transport for serverless or development
if (isServerless) {
    // Serverless: use only console transport with JSON format
    transports.push(new winston.transports.Console({
        format: logFormat
    }));
} else {
    // Local development: use console with colorized format
    transports.push(new winston.transports.Console({
        format: consoleFormat
    }));

    // Only add file transports in non-serverless environments
    try {
        const DailyRotateFile = require('winston-daily-rotate-file');
        const logsDir = path.join(__dirname, '../logs');

        transports.push(new DailyRotateFile({
            filename: path.join(logsDir, 'application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            format: logFormat
        }));

        transports.push(new DailyRotateFile({
            filename: path.join(logsDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '30d',
            format: logFormat
        }));
    } catch (err) {
        console.warn('File logging disabled - winston-daily-rotate-file not available');
    }
}

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports
});

// Create a stream object for Morgan HTTP logger
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

module.exports = logger;
