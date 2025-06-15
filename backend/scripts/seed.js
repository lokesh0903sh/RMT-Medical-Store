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

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data...');    // Create admin user
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

    // Create categories
    const categories = [
      {
        name: 'Allopathic',
        slug: 'allopathic',
        description: 'All allopathic medicines',
        featured: true
      },
      {
        name: 'Ayurvedic',
        slug: 'ayurvedic',
        description: 'All ayurvedic medicines',
        featured: true
      },
      {
        name: 'Baby Care',
        slug: 'baby-care',
        description: 'Products for babies and infants',
        featured: false
      },
      {
        name: 'Personal Care',
        slug: 'personal-care',
        description: 'Personal hygiene and care products',
        featured: true
      }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('Categories created...');

    // Create sample products
    const products = [
      {
        name: 'Paracetamol',
        description: 'Fever and pain relief tablet',
        price: 15,
        mrp: 20,
        discount: 25,
        category: createdCategories[0]._id,
        subCategory: 'Pain Relief',
        stock: 100,
        sku: 'PCM001',
        manufacturer: 'Cipla',
        requiresPrescription: false,
        dosage: '500mg',
        featured: true
      },
      {
        name: 'Ashwagandha',
        description: 'Ayurvedic stress relief supplement',
        price: 150,
        mrp: 180,
        discount: 17,
        category: createdCategories[1]._id,
        subCategory: 'Supplements',
        stock: 50,
        sku: 'ASH001',
        manufacturer: 'Dabur',
        requiresPrescription: false,
        featured: true
      },
      {
        name: 'Baby Lotion',
        description: 'Gentle moisturizing lotion for babies',
        price: 120,
        mrp: 140,
        discount: 14,
        category: createdCategories[2]._id,
        subCategory: 'Skin Care',
        stock: 30,
        sku: 'BL001',
        manufacturer: 'Johnson & Johnson',
        requiresPrescription: false,
        featured: false
      },
      {
        name: 'Antibacterial Soap',
        description: 'Kills germs and bacteria',
        price: 40,
        mrp: 45,
        discount: 11,
        category: createdCategories[3]._id,
        subCategory: 'Soaps',
        stock: 200,
        sku: 'ABS001',
        manufacturer: 'Dettol',
        requiresPrescription: false,
        featured: false
      }
    ];

    await Product.insertMany(products);
    console.log('Products created...');

    console.log('Database seeded successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
