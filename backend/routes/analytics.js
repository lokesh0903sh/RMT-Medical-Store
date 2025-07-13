const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/UserSchema');
const Order = require('../models/Order');
const Category = require('../models/Category');
const MedicalQuery = require('../models/MedicalQuery');
const adminAuth = require('../middleware/adminAuth');

// Helper function to get date range based on period
const getDateRange = (period) => {
  const now = new Date();
  let startDate, endDate = now;

  switch (period) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'weekly':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'yearly':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date('2020-01-01'); // All time
  }

  return { startDate, endDate };
};

// Calculate growth percentage
const calculateGrowth = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Get dashboard analytics
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    // Get current period data
    const [
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue,
      topProducts,
      lowStockProducts,
      pendingOrders,
      recentQueries
    ] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ role: { $ne: 'admin' } }),
      Order.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]).then(result => result[0]?.total || 0),
      
      // Top selling products
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate }, status: 'completed' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            sold: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productInfo'
          }
        },
        { $unwind: '$productInfo' },
        {
          $project: {
            name: '$productInfo.name',
            sold: 1,
            revenue: 1
          }
        },
        { $sort: { sold: -1 } },
        { $limit: 5 }
      ]),

      // Low stock products
      Product.countDocuments({ stock: { $lt: 10 } }),
      
      // Pending orders
      Order.countDocuments({ status: 'pending' }),
      
      // Recent medical queries
      MedicalQuery.countDocuments({ status: 'pending' })
    ]);

    // Calculate previous period for growth comparison
    let previousStartDate, previousEndDate;
    const timeDiff = endDate.getTime() - startDate.getTime();
    previousEndDate = new Date(startDate.getTime() - 1);
    previousStartDate = new Date(previousEndDate.getTime() - timeDiff);

    const [
      previousUsers,
      previousOrders,
      previousRevenue
    ] = await Promise.all([
      User.countDocuments({ 
        role: { $ne: 'admin' },
        createdAt: { $gte: previousStartDate, $lte: previousEndDate }
      }),
      Order.countDocuments({ 
        createdAt: { $gte: previousStartDate, $lte: previousEndDate }
      }),
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: previousStartDate, $lte: previousEndDate },
            status: 'completed'
          }
        },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]).then(result => result[0]?.total || 0)
    ]);

    // Calculate growth percentages
    const growth = {
      users: calculateGrowth(totalUsers, previousUsers),
      orders: calculateGrowth(totalOrders, previousOrders),
      revenue: calculateGrowth(totalRevenue, previousRevenue),
      products: 0 // Products don't have time-based growth in this context
    };

    // Generate alerts
    const alerts = [];
    if (lowStockProducts > 0) {
      alerts.push({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${lowStockProducts} products are running low on stock`
      });
    }
    if (pendingOrders > 0) {
      alerts.push({
        type: 'info',
        title: 'Pending Orders',
        message: `You have ${pendingOrders} orders waiting for processing`
      });
    }
    if (recentQueries > 0) {
      alerts.push({
        type: 'info',
        title: 'Medical Queries',
        message: `${recentQueries} new medical queries need attention`
      });
    }

    res.json({
      overview: {
        totalProducts,
        totalUsers,
        totalRevenue,
        totalOrders
      },
      growth,
      topProducts,
      alerts
    });

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
});

// Get revenue analytics with time series data
router.get('/revenue', adminAuth, async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    let groupBy;
    let dateFormat;

    switch (period) {
      case 'daily':
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        dateFormat = 'daily';
        break;
      case 'weekly':
        groupBy = { $dateToString: { format: '%Y-W%U', date: '$createdAt' } };
        dateFormat = 'weekly';
        break;
      case 'monthly':
        groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        dateFormat = 'monthly';
        break;
      case 'yearly':
        groupBy = { $dateToString: { format: '%Y', date: '$createdAt' } };
        dateFormat = 'yearly';
        break;
      default:
        groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        dateFormat = 'monthly';
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      period: dateFormat,
      data: revenueData.map(item => ({
        period: item._id,
        revenue: item.revenue,
        orders: item.orders
      }))
    });

  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ message: 'Error fetching revenue data' });
  }
});

// Get user analytics
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const { startDate, endDate } = getDateRange(period);

    const [totalUsers, newUsers, activeUsers] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({
        role: { $ne: 'admin' },
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      User.countDocuments({
        role: { $ne: 'admin' },
        lastLogin: { $gte: startDate, $lte: endDate }
      })
    ]);

    res.json({
      totalUsers,
      newUsers,
      activeUsers,
      period
    });

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Get product analytics
router.get('/products', adminAuth, async (req, res) => {
  try {
    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      categoryDistribution
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ stock: { $lt: 10, $gt: 0 } }),
      Product.countDocuments({ stock: 0 }),
      Product.aggregate([
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
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      categoryDistribution
    });

  } catch (error) {
    console.error('Error fetching product analytics:', error);
    res.status(500).json({ message: 'Error fetching product data' });
  }
});

module.exports = router;
