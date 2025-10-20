// middleware/errorHandler.js
const logger = require('../utils/logger');
const { ValidationError } = require('../utils/errorTypes');

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = status >= 500 ? 'An unexpected error occurred' : err.message;

  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  if (err instanceof ValidationError) {
    return res.status(status).json({
      success: false,
      message: err.message,
      errors: err.errors
    });
  }

  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;