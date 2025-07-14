# Cloudinary Integration Documentation

## Architecture Flow
Following the requested architecture: **Client → Multer → Server → Cloudinary → Database**

## Overview
This implementation integrates Cloudinary for cloud-based file storage, replacing local file storage with secure, scalable cloud storage. The system supports images, documents, and general files with automatic optimization and CDN delivery.

## Configuration

### 1. Environment Variables
Add these to your `.env` file in the backend directory:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 2. Getting Cloudinary Credentials
1. Visit [Cloudinary](https://cloudinary.com/) and create an account
2. Go to your Dashboard
3. Copy the Cloud Name, API Key, and API Secret
4. Replace the placeholder values in your `.env` file

## File Structure

```
backend/
├── config/
│   └── cloudinary.js          # Cloudinary configuration and middleware
├── routes/
│   ├── products.js            # Updated with Cloudinary upload
│   ├── categories.js          # Updated with Cloudinary upload
│   └── uploads.js             # General file upload routes
└── .env                       # Environment variables
```

## Features

### 1. Multiple Upload Types
- **Product Images**: Optimized for product catalog (1000x1000px max, auto-quality)
- **Category Images**: Optimized for category thumbnails (500x500px max, auto-quality)
- **Documents**: PDF, DOC, DOCX, TXT files (up to 10MB)
- **General Files**: Any file type (up to 15MB)

### 2. Automatic Optimization
- Image compression and optimization
- Multiple format support (JPEG, PNG, WebP, GIF)
- Responsive image delivery
- CDN distribution

### 3. File Organization
Files are organized in Cloudinary folders:
- `rmt-medical/products/` - Product images
- `rmt-medical/categories/` - Category images
- `rmt-medical/documents/` - Document files
- `rmt-medical/files/` - General files

## API Endpoints

### Product Upload
- **POST** `/api/products` - Create product with image
- **PUT** `/api/products/:id` - Update product with optional new image
- **DELETE** `/api/products/:id` - Delete product and associated image

### Category Upload
- **POST** `/api/categories` - Create category with image
- **PUT** `/api/categories/:id` - Update category with optional new image
- **DELETE** `/api/categories/:id` - Delete category and associated image

### General Upload
- **POST** `/api/uploads/upload/general` - Upload any file type
- **POST** `/api/uploads/upload/document` - Upload documents (PDF, DOC, etc.)
- **POST** `/api/uploads/upload/multiple` - Upload multiple files
- **DELETE** `/api/uploads/delete/:publicId` - Delete file by public ID
- **DELETE** `/api/uploads/delete-by-url` - Delete file by URL

## Usage Examples

### 1. Product Upload (Frontend)
```javascript
const formData = new FormData();
formData.append('name', 'Product Name');
formData.append('price', '29.99');
formData.append('image', imageFile);

const response = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'x-auth-token': token
  },
  body: formData
});
```

### 2. General File Upload
```javascript
const formData = new FormData();
formData.append('file', selectedFile);

const response = await fetch('/api/uploads/upload/general', {
  method: 'POST',
  headers: {
    'x-auth-token': token
  },
  body: formData
});

const result = await response.json();
console.log('Uploaded file URL:', result.file.url);
```

### 3. Document Upload
```javascript
const formData = new FormData();
formData.append('document', pdfFile);

const response = await fetch('/api/uploads/upload/document', {
  method: 'POST',
  headers: {
    'x-auth-token': token
  },
  body: formData
});
```

## Key Features

### 1. Automatic File Cleanup
- When updating products/categories with new images, old images are automatically deleted from Cloudinary
- When deleting products/categories, associated images are removed from Cloudinary
- Prevents storage bloat and reduces costs

### 2. Error Handling
- Comprehensive error handling for upload failures
- Validation for file types and sizes
- Graceful degradation if Cloudinary is unavailable

### 3. Security
- File type validation
- Size limits per file type
- Authentication required for all uploads
- Public ID extraction for secure deletion

### 4. Performance
- CDN delivery for fast loading
- Automatic image optimization
- Responsive image serving
- Lazy loading support

## File Type Restrictions

### Product Images
- **Types**: JPEG, PNG, GIF, WebP
- **Size**: 5MB maximum
- **Optimization**: Auto-compressed to 1000x1000px

### Category Images
- **Types**: JPEG, PNG, GIF, WebP
- **Size**: 2MB maximum
- **Optimization**: Auto-compressed to 500x500px

### Documents
- **Types**: PDF, DOC, DOCX, TXT
- **Size**: 10MB maximum

### General Files
- **Types**: Any file type
- **Size**: 15MB maximum

## Database Schema Updates

The database schema remains unchanged. The `imageUrl` field now stores the full Cloudinary URL instead of a relative path:

```javascript
// Before (local storage)
imageUrl: "/uploads/products/1234567890-image.jpg"

// After (Cloudinary)
imageUrl: "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/rmt-medical/products/abc123.jpg"
```

## Migration from Local Storage

### Frontend Updates
The frontend automatically handles both local and Cloudinary URLs:

```javascript
// Smart URL handling
const imageUrl = product.imageUrl.startsWith('http') 
  ? product.imageUrl  // Cloudinary URL
  : `https://rmt-medical-store.vercel.app/${product.imageUrl}`; // Local URL
```

### Backward Compatibility
- Existing local images continue to work
- New uploads automatically use Cloudinary
- Gradual migration possible

## Benefits

1. **Scalability**: No server storage limits
2. **Performance**: Global CDN delivery
3. **Optimization**: Automatic image compression
4. **Reliability**: 99.9% uptime guarantee
5. **Cost-Effective**: Pay for what you use
6. **Security**: Secure URLs and access control
7. **Backup**: Automatic cloud backup

## Monitoring and Analytics

Cloudinary provides built-in analytics for:
- Storage usage
- Bandwidth consumption
- Transformation requests
- Popular images
- Geographic distribution

## Best Practices

1. **Use appropriate upload endpoints** for different file types
2. **Implement client-side validation** before upload
3. **Show upload progress** for better UX
4. **Handle errors gracefully** with user-friendly messages
5. **Clean up unused files** regularly
6. **Monitor usage** to optimize costs

## Troubleshooting

### Common Issues

1. **Upload fails**: Check Cloudinary credentials
2. **Images not loading**: Verify URL format
3. **File too large**: Check size limits
4. **Invalid file type**: Verify accepted formats

### Debug Steps

1. Check environment variables
2. Verify Cloudinary account status
3. Check network connectivity
4. Review server logs
5. Test with smaller files

## Cost Optimization

1. **Use transformations wisely** - Only apply when needed
2. **Set appropriate quality levels** - Balance quality vs file size
3. **Clean up unused files** - Use deletion endpoints
4. **Monitor usage** - Regular usage review
5. **Choose right plan** - Scale based on needs

## Security Considerations

1. **Validate file types** on both client and server
2. **Limit file sizes** to prevent abuse
3. **Authenticate uploads** - Require valid tokens
4. **Sanitize filenames** - Prevent malicious uploads
5. **Regular audits** - Review uploaded content

This implementation provides a robust, scalable file storage solution that follows the requested architecture flow while maintaining backward compatibility and providing excellent performance.
