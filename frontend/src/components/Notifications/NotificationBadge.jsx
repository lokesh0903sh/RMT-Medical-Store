import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from '../../lib/motion';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';

const NotificationBadge = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Add event listener to close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/api/notifications/count`, {
        headers: { 
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Error fetching notification count:', err);
      setError('Could not load notifications');
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/api/notifications?limit=5`, {
        headers: { 
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Could not load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDropdown = () => {
    if (!isOpen && !notifications.length) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 
          'x-auth-token': token,
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update UI
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id 
            ? { ...notif, isRead: true, readAt: new Date().toISOString() } 
            : notif
        )
      );
      
      // Reduce unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today, show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get badge background color based on notification type
  const getTypeBgColor = (type) => {
    switch (type) {
      case 'info': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button 
        onClick={handleToggleDropdown}
        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-500 text-xs font-medium text-white rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            
            <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-t-[#036372] border-r-[#036372] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">{error}</div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p>No notifications yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <li 
                      key={notification._id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                      {/* Type indicator dot */}
                      <div className={`absolute left-4 top-5 w-2 h-2 rounded-full ${getTypeBgColor(notification.type)}`}></div>
                      
                      <div className="ml-4">
                        {/* Title with timestamp */}
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        
                        {/* Message */}
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        {/* Actions */}
                        <div className="flex justify-end">
                          {!notification.isRead && (
                            <button 
                              onClick={() => markAsRead(notification._id)}
                              className="text-xs text-[#1fa9be] hover:text-[#036372] transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                          
                          {notification.link && (
                            <a 
                              href={notification.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-[#1fa9be] hover:text-[#036372] transition-colors ml-4"
                              onClick={() => !notification.isRead && markAsRead(notification._id)}
                            >
                              View details
                            </a>
                          )}
                        </div>
                        
                        {/* Unread indicator */}
                        {!notification.isRead && (
                          <div className="absolute right-2 top-2 w-2 h-2 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
              <Link
                to="/notifications"
                className="text-sm text-[#036372] hover:text-[#1fa9be] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBadge;
