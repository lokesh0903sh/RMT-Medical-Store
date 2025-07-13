const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/UserSchema');
const Category = require('../models/Category');
const Product = require('../models/Product');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/rmt-medical');
    console.log('Connected to database...');

    // Clear existing users only (keep products and categories for real data)
    await User.deleteMany({});
    console.log('Cleared existing users...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@rmtmedical.com',
      password: adminPassword,
      role: 'admin'
    });
    await admin.save();
    console.log('Admin user created...');

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const user = new User({
      name: 'Test User',
      email: 'user@example.com',
      password: userPassword,
      role: 'user'
    });
    await user.save();
    console.log('Test user created...');

    console.log('User credentials seeded successfully!');
    console.log('Admin: admin@rmtmedical.com / admin123');
    console.log('User: user@example.com / user123');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
