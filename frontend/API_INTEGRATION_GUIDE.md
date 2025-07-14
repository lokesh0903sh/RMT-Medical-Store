# API Integration Guide for RMT Medical Store Frontend

This guide explains how to update frontend components to use our new API configuration for Vercel deployment.

## Using the API Client

We've created a centralized API client that handles the base URL configuration automatically based on the environment. 
This makes it easy to deploy to different environments without changing code.

### Step 1: Import the API Client

```javascript
import api from '../lib/api';  // Adjust the path as needed
```

### Step 2: Replace axios/fetch calls

**Before:**
```javascript
const response = await fetch(`http://localhost:5000/api/products`, {
  headers: { 'x-auth-token': token }
});
```

OR

```javascript
const response = await axios.get(`http://localhost:5000/api/products`, {
  headers: { 'x-auth-token': token }
});
```

**After:**
```javascript
const response = await api.get('/api/products');
```

Notice that:
1. You no longer need to specify the base URL
2. The auth token is automatically added by the interceptor
3. The path starts with `/api/` without the domain

### For POST/PUT/DELETE requests:

```javascript
// POST example
const response = await api.post('/api/orders', orderData);

// PUT example
const response = await api.put(`/api/products/${productId}`, productData);

// DELETE example
const response = await api.delete(`/api/products/${productId}`);
```

## Environment Configuration

Our app uses two environment files:

1. `.env.development` - Used for local development
2. `.env.production` - Used for production deployment

The API base URL is configured in each file with the `VITE_API_URL` variable.

## Testing Your Changes

1. Run the app locally with `npm run dev` to make sure it works with the development environment
2. Build the app with `npm run build` and preview it with `npm run preview` to test the production build

## Deployment Process

See the `VERCEL_DEPLOYMENT.md` file for complete deployment instructions.
