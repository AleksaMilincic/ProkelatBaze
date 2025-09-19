const jwt = require('jsonwebtoken');

const generateToken = (payload, secret, expiresIn = '24h') => {
  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

const authMiddleware = (secret) => {
  return (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = verifyToken(token, secret);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware
};