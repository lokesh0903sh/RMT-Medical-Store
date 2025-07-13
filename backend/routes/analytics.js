const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/UserSchema');
const Order = require('../models/Order');
const MedicalQuery = require('../models/MedicalQuery');
const adminAuth = require('../middleware/adminAuth');

// Get dashboard analytics
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get basic counts
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingQueries = await MedicalQuery.countDocuments({ status: 'pending' });

    // Get revenue data
    const orders = await Order.find({}).populate('items.product');
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get low stock products (products with stock < 10)
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });

    // Get recent orders
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get top selling products (based on orders)
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { 
        $group: { 
          _id: '$items.product', 
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        } 
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);

    res.json({
      stats: {
        totalProducts,
        totalCategories,
        totalUsers,
        totalOrders,
        totalRevenue,
        lowStockProducts,
        pendingQueries
      },
      recentOrders,
      topProducts
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sales analytics by time period
router.get('/sales/:period', adminAuth, async (req, res) => {
  try {
    const { period } = req.params;
    let dateFilter = {};
    let groupBy = {};

    const now = new Date();
    
    switch (period) {
      case 'daily':
        // Last 7 days
        dateFilter = {
          createdAt: {
            $gte: new Date(now.setDate(now.getDate() - 7))
          }
        };
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'weekly':
        // Last 12 weeks
        dateFilter = {
          createdAt: {
            $gte: new Date(now.setDate(now.getDate() - 84))
          }
        };
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'monthly':
        // Last 12 months
        dateFilter = {
          createdAt: {
            $gte: new Date(now.setMonth(now.getMonth() - 12))
          }
        };
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      case 'yearly':
        // Last 5 years
        dateFilter = {
          createdAt: {
            $gte: new Date(now.setFullYear(now.getFullYear() - 5))
          }
        };
        groupBy = {
          year: { $year: '$createdAt' }
        };
        break;
      default:
        return res.status(400).json({ message: 'Invalid period' });
    }

    const salesData = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: groupBy,
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    res.json({ salesData, period });
  } catch (error) {
    console.error('Sales analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user analytics
router.get('/users', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = totalUsers - adminUsers;

    // User registration trend (last 12 months)
    const userTrend = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Recent users
    const recentUsers = await User.find({})
      .select('name email createdAt role')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats: {
        totalUsers,
        adminUsers,
        regularUsers
      },
      userTrend,
      recentUsers
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product analytics
router.get('/products', adminAuth, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .select('name stock category');
    
    // Products by category
    const productsByCategory = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo.name',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      stats: {
        totalProducts,
        lowStockCount: lowStockProducts.length
      },
      lowStockProducts,
      productsByCategory
    });
  } catch (error) {
    console.error('Product analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
