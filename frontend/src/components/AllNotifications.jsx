import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import NavBar from '../navbar/NavBar';
import Footer from '../Footer/Footer';

const AllNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read, order, query, system
  const [sortBy, setSortBy] = useState('newest');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [filter, sortBy]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        ...(filter !== 'all' && filter !== 'unread' && filter !== 'read' && { type: filter }),
        ...(filter === 'unread' && { read: 'false' }),
        ...(filter === 'read' && { read: 'true' }),
        ...(sortBy === 'oldest' && { sort: 'createdAt' })
      };
      
      const response = await api.get('/api/notifications', { params });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteSelected = async () => {
    try {
      await Promise.all(selectedNotifications.map(id => api.delete(`/api/notifications/${id}`)));
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n._id)));
      setSelectedNotifications([]);
      setShowActions(false);
    } catch (error) {
      console.error('Error deleting selected notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-[#036372] to-[#1fa9be] rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        );
      case 'query':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'system':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        );
      case 'welcome':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 0015 0v5z" />
            </svg>
          </div>
        );
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notificationDate.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    if (filter === 'order') return notification.type === 'order';
    if (filter === 'query') return notification.type === 'query';
    if (filter === 'system') return notification.type === 'system' || notification.type === 'welcome';
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#e0f7fa] to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <NavBar />
        <div className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#036372]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#e0f7fa] to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <NavBar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-[#036372] dark:text-[#1fa9be] mb-4">
            All Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Stay updated with your orders, queries, and important announcements
          </p>
        </motion.div>

        {/* Filters and Actions */}
        <motion.div
          className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: notifications.filter(n => !n.isRead).length },
                { key: 'order', label: 'Orders', count: notifications.filter(n => n.type === 'order').length },
                { key: 'query', label: 'Queries', count: notifications.filter(n => n.type === 'query').length },
                { key: 'system', label: 'System', count: notifications.filter(n => n.type === 'system' || n.type === 'welcome').length }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    filter === key
                      ? 'bg-[#036372] text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#e0f7fa] dark:hover:bg-gray-600'
                  }`}
                >
                  {label} {count > 0 && <span className="ml-1">({count})</span>}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="unread">Unread First</option>
              </select>
              
              {notifications.some(n => !n.isRead) && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-[#036372] hover:bg-[#1fa9be] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Mark All Read
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <motion.div
                className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 0015 0v5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  No notifications found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {filter === 'all' 
                    ? "You're all caught up! We'll notify you when something important happens."
                    : `No ${filter} notifications at the moment.`
                  }
                </p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${
                    !notification.isRead 
                      ? 'border-[#036372] dark:border-[#1fa9be]' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Notification Icon */}
                      {getNotificationIcon(notification.type)}
                      
                      {/* Notification Content */}
                      <div className="flex-grow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-grow">
                            <h3 className={`text-lg font-semibold mb-2 ${
                              !notification.isRead 
                                ? 'text-[#036372] dark:text-[#1fa9be]' 
                                : 'text-gray-800 dark:text-gray-200'
                            }`}>
                              {notification.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                              {notification.message}
                            </p>
                            
                            {/* Notification Meta */}
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                {notification.type}
                              </span>
                              {!notification.isRead && (
                                <span className="px-2 py-1 bg-[#036372] text-white text-xs rounded-full">
                                  New
                                </span>
                              )}
                            </div>

                            {/* Action Button */}
                            {notification.actionUrl && (
                              <div className="mt-4">
                                <Link
                                  to={notification.actionUrl}
                                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#036372] to-[#1fa9be] hover:from-[#1fa9be] hover:to-[#036372] text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
                                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                                >
                                  {notification.actionText || 'View Details'}
                                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                  </svg>
                                </Link>
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="p-2 text-gray-400 hover:text-[#036372] dark:hover:text-[#1fa9be] transition-colors"
                                title="Mark as read"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete notification"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>

        {/* Load More / Pagination */}
        {filteredNotifications.length > 0 && (
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <button className="px-6 py-3 bg-white dark:bg-gray-800 text-[#036372] dark:text-[#1fa9be] border-2 border-[#036372] dark:border-[#1fa9be] rounded-lg font-medium hover:bg-[#036372] hover:text-white dark:hover:bg-[#1fa9be] transition-all duration-200">
              Load More Notifications
            </button>
          </motion.div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default AllNotifications;
