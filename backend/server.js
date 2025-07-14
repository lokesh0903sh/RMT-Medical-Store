const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');

const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://rmt-medical-store-eafh.vercel.app/',
      // Add your actual Vercel frontend URL here
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

app.use(cors(corsOptions));
app.use(express.json());

// Note: No local directory creation needed for Vercel serverless functions
// Files are handled by Cloudinary, not local storage

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'RMT Medical Store API is running (Fixed)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.2'
  });
});

// Database connection
main().then(() => {
  console.log("Connected to database");
}).catch((err) => {
  console.log("Database connection error:", err);
});

async function main() {
  await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/rmt-medical');
}

// Routes
const medicalQueryRoutes = require('./routes/medicalQuery');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const notificationRoutes = require('./routes/notifications');
const orderRoutes = require('./routes/orders');
const analyticsRoutes = require('./routes/analytics');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/uploads');

// API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/medical-query', medicalQueryRoutes);
app.use('/api/medical-queries', medicalQueryRoutes); // Admin route for query management
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);

// 404 Error handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

const PORT = process.env.PORT || 5000;

// Use this for local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export the Express app for Vercel
module.exports = app;