const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');
require('dotenv').config();

module.exports = async function(req, res, next) {
  try {
    // Get token from header
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    
    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hello_world');

    // Get user from id in token
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Add user to request
    req.user = user;
    
    // Update last login time
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
