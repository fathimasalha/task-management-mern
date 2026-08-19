const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes by validating JWT Bearer token and attaching user to req.user
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback_secret_for_dev_only'
      );

      // Fetch user without password
      const { isMongoActive, FallbackUser } = require('../models/store');
      if (isMongoActive()) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        req.user = await FallbackUser.findById(decoded.id);
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User session not found or account removed',
        });
      }

      return next();
    } catch (error) {
      console.error('[AuthMiddleware] Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid or expired token',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

module.exports = { protect };
