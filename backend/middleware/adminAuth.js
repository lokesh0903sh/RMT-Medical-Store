const auth = require('./auth');

// Middleware to check if user is an admin
module.exports = function(req, res, next) {
  // First apply auth middleware
  auth(req, res, (err) => {
    if (err) return next(err);
    
    // Check if user is admin
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
  });
};
