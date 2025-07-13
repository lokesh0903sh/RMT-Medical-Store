const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test Cloudinary connection
async function testCloudinaryConnection() {
  try {
    console.log('Testing Cloudinary connection...');
    
    // Test API connection
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log('Status:', result.status);
    
    // Get account details (optional)
    const usage = await cloudinary.api.usage();
    console.log('📊 Account Usage:');
    console.log('- Storage:', usage.storage.used_bytes, 'bytes');
    console.log('- Bandwidth:', usage.bandwidth.used_bytes, 'bytes');
    console.log('- Transformations:', usage.transformations.used);
    
    console.log('\n🎉 Cloudinary integration is ready to use!');
    
  } catch (error) {
    console.error('❌ Cloudinary connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('Must supply cloud_name')) {
      console.log('💡 Please check your CLOUDINARY_CLOUD_NAME in .env file');
    } else if (error.message.includes('Invalid API key')) {
      console.log('💡 Please check your CLOUDINARY_API_KEY in .env file');
    } else if (error.message.includes('Invalid API secret')) {
      console.log('💡 Please check your CLOUDINARY_API_SECRET in .env file');
    }
  }
}

// Run test
testCloudinaryConnection();
