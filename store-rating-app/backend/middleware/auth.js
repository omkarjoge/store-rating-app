const { verifyToken } = require('../utils/jwt');

// Verifies the Bearer token and attaches { id, role, email } to req.user
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }

  try {
    const payload = verifyToken(token);
    req.user = payload; // { id, role, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Usage: authorize('ADMIN'), authorize('ADMIN', 'STORE_OWNER'), etc.
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
