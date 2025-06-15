import React, { useEffect, useState } from 'react';
import { motion } from '../../lib/motion';

const StatCard = ({ title, value, icon, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-t-4 ${color}`}
  >
    <div className="p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-700 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-600', '-100')} ${color.replace('border-', 'text-')}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalOrders: 0,
    lowStock: 0,
    revenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Fetch products count
        const productsRes = await fetch('http://localhost:5000/api/products?limit=1', {
          headers: { 'x-auth-token': token }
        });
        const productsData = await productsRes.json();
        
        // Fetch categories
        const categoriesRes = await fetch('http://localhost:5000/api/categories', {
          headers: { 'x-auth-token': token }
        });
        const categoriesData = await categoriesRes.json();
        
        // In a real app, you would fetch other statistics like orders, users, etc.
        // For now, we'll set some demo data
        
        setStats({
          totalProducts: productsData.pagination?.total || 0,
          totalCategories: categoriesData.length || 0,
          totalUsers: 42, // Demo data
          totalOrders: 156, // Demo data
          lowStock: 5, // Demo data
          revenue: 25840 // Demo data in INR
        });
        
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    
    fetchStats();
  }, []);

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
        <p className="mt-2 opacity-90">Manage your products, categories, and orders from this dashboard.</p>
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
          <StatCard 
            title="Total Products" 
            value={stats.totalProducts} 
            color="border-blue-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            }
          />
          <StatCard 
            title="Total Categories" 
            value={stats.totalCategories} 
            color="border-indigo-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
            }
          />
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            color="border-green-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            }
          />
          <StatCard 
            title="Revenue" 
            value={`₹${stats.revenue.toLocaleString()}`} 
            color="border-purple-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            }
          />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/admin/products/new" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-[#036372] hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="rounded-full bg-[#e0f7fa] p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#036372" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Add New Product</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Create a new product listing</p>
              </div>
            </div>
          </a>
          
          <a href="/admin/categories/new" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-[#1fa9be] hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="rounded-full bg-[#e0f7fa] p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1fa9be" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Add Category</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Create a new product category</p>
              </div>
            </div>
          </a>
          
          <a href="/admin/notifications/new" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-amber-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="rounded-full bg-amber-100 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(245, 158, 11)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Create Notification</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Send notifications to users</p>
              </div>
            </div>
          </a>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { action: 'New product added', item: 'Paracetamol 500mg', time: '15 minutes ago', user: 'Admin' },
              { action: 'Category updated', item: 'Ayurvedic', time: '2 hours ago', user: 'Admin' },
              { action: 'New user registered', item: 'John Doe', time: '3 hours ago', user: 'System' },
              { action: 'Low stock alert', item: 'Ashwagandha', time: '5 hours ago', user: 'System' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="h-10 w-10 rounded-full bg-[#e0f7fa] flex items-center justify-center text-[#036372] mr-4">
                  {activity.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-white font-medium">{activity.action}: <span className="text-[#1fa9be]">{activity.item}</span></p>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">by {activity.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
