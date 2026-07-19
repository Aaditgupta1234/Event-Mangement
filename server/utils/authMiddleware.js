const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const logger = require('./logger');

const protect = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    logger.warn('Authentication failed: No token provided', { ip: req.ip, path: req.path });
    return next(new AppError('No authentication token provided', 401));
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure token is not a refresh token
    if (decoded.type === 'refresh') {
      logger.warn('Authentication failed: Refresh token used as access token', { ip: req.ip });
      return next(new AppError('Invalid token type', 401));
    }

    req.user = decoded;
    logger.debug('User authenticated', { userId: decoded.id, role: decoded.role });
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Authentication failed: Token expired', { exp: error.expiredAt, ip: req.ip });
      return next(new AppError('Token has expired. Please refresh your token.', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Authentication failed: Invalid token', { error: error.message, ip: req.ip });
      return next(new AppError('Invalid token format', 401));
    }
    logger.warn('Authentication failed: Unknown error', { error: error.message, ip: req.ip });
    return next(new AppError('Authentication error', 401));
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'host') {
    logger.warn('Authorization failed: Admin or Host access required', {
      userId: req.user.id,
      role: req.user.role,
      path: req.path
    });
    return next(new AppError('Admin or Host privileges required', 403));
  }
  next();
};

module.exports = { protect, adminOnly };
