import React, { useEffect, useState } from 'react';
import { motion } from '../../lib/motion';
import axios from 'axios';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState({
    stats: {
      totalProducts: 0,
      totalCategories: 0,
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      lowStockProducts: 0,
      pendingQueries: 0
    },
    recentOrders: [],
    topProducts: []
  });
  
  const [salesData, setSalesData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchSalesData(selectedPeriod);
    
    // Set up real-time data fetching every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchSalesData(selectedPeriod);
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/analytics/dashboard', {
        headers: { 'x-auth-token': token }
      });
      
      setAnalytics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchSalesData = async (period) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`http://localhost:5000/api/analytics/sales/${period}`, {
        headers: { 'x-auth-token': token }
      });
      
      setSalesData(response.data.salesData);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const formatSalesData = () => {
    return salesData.map(item => {
      let label = '';
      if (selectedPeriod === 'daily') {
        label = `${item._id.day}/${item._id.month}`;
      } else if (selectedPeriod === 'weekly') {
        label = `Week ${item._id.week}`;
      } else if (selectedPeriod === 'monthly') {
        label = `${item._id.month}/${item._id.year}`;
      } else {
        label = item._id.year.toString();
      }
      return {
        label,
        sales: item.totalSales,
        orders: item.orderCount
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#036372]"></div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-[#036372] to-[#1fa9be] text-white p-6 rounded-lg shadow-lg"
      >
        <h1 className="text-2xl font-semibold">Welcome to RMT Medical Store Admin</h1>
        <p className="mt-2 opacity-90">Real-time analytics and store management dashboard</p>
      </motion.div>

      {/* Stats Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Overview</h2>
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-t-4 border-blue-600"
          >
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</p>
                <p className="text-3xl font-bold text-gray-700 dark:text-white mt-1">{analytics.stats.totalProducts}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-t-4 border-green-600"
          >
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-gray-700 dark:text-white mt-1">{analytics.stats.totalUsers}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-t-4 border-indigo-600"
          >
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
                <p className="text-3xl font-bold text-gray-700 dark:text-white mt-1">{analytics.stats.totalOrders}</p>
              </div>
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-t-4 border-purple-600"
          >
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</p>
                <p className="text-3xl font-bold text-gray-700 dark:text-white mt-1">₹{analytics.stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-4 rounded-lg border-l-4 ${analytics.stats.lowStockProducts > 0 ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`}
        >
          <div className="flex items-center">
            <div className={`p-2 rounded ${analytics.stats.lowStockProducts > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Low Stock Alert</p>
              <p className="text-lg font-bold text-gray-800">{analytics.stats.lowStockProducts} products</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-4 rounded-lg border-l-4 ${analytics.stats.pendingQueries > 0 ? 'bg-yellow-50 border-yellow-500' : 'bg-green-50 border-green-500'}`}
        >
          <div className="flex items-center">
            <div className={`p-2 rounded ${analytics.stats.pendingQueries > 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Pending Queries</p>
              <p className="text-lg font-bold text-gray-800">{analytics.stats.pendingQueries} queries</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sales Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Sales Analytics</h3>
        
        <div className="mb-4">
          <div className="flex space-x-2">
            {['daily', 'weekly', 'monthly', 'yearly'].map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period 
                    ? 'bg-[#036372] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          {formatSalesData().length > 0 ? (
            <div className="w-full h-full p-4">
              <div className="flex items-end justify-between h-40 space-x-2">
                {formatSalesData().slice(-10).map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="bg-[#036372] rounded-t-md w-full transition-all duration-300 hover:bg-[#1fa9be]"
                      style={{ 
                        height: `${Math.max(10, (item.sales / Math.max(...formatSalesData().map(d => d.sales))) * 100)}%`,
                        minHeight: '10px'
                      }}
                      title={`₹${item.sales.toLocaleString()}`}
                    />
                    <span className="text-xs mt-2 text-gray-600 transform -rotate-45 origin-left">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No sales data available</p>
          )}
        </div>
      </motion.div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {analytics.recentOrders.length > 0 ? (
              analytics.recentOrders.map(order => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{order.user?.name || 'Unknown User'}</p>
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} items • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#036372]">₹{order.totalAmount?.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No recent orders</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {analytics.topProducts.length > 0 ? (
              analytics.topProducts.map((item, index) => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="bg-[#036372] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{item.product?.name || 'Unknown Product'}</p>
                      <p className="text-sm text-gray-600">{item.totalSold} sold</p>
                    </div>
                  </div>
                  <p className="font-bold text-[#036372]">₹{item.revenue?.toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No sales data available</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <a href="/admin/products/new" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-[#036372] hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="rounded-full bg-[#e0f7fa] p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#036372" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Add Product</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Create new listing</p>
              </div>
            </div>
          </a>
          
          <a href="/admin/users" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-[#1fa9be] hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="rounded-full bg-[#e0f7fa] p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1fa9be" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Manage Users</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">User management</p>
              </div>
            </div>
          </a>
          
          <a href="/admin/queries" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-amber-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="rounded-full bg-amber-100 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(245, 158, 11)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">User Queries</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Help desk</p>
              </div>
            </div>
          </a>

          <a href="/admin/settings" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(168, 85, 247)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Settings</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">System config</p>
              </div>
            </div>
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
