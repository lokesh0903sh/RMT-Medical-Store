# Vercel Deployment Guide

This guide explains how to deploy the RMT Medical Store application on Vercel, with special consideration for file upload handling in a serverless environment.

## Overview

The application has been adapted to work in a serverless environment like Vercel by:

1. Using Cloudinary for file storage instead of local disk storage
2. Configuring proper environment variables
3. Setting up correct API endpoints for both development and production
4. Creating Vercel configuration files for both frontend and backend

## Backend Configuration

### 1. Vercel Configuration

The `vercel.json` file is configured to route all requests to the Express server:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### 2. Server Export

The server is exported for Vercel's serverless functions:

```javascript
// server.js
// ...existing server code...

// Use this for local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export the Express app for Vercel
module.exports = app;
```

### 3. CORS Configuration

CORS is configured to allow requests from the frontend:

```javascript
// Configure CORS to allow requests from frontend
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // In production, this will be set to the frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};
app.use(cors(corsOptions));
```

### 4. Cloudinary Integration for File Uploads

Instead of using local disk storage with Multer, the application now uses Cloudinary:

```javascript
// routes/medicalQuery.js
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rmt-medical/prescriptions',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    transformation: [{ quality: 'auto' }]
  }
});
const upload = multer({ storage });
```

### 5. Environment Variables (Backend)

The following environment variables should be set in Vercel:

- `MONGO_URL`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `CORS_ORIGIN`: URL of the frontend (e.g., https://rmt-medical-store.vercel.app)
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

## Frontend Configuration

### 1. Vercel Configuration

The `vercel.json` file is configured for a React SPA:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    { "handle": "filesystem" },
    { "src": "/.*", "dest": "/index.html" }
  ]
}
```

### 2. API Configuration

The frontend uses a centralized API client:

```javascript
// lib/api.js
import axios from 'axios';
import API_URL from './config';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for authentication
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
```

### 3. Environment Variables (Frontend)

The application uses environment-specific configuration:

- `.env.development`: For local development
  ```
  VITE_API_URL=http://localhost:5000
  VITE_NODE_ENV=development
  ```

- `.env.production`: For production deployment
  ```
  VITE_API_URL=https://rmt-medical-store-backend.vercel.app
  VITE_NODE_ENV=production
  ```

## File Upload Flow

1. User uploads a prescription file in the `MedicalQueryForm` component
2. The form data is submitted to the backend using the API client
3. The backend processes the upload using Multer with Cloudinary storage
4. Cloudinary stores the file and returns a URL
5. The URL is saved in the database with the medical query
6. Admin can view the uploaded file using the Cloudinary URL

## Deployment Steps

### Backend Deployment

1. Push your code to GitHub
2. Create a new project in Vercel
3. Link to your GitHub repository
4. Set the root directory to `backend`
5. Configure environment variables
6. Deploy

### Frontend Deployment

1. Create a new project in Vercel
2. Link to the same GitHub repository
3. Set the root directory to `frontend`
4. Configure environment variables (especially `VITE_API_URL` pointing to your backend)
5. Deploy

## Testing After Deployment

1. Test user registration and login
2. Test uploading prescription files in the medical query form
3. Test admin functionality to view uploaded prescriptions
4. Test other features that involve API communication

## Troubleshooting

- If file uploads fail, check Cloudinary configuration
- If API calls fail, verify the API URL is correctly set in environment variables
- If CORS errors occur, ensure the backend's CORS settings include the frontend URL
