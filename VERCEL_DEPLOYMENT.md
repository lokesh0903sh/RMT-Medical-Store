# Vercel Deployment Guide for RMT Medical Store

This guide explains how to deploy the RMT Medical Store application on Vercel.

## Prerequisites
- A Vercel account (free at [vercel.com](https://vercel.com))
- Git repository with your project code (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Deploy Backend First

1. Push your code to a Git repository
2. Login to Vercel and create a new project
3. Import your Git repository
4. Configure the project:
   - Set Framework Preset to "Other"
   - Set Root Directory to "backend"
   - Set Build Command to "npm install"
   - Set Output Directory to "/"
   - Set Install Command to "npm install"
5. Add the following Environment Variables:
   ```
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   NODE_ENV=production
   ```
6. Deploy the backend
7. After deployment, note the URL of your backend (e.g., `https://rmt-medical-store-backend.vercel.app`)

### 2. Deploy Frontend

1. Update the frontend .env.production file with the backend URL:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   VITE_NODE_ENV=production
   ```
2. Create a new project in Vercel
3. Import the same repository
4. Configure the project:
   - Set Framework Preset to "Vite"
   - Set Root Directory to "frontend"
   - Set Build Command to "npm run build"
   - Set Output Directory to "dist"
   - Set Install Command to "npm install"
5. Deploy the frontend

### 3. Connect Frontend to Backend

The frontend will automatically connect to the backend using the `VITE_API_URL` environment variable.

## Troubleshooting

If you encounter CORS issues:
1. Go to your backend project in Vercel
2. Navigate to Settings > Environment Variables
3. Add: `CORS_ORIGIN=https://your-frontend-url.vercel.app`

## Local Development

For local development, use the .env.development file:
```
VITE_API_URL=http://localhost:5000
VITE_NODE_ENV=development
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
