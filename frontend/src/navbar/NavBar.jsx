import React, { useState, useEffect } from "react";
import DropDown from "../DropDown/DropDown";
import { Link, useNavigate, useLocation } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const isLoggedIn = !!localStorage.getItem("token");
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
    navigate("/login");
  };

  // Check if a route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`w-full sticky top-0 z-50 bg-white dark:bg-gray-900 transition-all duration-300 ${
      scrolled ? 'shadow-lg shadow-primary/10 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90' : 'shadow-md'
    }`}>
      <div className="container mx-auto relative px-4 md:px-6 flex h-20 items-center justify-between">
        <div className="flex items-center">
          <Link to="/">
            <img className="h-[60px] w-auto" src="./src/assets/RMT_Medical_Store.png" alt="RMT Medical Store" />
          </Link>
          <div className="hidden md:ml-8 md:flex">
            <div className="flex space-x-1">
              <DropDown />
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
            </div>
          </div>
        </div>        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="hidden md:flex rounded-md border-2 border-[#036372] dark:border-[#1fa9be] overflow-hidden w-[300px] lg:w-[400px] transition-all">
            <input 
              type="text" 
              placeholder="Search for Life Savings..." 
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
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            className="relative rounded-full p-2 text-[#036372] dark:text-[#1fa9be] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="View notifications"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">2</span>
          </button>

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
            ) : (
              <div className="flex items-center gap-3">
                <div className="hidden md:block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Welcome back</span>
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
          <button className="md:hidden rounded-md p-2 text-[#036372] dark:text-[#1fa9be]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;