import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from '../../lib/motion';
import { toast } from 'react-toastify';

const AdminLayout = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const checkAdmin = async () => {
      try {
        const response = await fetch('https://rmt-medical-store.vercel.app//api/auth/me', {
          headers: {
            'x-auth-token': token
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to authenticate');
        }
        
        const userData = await response.json();
        if (userData.role !== 'admin') {
          toast.error('Admin access required');
          navigate('/');
        } else {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Auth error:', error);
        toast.error('Authentication failed');
        navigate('/login');
      }
    };
    
    checkAdmin();
  }, [navigate]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (!isAdmin) {
    return <div className="flex justify-center items-center h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-16 h-16 border-4 border-t-4 border-[#036372] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-semibold text-gray-700">Verifying admin access...</p>
      </motion.div>
    </div>;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? '250px' : '80px' }}
        className="bg-[#036372] dark:bg-gray-800 text-white flex flex-col"
      >
        {/* Logo and Toggle */}
        <div className="flex items-center p-4 h-20 border-b border-[#1fa9be]/20">
          {isOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center"
            >
              <img src="/src/assets/RMT_Medical_Store_Transparent.png" alt="Logo" className="h-10 w-auto mr-2" />
              <span className="text-lg font-bold text-white">Admin Panel</span>
            </motion.div>
          ) : (
            <img src="/src/assets/RMT_Medical_Store_Transparent.png" alt="Logo" className="h-10 w-auto mx-auto" />
          )}
          <button
            onClick={toggleSidebar}
            className={`text-white ${isOpen ? 'ml-auto' : 'mx-auto mt-4'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isOpen ? (
                <path d="M15 18l-6-6 6-6" />
              ) : (
                <path d="M9 18l6-6-6-6" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-3">
            {[
              { path: '/admin', icon: 'grid', label: 'Dashboard' },
              { path: '/admin/products', icon: 'package', label: 'Products' },
              { path: '/admin/categories', icon: 'folder', label: 'Categories' },
              { path: '/admin/orders', icon: 'shopping-bag', label: 'Orders' },
              { path: '/admin/users', icon: 'users', label: 'Users' },
              { path: '/admin/notifications', icon: 'bell', label: 'Notifications' },
              { path: '/admin/settings', icon: 'settings', label: 'Settings' },
            ].map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) => `
                    flex items-center p-3 rounded-lg mb-1
                    ${isActive ? 'bg-[#1fa9be] shadow-md' : 'hover:bg-[#1fa9be]/50 transition-colors'}
                  `}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    {item.icon === 'grid' && (
                      <>
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </>
                    )}
                    {item.icon === 'package' && (
                      <>
                        <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z"></path>
                        <polyline points="2.32 6.16 12 11 21.68 6.16"></polyline>
                        <line x1="12" y1="22.76" x2="12" y2="11"></line>
                        <line x1="7" y1="3.5" x2="17" y2="8.5"></line>
                      </>
                    )}
                    {item.icon === 'folder' && (
                      <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></>
                    )}
                    {item.icon === 'shopping-bag' && (
                      <>
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </>
                    )}
                    {item.icon === 'users' && (
                      <>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </>
                    )}
                    {item.icon === 'bell' && (
                      <>
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </>
                    )}
                    {item.icon === 'settings' && (
                      <>
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </>
                    )}
                  </svg>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="ml-3"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto p-4 border-t border-[#1fa9be]/20">
          <NavLink to="/" className="flex items-center p-2 hover:bg-[#1fa9be]/50 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            {isOpen && <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="ml-3"
            >
              View Store
            </motion.span>}
          </NavLink>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center p-2 hover:bg-[#1fa9be]/50 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            {isOpen && <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="ml-3"
            >
              Logout
            </motion.span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => document.documentElement.classList.toggle('dark')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-300">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              </button>
              
              {/* Notifications */}
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <span className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-300">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                    3
                  </span>
                </span>
              </button>
              
              {/* Admin Profile */}
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src="/src/assets/RMT_Medical_Store_Transparent.png"
                  alt="Admin"
                />
                <span className="ml-2 font-medium text-gray-700 dark:text-gray-200">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area with Outlet */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
