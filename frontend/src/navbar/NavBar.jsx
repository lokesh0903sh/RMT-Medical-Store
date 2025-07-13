import React, { useState, useEffect } from "react";
import DropDown from "../DropDown/DropDown";
import { Link, useNavigate, useLocation } from "react-router-dom";
import NotificationBadge from "../components/Notifications/NotificationBadge";
import { useCart } from "../context/CartContext";
import { motion } from "../lib/motion";
import logoImage from "../assets/RMT_Medical_Store.png";

// CartButton Component
const CartButton = () => {
  const { toggleCart, getItemCount } = useCart();
  const itemCount = getItemCount();
  
  return (
    <motion.button
      onClick={toggleCart}
      className="relative rounded-full p-2 text-[#036372] dark:text-[#1fa9be] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      {itemCount > 0 && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
        >
          {itemCount}
        </motion.div>
      )}
    </motion.button>
  );
};

const NavBar = () => {  
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = !!localStorage.getItem("token");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const isAdmin = user && user.role === "admin";
  const [scrolled, setScrolled] = useState(false);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Set initial dark mode preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // Check if a route is active
  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === path || location.pathname === '/admin/';
    }
    if (path === '/orders') {
      return location.pathname === path || location.pathname.startsWith('/orders/');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className={`w-full sticky top-0 z-50 bg-white dark:bg-gray-900 transition-all duration-300 ${
      scrolled ? 'shadow-lg shadow-primary/10 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90' : 'shadow-md'
    }`}>
      <div className="container mx-auto relative px-4 md:px-6 flex h-20 items-center justify-between">
        <div className="flex items-center">
          <Link to="/">
            <img className="h-[60px] w-auto" src={logoImage} alt="RMT Medical Store" />
          </Link>
          <div className="hidden md:ml-8 md:flex">
            <div className="flex items-center space-x-2">
              {isAdmin ? (
                // Admin Navigation
                <>
                  <Link 
                    to="/admin"
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                      isActive('/admin') 
                        ? 'text-white bg-[#036372] dark:bg-[#1fa9be]' 
                        : 'text-[#036372] hover:text-[#1fa9be] dark:text-gray-200 dark:hover:text-white'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/admin/products"
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                      isActive('/admin/products') 
                        ? 'text-white bg-[#036372] dark:bg-[#1fa9be]' 
                        : 'text-[#036372] hover:text-[#1fa9be] dark:text-gray-200 dark:hover:text-white'
                    }`}
                  >
                    Products
                  </Link>
                  <Link 
                    to="/admin/categories"
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                      isActive('/admin/categories') 
                        ? 'text-white bg-[#036372] dark:bg-[#1fa9be]' 
                        : 'text-[#036372] hover:text-[#1fa9be] dark:text-gray-200 dark:hover:text-white'
                    }`}
                  >
                    Categories
                  </Link>
                  <Link 
                    to="/admin/orders"
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                      isActive('/admin/orders') 
                        ? 'text-white bg-[#036372] dark:bg-[#1fa9be]' 
                        : 'text-[#036372] hover:text-[#1fa9be] dark:text-gray-200 dark:hover:text-white'
                    }`}
                  >
                    Orders
                  </Link>
                  <Link 
                    to="/admin/users"
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                      isActive('/admin/users') 
                        ? 'text-white bg-[#036372] dark:bg-[#1fa9be]' 
                        : 'text-[#036372] hover:text-[#1fa9be] dark:text-gray-200 dark:hover:text-white'
                    }`}
                  >
                    Users
                  </Link>
                  <Link 
                    to="/admin/queries"
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                      isActive('/admin/queries') 
                        ? 'text-white bg-[#036372] dark:bg-[#1fa9be]' 
                        : 'text-[#036372] hover:text-[#1fa9be] dark:text-gray-200 dark:hover:text-white'
                    }`}
                  >
                    Queries
                  </Link>
                </>
              ) : (
                // Regular User Navigation
                <>
                  <DropDown />
                  <Link 
                    to="/products"
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                      isActive('/products') 
                        ? 'text-white bg-[#036372] dark:bg-[#1fa9be]' 
                        : 'text-[#036372] hover:text-[#1fa9be] dark:text-gray-200 dark:hover:text-white'
                    }`}
                  >
                    Browse Products
                  </Link>
                  {isLoggedIn && (
                    <Link 
                      to="/orders"
                      className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                        isActive('/orders') 
                          ? 'text-white bg-[#036372] dark:bg-[#1fa9be]' 
                          : 'text-[#036372] hover:text-[#1fa9be] dark:text-gray-200 dark:hover:text-white'
                      }`}
                    >
                      My Orders
                    </Link>
                  )}
                  <Link 
                    to="/about"
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                      isActive('/about') 
                        ? 'text-white bg-[#036372] dark:bg-[#1fa9be]' 
                        : 'text-[#036372] hover:text-[#1fa9be] dark:text-gray-200 dark:hover:text-white'
                    }`}
                  >
                    About
                  </Link>
                  <Link 
                    to="/contact"
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                      isActive('/contact') 
                        ? 'text-white bg-[#036372] dark:bg-[#1fa9be]' 
                        : 'text-[#036372] hover:text-[#1fa9be] dark:text-gray-200 dark:hover:text-white'
                    }`}
                  >
                    Contact Us
                  </Link>
                  <Link 
                    to="/help"
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                      isActive('/help') 
                        ? 'text-white bg-[#036372] dark:bg-[#1fa9be]' 
                        : 'text-[#036372] hover:text-[#1fa9be] dark:text-gray-200 dark:hover:text-white'
                    }`}
                  >
                    Help Desk
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="hidden md:flex rounded-md border-2 border-[#036372] dark:border-[#1fa9be] overflow-hidden w-[300px] lg:w-[400px] transition-all">
            <input 
              type="text" 
              placeholder={isAdmin ? "Search products, users, orders..." : "Search for Life Savings..."} 
              className="w-full outline-none bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm px-4 py-2.5"
            />
            <button type='button' className="flex items-center justify-center bg-[#036372] dark:bg-[#1fa9be] hover:bg-[#1fa9be] dark:hover:bg-[#036372] px-4 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18px" height="18px" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="stroke-white">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="relative rounded-full p-2 text-[#036372] dark:text-[#1fa9be] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            ) : (
              <svg xmlns="http  ://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}          </button>
          {/* Cart Button - Only show for regular users */}
          {!isAdmin && <CartButton />}

          {/* Notification Badge */}
          {isLoggedIn && (
            <NotificationBadge />
          )}

          {/* Auth Buttons */}
          <div className="flex items-center gap-2 ml-2">
            {!isLoggedIn ? (
              <>
                <Link 
                  to="/login" 
                  className="rounded-md px-4 py-2 text-sm font-semibold text-[#036372] dark:text-[#1fa9be] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="rounded-md px-4 py-2 text-sm font-semibold text-white bg-[#036372] dark:bg-[#1fa9be] hover:bg-[#1fa9be] dark:hover:bg-[#036372] shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </>
            ) : (              <div className="flex items-center gap-3">
                <div className="hidden md:block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Welcome back{user && user.name ? `, ${user.name.split(' ')[0]}` : ''}
                    {isAdmin && <span className="ml-2 px-2 py-1 text-xs bg-[#036372] text-white rounded-full">Admin</span>}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-md px-4 py-2 text-sm font-semibold text-white bg-[#036372] dark:bg-[#1fa9be] hover:bg-[#1fa9be] dark:hover:bg-[#036372] shadow-sm transition-all"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-md p-2 text-[#036372] dark:text-[#1fa9be]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-700 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              {isAdmin ? (
                // Admin Mobile Navigation
                <>
                  <Link 
                    to="/admin"
                    className="block px-3 py-2 text-base font-medium text-[#036372] dark:text-gray-200 hover:text-[#1fa9be] dark:hover:text-white rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/admin/products"
                    className="block px-3 py-2 text-base font-medium text-[#036372] dark:text-gray-200 hover:text-[#1fa9be] dark:hover:text-white rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Products
                  </Link>
                  <Link 
                    to="/admin/categories"
                    className="block px-3 py-2 text-base font-medium text-[#036372] dark:text-gray-200 hover:text-[#1fa9be] dark:hover:text-white rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Categories
                  </Link>
                  <Link 
                    to="/admin/orders"
                    className="block px-3 py-2 text-base font-medium text-[#036372] dark:text-gray-200 hover:text-[#1fa9be] dark:hover:text-white rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <Link 
                    to="/admin/users"
                    className="block px-3 py-2 text-base font-medium text-[#036372] dark:text-gray-200 hover:text-[#1fa9be] dark:hover:text-white rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Users
                  </Link>
                  <Link 
                    to="/admin/queries"
                    className="block px-3 py-2 text-base font-medium text-[#036372] dark:text-gray-200 hover:text-[#1fa9be] dark:hover:text-white rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Queries
                  </Link>
                </>
              ) : (
                // Regular User Mobile Navigation
                <>
                  <Link 
                    to="/products"
                    className="block px-3 py-2 text-base font-medium text-[#036372] dark:text-gray-200 hover:text-[#1fa9be] dark:hover:text-white rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Browse Products
                  </Link>
                  {isLoggedIn && (
                    <Link 
                      to="/orders"
                      className="block px-3 py-2 text-base font-medium text-[#036372] dark:text-gray-200 hover:text-[#1fa9be] dark:hover:text-white rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                  )}
                  <Link 
                    to="/about"
                    className="block px-3 py-2 text-base font-medium text-[#036372] dark:text-gray-200 hover:text-[#1fa9be] dark:hover:text-white rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link 
                    to="/contact"
                    className="block px-3 py-2 text-base font-medium text-[#036372] dark:text-gray-200 hover:text-[#1fa9be] dark:hover:text-white rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact Us
                  </Link>
                  <Link 
                    to="/help"
                    className="block px-3 py-2 text-base font-medium text-[#036372] dark:text-gray-200 hover:text-[#1fa9be] dark:hover:text-white rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Help Desk
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;