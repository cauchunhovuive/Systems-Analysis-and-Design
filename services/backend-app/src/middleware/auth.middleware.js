// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

// This MUST be the same secret key used in your auth.service.js
const JWT_SECRET = 'your-super-secret-key-that-is-long-and-random';

/**
 * Middleware to verify a JWT from the Authorization header.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <TOKEN>"

  if (!token) {
    return res.status(403).json({ message: 'A token is required for authentication' });
  }

  try {
    // Verify the token and attach the decoded payload (user info) to the request object
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  return next(); // Proceed to the next middleware or the controller
};

/**
 * Middleware generator to check if the user has one of the required roles.
 * @param {string[]} requiredRoles - Array of roles allowed to access the route (e.g., ['ADMIN', 'ACADEMIC_OFFICE'])
 */
const checkRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user || !requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    return next();
  };
};

module.exports = {
  verifyToken,
  checkRole,
};