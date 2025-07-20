import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Use VITE_API_BASE_URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalProducts: 0,
      totalUsers: 0,
      totalRevenue: 0,
      totalOrders: 0
    },
    growth: {
      products: 0,
      users: 0,
      revenue: 0,
      orders: 0
    },
    topProducts: [],
    alerts: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/analytics/dashboard?period=${selectedPeriod}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const data = await response.json();
      setAnalytics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return '↗';
    if (growth < 0) return '↘';
    return '→';
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#036372]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Real-time Status */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-[#036372] to-[#1fa9be] text-white p-6 rounded-lg shadow-lg"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">RMT Medical Store Admin Dashboard</h1>
            <p className="mt-2 opacity-90">Real-time analytics and store management</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">Last updated</p>
            <p className="text-sm font-medium">{formatDateTime(lastUpdated)}</p>
            <div className="flex items-center mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm">Live</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Analytics Overview</h2>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 
                   focus:ring-[#036372] focus:border-transparent"
        >
          <option value="all">All Time</option>
          <option value="daily">Today</option>
          <option value="weekly">This Week</option>
          <option value="monthly">This Month</option>
          <option value="yearly">This Year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total Products */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-t-4 border-blue-600"
        >
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</p>
              <p className="text-3xl font-bold text-gray-700 dark:text-white mt-1">{analytics.overview.totalProducts}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active inventory</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Total Users */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-t-4 border-green-600"
        >
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-gray-700 dark:text-white mt-1">{analytics.overview.totalUsers}</p>
              <div className="flex items-center mt-1">
                <span className={`text-sm ${getGrowthColor(analytics.growth.users)}`}>
                  {getGrowthIcon(analytics.growth.users)} {Math.abs(analytics.growth.users)}%
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Total Revenue */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-t-4 border-yellow-600"
        >
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-700 dark:text-white mt-1">{formatCurrency(analytics.overview.totalRevenue)}</p>
              <div className="flex items-center mt-1">
                <span className={`text-sm ${getGrowthColor(analytics.growth.revenue)}`}>
                  {getGrowthIcon(analytics.growth.revenue)} {Math.abs(analytics.growth.revenue)}%
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Total Orders */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-t-4 border-purple-600"
        >
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
              <p className="text-3xl font-bold text-gray-700 dark:text-white mt-1">{analytics.overview.totalOrders}</p>
              <div className="flex items-center mt-1">
                <span className={`text-sm ${getGrowthColor(analytics.growth.orders)}`}>
                  {getGrowthIcon(analytics.growth.orders)} {Math.abs(analytics.growth.orders)}%
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Alerts Section */}
      {analytics.alerts && analytics.alerts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {analytics.alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                alert.type === 'warning' 
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 text-orange-800 dark:text-orange-200' 
                  : alert.type === 'info'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 text-blue-800 dark:text-blue-200'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-800 dark:text-red-200'
              }`}
            >
              <div className="flex">
                <div className="flex-1">
                  <h4 className="font-medium">{alert.title}</h4>
                  <p className="text-sm mt-1">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Top Products Section */}
      {analytics.topProducts && analytics.topProducts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Top Selling Products</h3>
          <div className="space-y-4">
            {analytics.topProducts.map((product, index) => (
              <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#036372] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{product.sold} sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(product.revenue)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
