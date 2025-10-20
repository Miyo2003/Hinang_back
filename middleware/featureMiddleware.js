// middleware/featureMiddleware.js
const { assertFeatureEnabled } = require('../utils/featureToggle');

const featureMiddleware = (featureKey) => (req, res, next) => {
  try {
    assertFeatureEnabled(featureKey);
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: err.message });
  }
};

module.exports = featureMiddleware;