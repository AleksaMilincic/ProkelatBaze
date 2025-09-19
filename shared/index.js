const connectDB = require('./database');
const { generateToken, verifyToken, authMiddleware } = require('./auth');
const { setupMiddleware, errorHandler } = require('./middleware');

module.exports = {
  connectDB,
  generateToken,
  verifyToken,
  authMiddleware,
  setupMiddleware,
  errorHandler
};