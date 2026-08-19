const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT token for a given user ID
 * @param {string} id - User ObjectId
 * @returns {string} Signed JWT
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_dev_only', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

module.exports = generateToken;
