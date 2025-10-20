// middleware/paginationMiddleware.js
const paginationMiddleware = (defaultLimit = 20) => (req, res, next) => {
  req.pagination = {
    page: parseInt(req.query.page) || 1,
    limit: Math.min(parseInt(req.query.limit) || defaultLimit, 50),
    sortBy: req.query.sortBy || 'createdAt',
    order: req.query.order?.toLowerCase() === 'asc' ? 'ASC' : 'DESC'
  };
  next();
};

module.exports = paginationMiddleware;