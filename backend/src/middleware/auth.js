const jwt = require('jsonwebtoken');
const { getDb } = require('../config/firebase');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify JWT token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');

    // Attach user info to request (from token claims)
    req.user = {
      id: decodedToken.userId,
      email: decodedToken.email,
      role: decodedToken.role,
      orgId: decodedToken.orgId,
      name: decodedToken.name,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole,
};

