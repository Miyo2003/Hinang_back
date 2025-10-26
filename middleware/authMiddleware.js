// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization header missing or malformed' });
  }

  const token = header.split(' ')[1];

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined');
    return res.status(500).json({ success: false, message: 'Server misconfiguration' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Export both original name and an alias `authenticate` because some routes import { authenticate }
module.exports = { authMiddleware, authenticate: authMiddleware };